from typing import Optional

from pydantic import BaseModel, Field


class ShipmentBase(BaseModel):
    productId: str = Field(..., min_length=1)

    warehouseId: str = Field(..., min_length=1)

    quantity: int = Field(..., gt=0)

    receivedDate: str = Field(..., min_length=1)

    status: str = Field(..., min_length=1)


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentUpdate(BaseModel):
    productId: Optional[str] = None
    warehouseId: Optional[str] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    receivedDate: Optional[str] = None
    status: Optional[str] = None


class Shipment(ShipmentBase):
    id: str