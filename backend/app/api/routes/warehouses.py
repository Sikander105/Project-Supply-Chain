from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import get_current_user
from app.models.user import User
from app.schemas.warehouse import Warehouse, WarehouseCreate, WarehouseUpdate
from app.services.inventory import create_item, delete_item, get_item, list_items, update_item

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

@router.get("/", response_model=list[Warehouse])
def list_warehouses(current_user: User = Depends(get_current_user)):
    return list_items("warehouses", current_user.id)

@router.get("/{warehouse_id}", response_model=Warehouse)
def get_warehouse(warehouse_id: str, current_user: User = Depends(get_current_user)):
    warehouse = get_item("warehouses", warehouse_id, current_user.id)
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse

@router.post("/", response_model=Warehouse, status_code=status.HTTP_201_CREATED)
def create_warehouse(payload: WarehouseCreate, current_user: User = Depends(get_current_user)):
    return create_item("warehouses", payload.model_dump(), current_user.id)

@router.patch("/{warehouse_id}", response_model=Warehouse)
def update_warehouse(warehouse_id: str, payload: WarehouseUpdate, current_user: User = Depends(get_current_user)):
    updated_warehouse = update_item("warehouses", warehouse_id, payload.model_dump(exclude_unset=True), current_user.id)
    if not updated_warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return updated_warehouse

@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(warehouse_id: str, current_user: User = Depends(get_current_user)):
    if not delete_item("warehouses", warehouse_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")