from fastapi import APIRouter, HTTPException, status

from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.services.inventory import create_item, delete_item, get_item, list_items, update_item


router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=list[Product])
def list_products():
    return list_items("products")


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    product = get_item("products", product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate):
    return create_item("products", payload.model_dump())


@router.patch("/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate):
    updated_product = update_item(
        "products",
        product_id,
        payload.model_dump(exclude_unset=True),
    )
    if not updated_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return updated_product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str):
    if not delete_item("products", product_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")