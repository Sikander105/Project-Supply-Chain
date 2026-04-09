from collections.abc import Callable
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

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


def _ensure_entity(entity: str) -> None:
    if entity not in _MODEL_MAP:
        raise KeyError(f"Unknown entity: {entity}")


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


def _to_api(entity: str, row: ModelType) -> dict:
    if entity == "products":
        return {
            "id": row.id,
            "name": row.name,
            "category": row.category,
            "stock": row.stock,
            "price": row.price,
            "reorderLevel": row.reorder_level,
            "warehouseId": row.warehouse_id,
        }

    if entity == "vendors":
        return {
            "id": row.id,
            "name": row.name,
            "contactPerson": row.contact_person,
            "phone": row.phone,
            "email": row.email,
        }

    if entity == "warehouses":
        return {
            "id": row.id,
            "name": row.name,
            "location": row.location,
            "capacity": row.capacity,
            "currentUsage": row.current_usage,
        }

    if entity == "purchaseOrders":
        return {
            "id": row.id,
            "vendorId": row.vendor_id,
            "productId": row.product_id,
            "quantity": row.quantity,
            "status": row.status,
            "createdDate": row.created_date.isoformat() if row.created_date else None,
        }

    if entity == "shipments":
        return {
            "id": row.id,
            "productId": row.product_id,
            "warehouseId": row.warehouse_id,
            "quantity": row.quantity,
            "receivedDate": row.received_date.isoformat() if row.received_date else None,
            "status": row.status,
        }

    raise KeyError(f"Unknown entity: {entity}")


def _apply_payload(entity: str, obj: ModelType, payload: dict) -> None:
    if entity == "products":
        obj.name = payload.get("name", obj.name)
        obj.category = payload.get("category", obj.category)
        obj.stock = payload.get("stock", obj.stock)
        obj.price = payload.get("price", obj.price)
        obj.reorder_level = payload.get("reorderLevel", obj.reorder_level)
        obj.warehouse_id = payload.get("warehouseId", obj.warehouse_id)
        return

    if entity == "vendors":
        obj.name = payload.get("name", obj.name)
        obj.contact_person = payload.get("contactPerson", obj.contact_person)
        obj.phone = payload.get("phone", obj.phone)
        obj.email = payload.get("email", obj.email)
        return

    if entity == "warehouses":
        obj.name = payload.get("name", obj.name)
        obj.location = payload.get("location", obj.location)
        obj.capacity = payload.get("capacity", obj.capacity)
        obj.current_usage = payload.get("currentUsage", obj.current_usage)
        return

    if entity == "purchaseOrders":
        obj.vendor_id = payload.get("vendorId", obj.vendor_id)
        obj.product_id = payload.get("productId", obj.product_id)
        obj.quantity = payload.get("quantity", obj.quantity)
        obj.status = payload.get("status", obj.status)
        if "createdDate" in payload:
            obj.created_date = _parse_date(payload.get("createdDate"))
        return

    if entity == "shipments":
        obj.product_id = payload.get("productId", obj.product_id)
        obj.warehouse_id = payload.get("warehouseId", obj.warehouse_id)
        obj.quantity = payload.get("quantity", obj.quantity)
        obj.status = payload.get("status", obj.status)
        if "receivedDate" in payload:
            obj.received_date = _parse_date(payload.get("receivedDate"))
        return


def _new_instance(entity: str, payload: dict) -> ModelType:
    if entity == "products":
        return Product(
            name=payload["name"],
            category=payload["category"],
            stock=payload["stock"],
            price=payload["price"],
            reorder_level=payload["reorderLevel"],
            warehouse_id=payload["warehouseId"],
        )
    if entity == "vendors":
        return Vendor(
            name=payload["name"],
            contact_person=payload["contactPerson"],
            phone=payload["phone"],
            email=payload["email"],
        )
    if entity == "warehouses":
        return Warehouse(
            name=payload["name"],
            location=payload["location"],
            capacity=payload["capacity"],
            current_usage=payload["currentUsage"],
        )
    if entity == "purchaseOrders":
        return PurchaseOrder(
            vendor_id=payload["vendorId"],
            product_id=payload["productId"],
            quantity=payload["quantity"],
            status=payload["status"],
            created_date=_parse_date(payload["createdDate"]),
        )
    if entity == "shipments":
        return Shipment(
            product_id=payload["productId"],
            warehouse_id=payload["warehouseId"],
            quantity=payload["quantity"],
            received_date=_parse_date(payload["receivedDate"]),
            status=payload["status"],
        )
    raise KeyError(f"Unknown entity: {entity}")


def list_items(entity: str):
    _ensure_entity(entity)
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        rows = db.execute(select(model)).scalars().all()
        return [_to_api(entity, row) for row in rows]


def get_item(entity: str, item_id: str):
    _ensure_entity(entity)
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        row = db.get(model, item_id)
        return _to_api(entity, row) if row else None


def create_item(entity: str, payload: dict):
    _ensure_entity(entity)
    with SessionLocal() as db:
        obj = _new_instance(entity, payload)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return _to_api(entity, obj)


def update_item(entity: str, item_id: str, payload: dict):
    _ensure_entity(entity)
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        obj = db.get(model, item_id)
        if not obj:
            return None
        _apply_payload(entity, obj, payload)
        db.commit()
        db.refresh(obj)
        return _to_api(entity, obj)


def delete_item(entity: str, item_id: str) -> bool:
    _ensure_entity(entity)
    model = _MODEL_MAP[entity]
    with SessionLocal() as db:
        obj = db.get(model, item_id)
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