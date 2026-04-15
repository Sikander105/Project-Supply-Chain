from collections.abc import Callable
from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.product import Product
from app.models.purchase_order import PurchaseOrder
from app.models.shipment import Shipment
from app.models.vendor import Vendor
from app.models.warehouse import Warehouse

ModelType = Product | Vendor | Warehouse | PurchaseOrder | Shipment

_MODEL_MAP: dict[str, type[ModelType]] = {
    "products": Product,
    "vendors": Vendor,
    "warehouses": Warehouse,
    "purchaseOrders": PurchaseOrder,
    "shipments": Shipment,
}


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


def _get_attr(obj: object, *names: str, default=None):
    for n in names:
        if hasattr(obj, n):
            v = getattr(obj, n)
            return v if v is not None else default
    return default


def _set_attr(obj: object, value, *names: str) -> None:
    for n in names:
        if hasattr(obj, n):
            setattr(obj, n, value)
            return


def _next_sku() -> str:
    return f"SKU-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def _next_po_number() -> str:
    return f"PO-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def _next_shipment_number() -> str:
    return f"SHP-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3]}"


def _to_api(entity: str, row: ModelType) -> dict:
    if entity == "products":
        return {
            "id": _get_attr(row, "id"),
            "name": _get_attr(row, "name"),
            "category": _get_attr(row, "category", default="General"),
            "stock": _get_attr(row, "stock", "quantity", default=0),
            "price": _get_attr(row, "price", default=0),
            "reorderLevel": _get_attr(row, "reorder_level", default=0),
            "warehouseId": _get_attr(row, "warehouse_id", default=""),
            "sku": _get_attr(row, "sku"),
            "status": _get_attr(row, "status"),
        }

    if entity == "vendors":
        return {
            "id": _get_attr(row, "id"),
            "name": _get_attr(row, "name"),
            "contactPerson": _get_attr(row, "contact_person", "contact_name", default=""),
            "phone": _get_attr(row, "phone", default=""),
            "email": _get_attr(row, "email", default=""),
        }

    if entity == "warehouses":
        return {
            "id": _get_attr(row, "id"),
            "name": _get_attr(row, "name"),
            "location": _get_attr(row, "location", default=""),
            "capacity": _get_attr(row, "capacity", default=0),
            "currentUsage": _get_attr(row, "current_usage", default=0),
        }

    if entity == "purchaseOrders":
        created_date = _get_attr(row, "created_date")
        return {
            "id": _get_attr(row, "id"),
            "vendorId": _get_attr(row, "vendor_id"),
            "productId": _get_attr(row, "product_id"),
            "quantity": _get_attr(row, "quantity", default=0),
            "status": _get_attr(row, "status", default="Active"),
            "createdDate": created_date.isoformat() if created_date else None,
            "poNumber": _get_attr(row, "po_number"),
        }

    if entity == "shipments":
        received_date = _get_attr(row, "received_date")
        return {
            "id": _get_attr(row, "id"),
            "productId": _get_attr(row, "product_id"),
            "warehouseId": _get_attr(row, "warehouse_id"),
            "quantity": _get_attr(row, "quantity", default=0),
            "receivedDate": received_date.isoformat() if received_date else None,
            "status": _get_attr(row, "status", default="Pending"),
            "shipmentNumber": _get_attr(row, "shipment_number"),
        }

    raise KeyError(f"Unknown entity: {entity}")


def _new_instance(entity: str, payload: dict) -> ModelType:
    if entity == "products":
        return Product(
            id=payload.get("id") or uuid4().hex,
            name=payload["name"],
            sku=payload.get("sku") or _next_sku(),
            status=payload.get("status") or "active",
            category=payload.get("category") or "General",
            stock=payload.get("stock", 0),
            price=payload.get("price", 0),
            reorder_level=payload.get("reorderLevel", 0),
            warehouse_id=payload.get("warehouseId", ""),
        )

    if entity == "vendors":
        v = Vendor(
            id=payload.get("id") or uuid4().hex,
            name=payload["name"],
            phone=payload.get("phone"),
            email=payload.get("email"),
        )
        _set_attr(v, payload.get("contactPerson", ""), "contact_person", "contact_name")
        return v

    if entity == "warehouses":
        return Warehouse(
            id=payload.get("id") or uuid4().hex,
            name=payload["name"],
            location=payload.get("location", ""),
            capacity=payload.get("capacity", 0),
            current_usage=payload.get("currentUsage", 0),
        )

    if entity == "purchaseOrders":
        return PurchaseOrder(
            id=payload.get("id") or uuid4().hex,
            po_number=payload.get("poNumber") or _next_po_number(),
            vendor_id=payload["vendorId"],
            product_id=payload["productId"],
            quantity=payload["quantity"],
            status=payload.get("status", "Active"),
            created_date=_parse_date(payload.get("createdDate")),
        )

    if entity == "shipments":
        return Shipment(
            id=payload.get("id") or uuid4().hex,
            shipment_number=payload.get("shipmentNumber") or _next_shipment_number(),
            product_id=payload["productId"],
            warehouse_id=payload["warehouseId"],
            quantity=payload["quantity"],
            received_date=_parse_date(payload.get("receivedDate")),
            status=payload.get("status", "Pending"),
        )

    raise KeyError(f"Unknown entity: {entity}")


