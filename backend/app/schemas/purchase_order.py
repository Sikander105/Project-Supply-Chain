from typing import Optional

from pydantic import BaseModel, Field


class PurchaseOrderBase(BaseModel):
    vendorId: str = Field(..., min_length=1)

    productId: str = Field(..., min_length=1)

    quantity: int = Field(..., gt=0)

    status: str = Field(..., min_length=1)

    createdDate: str = Field(..., min_length=1)


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrderUpdate(BaseModel):
    vendorId: Optional[str] = None
    productId: Optional[str] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    status: Optional[str] = None
    createdDate: Optional[str] = None


class PurchaseOrder(PurchaseOrderBase):
    id: str