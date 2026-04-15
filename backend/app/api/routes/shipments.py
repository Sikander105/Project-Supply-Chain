from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import get_current_user
from app.models.user import User
from app.schemas.shipment import Shipment, ShipmentCreate, ShipmentUpdate
from app.services.inventory import create_item, delete_item, get_item, list_items, update_item

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("/", response_model=list[Shipment])
def list_shipments(current_user: User = Depends(get_current_user)):
    return list_items("shipments", current_user.id)

@router.get("/{shipment_id}", response_model=Shipment)
def get_shipment(shipment_id: str, current_user: User = Depends(get_current_user)):
    shipment = get_item("shipments", shipment_id, current_user.id)
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return shipment

@router.post("/", response_model=Shipment, status_code=status.HTTP_201_CREATED)
def create_shipment(payload: ShipmentCreate, current_user: User = Depends(get_current_user)):
    return create_item("shipments", payload.model_dump(), current_user.id)

@router.patch("/{shipment_id}", response_model=Shipment)
def update_shipment(shipment_id: str, payload: ShipmentUpdate, current_user: User = Depends(get_current_user)):
    updated = update_item("shipments", shipment_id, payload.model_dump(exclude_unset=True), current_user.id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return updated

@router.delete("/{shipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipment(shipment_id: str, current_user: User = Depends(get_current_user)):
    if not delete_item("shipments", shipment_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")