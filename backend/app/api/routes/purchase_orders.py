from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import get_current_user
from app.models.user import User
from app.schemas.purchase_order import PurchaseOrder, PurchaseOrderCreate, PurchaseOrderUpdate
from app.services.inventory import create_item, delete_item, get_item, list_items, update_item

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

@router.get("/", response_model=list[PurchaseOrder])
def list_purchase_orders(current_user: User = Depends(get_current_user)):
    return list_items("purchaseOrders", current_user.id)

@router.get("/{po_id}", response_model=PurchaseOrder)
def get_purchase_order(po_id: str, current_user: User = Depends(get_current_user)):
    po = get_item("purchaseOrders", po_id, current_user.id)
    if not po:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")
    return po

@router.post("/", response_model=PurchaseOrder, status_code=status.HTTP_201_CREATED)
def create_purchase_order(payload: PurchaseOrderCreate, current_user: User = Depends(get_current_user)):
    return create_item("purchaseOrders", payload.model_dump(), current_user.id)

@router.patch("/{po_id}", response_model=PurchaseOrder)
def update_purchase_order(po_id: str, payload: PurchaseOrderUpdate, current_user: User = Depends(get_current_user)):
    updated = update_item("purchaseOrders", po_id, payload.model_dump(exclude_unset=True), current_user.id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")
    return updated

@router.delete("/{po_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase_order(po_id: str, current_user: User = Depends(get_current_user)):
    if not delete_item("purchaseOrders", po_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase order not found")