from fastapi import APIRouter, HTTPException, status

from app.schemas.shipment import Shipment, ShipmentCreate, ShipmentUpdate
from app.services.inventory import create_item, delete_item, get_item, list_items, update_item


router = APIRouter(prefix="/shipments", tags=["Shipments"])



@router.get("/", response_model=list[Shipment])
def list_shipments():
    return list_items("shipments")


@router.get("/{shipment_id}", response_model=Shipment)
def get_shipment(shipment_id: str):
    shipment = get_item("shipments", shipment_id)
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return shipment


@router.post("/", response_model=Shipment, status_code=status.HTTP_201_CREATED)
def create_shipment(payload: ShipmentCreate):
    return create_item("shipments", payload.model_dump())


@router.patch("/{shipment_id}", response_model=Shipment)
def update_shipment(shipment_id: str, payload: ShipmentUpdate):
    updated_shipment = update_item(
        "shipments",
        shipment_id,
        payload.model_dump(exclude_unset=True),
    )
    if not updated_shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return updated_shipment


@router.delete("/{shipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipment(shipment_id: str):
    if not delete_item("shipments", shipment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")