def _apply_payload(entity: str, obj: ModelType, payload: dict) -> None:
    if entity == "products":
        for k, v in (
            ("name", payload.get("name")),
            ("status", payload.get("status")),
            ("category", payload.get("category")),
            ("stock", payload.get("stock")),
            ("price", payload.get("price")),
            ("reorder_level", payload.get("reorderLevel")),
            ("warehouse_id", payload.get("warehouseId")),
            ("sku", payload.get("sku")),
        ):
            if v is not None:
                setattr(obj, k, v)
        return

    if entity == "vendors":
        if payload.get("name") is not None:
            obj.name = payload["name"]
        if payload.get("contactPerson") is not None:
            _set_attr(obj, payload.get("contactPerson"), "contact_person", "contact_name")
        if payload.get("phone") is not None:
            obj.phone = payload["phone"]
        if payload.get("email") is not None:
            obj.email = payload["email"]
        return

    if entity == "warehouses":
        for k, v in (
            ("name", payload.get("name")),
            ("location", payload.get("location")),
            ("capacity", payload.get("capacity")),
            ("current_usage", payload.get("currentUsage")),
        ):
            if v is not None:
                setattr(obj, k, v)
        return

    if entity == "purchaseOrders":
        if payload.get("poNumber"):
            obj.po_number = payload["poNumber"]
        for k, v in (
            ("vendor_id", payload.get("vendorId")),
            ("product_id", payload.get("productId")),
            ("quantity", payload.get("quantity")),
            ("status", payload.get("status")),
        ):
            if v is not None:
                setattr(obj, k, v)
        if "createdDate" in payload:
            obj.created_date = _parse_date(payload.get("createdDate"))
        return

    if entity == "shipments":
        if payload.get("shipmentNumber"):
            obj.shipment_number = payload["shipmentNumber"]
        for k, v in (
            ("product_id", payload.get("productId")),
            ("warehouse_id", payload.get("warehouseId")),
            ("quantity", payload.get("quantity")),
            ("status", payload.get("status")),
        ):
            if v is not None:
                setattr(obj, k, v)
        if "receivedDate" in payload:
            obj.received_date = _parse_date(payload.get("receivedDate"))
        return


def list_items(entity: str):
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        rows = db.execute(select(model)).scalars().all()
        return [_to_api(entity, r) for r in rows]


def list_items(entity: str, user_id: str):
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        rows = db.execute(
            select(model).where(model.owner_id == user_id)
        ).scalars().all()
        return [_to_api(entity, r) for r in rows]


def get_item(entity: str, item_id: str):
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        row = db.get(model, item_id)
        return _to_api(entity, row) if row else None


def get_item(entity: str, item_id: str, user_id: str):
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        row = db.execute(
            select(model).where(model.id == item_id, model.owner_id == user_id)
        ).scalar_one_or_none()
        return _to_api(entity, row) if row else None


def create_item(entity: str, payload: dict):
    with SessionLocal() as db:
        obj = _new_instance(entity, payload)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return _to_api(entity, obj)


def create_item(entity: str, payload: dict, user_id: str):
    with SessionLocal() as db:
        obj = _new_instance(entity, payload)
        if hasattr(obj, "owner_id"):
            obj.owner_id = user_id
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return _to_api(entity, obj)


def update_item(entity: str, item_id: str, payload: dict):
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        obj = db.get(model, item_id)
        if not obj:
            return None
        _apply_payload(entity, obj, payload)
        db.commit()
        db.refresh(obj)
        return _to_api(entity, obj)


def update_item(entity: str, item_id: str, payload: dict, user_id: str):
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        obj = db.execute(
            select(model).where(model.id == item_id, model.owner_id == user_id)
        ).scalar_one_or_none()
        if not obj:
            return None
        _apply_payload(entity, obj, payload)
        db.commit()
        db.refresh(obj)
        return _to_api(entity, obj)


def delete_item(entity: str, item_id: str) -> bool:
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        obj = db.get(model, item_id)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True


def delete_item(entity: str, item_id: str, user_id: str) -> bool:
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        obj = db.execute(
            select(model).where(model.id == item_id, model.owner_id == user_id)
        ).scalar_one_or_none()
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True


def get_store_snapshot():
    return {
        "products": list_items("products"),
        "vendors": list_items("vendors"),
        "warehouses": list_items("warehouses"),
        "purchaseOrders": list_items("purchaseOrders"),
        "shipments": list_items("shipments"),
    }


def get_store_snapshot(user_id: str):
    return {
        "products": list_items("products", user_id),
        "vendors": list_items("vendors", user_id),
        "warehouses": list_items("warehouses", user_id),
        "purchaseOrders": list_items("purchaseOrders", user_id),
        "shipments": list_items("shipments", user_id),
    }