from fastapi import APIRouter, HTTPException, status

from app.schemas.purchase_order import (
    PurchaseOrder,
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
)
from app.services.inventory import create_item, delete_item, get_item, list_items, update_item


router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])



@router.get("/", response_model=list[PurchaseOrder])
def list_purchase_orders():
    return list_items("purchaseOrders")


@router.get("/{purchase_order_id}", response_model=PurchaseOrder)
def get_purchase_order(purchase_order_id: str):
    order = get_item("purchaseOrders", purchase_order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")
    return order


@router.post("/", response_model=PurchaseOrder, status_code=status.HTTP_201_CREATED)
def create_purchase_order(payload: PurchaseOrderCreate):
    return create_item("purchaseOrders", payload.model_dump())


@router.patch("/{purchase_order_id}", response_model=PurchaseOrder)
def update_purchase_order(purchase_order_id: str, payload: PurchaseOrderUpdate):
    updated_order = update_item(
        "purchaseOrders",
        purchase_order_id,
        payload.model_dump(exclude_unset=True),
    )
    if not updated_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")
    return updated_order


@router.delete("/{purchase_order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase_order(purchase_order_id: str):
    if not delete_item("purchaseOrders", purchase_order_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")