from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    stock: int = Field(default=0, ge=0)
    price: float = Field(..., gt=0)
    reorderLevel: int = Field(default=0, ge=0)
    warehouseId: str = Field(..., min_length=1)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    price: Optional[float] = Field(default=None, gt=0)
    reorderLevel: Optional[int] = Field(default=None, ge=0)
    warehouseId: Optional[str] = None


class Product(ProductBase):
    id: str