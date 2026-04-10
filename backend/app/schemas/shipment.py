from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ShipmentBase(BaseModel):
    productId: str = Field(..., min_length=1)

    warehouseId: str = Field(..., min_length=1)

    quantity: int = Field(..., gt=0)

    receivedDate: Optional[str] = None

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


class ShipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    shipmentNumber: str = Field(alias="shipment_number")
    carrier: str
    origin: str
    destination: str
    trackingNumber: str = Field(alias="tracking_number")
    status: str
    shippedDate: date = Field(alias="shipped_date")
    expectedDeliveryDate: date = Field(alias="expected_delivery_date")
    notes: Optional[str] = None
    productId: str = Field(alias="product_id")
    warehouseId: str = Field(alias="warehouse_id")
    quantity: int
    receivedDate: Optional[date] = Field(default=None, alias="received_date")