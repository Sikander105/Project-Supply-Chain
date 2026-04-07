from fastapi import APIRouter, HTTPException, status

from app.schemas.product import Product, ProductCreate, ProductUpdate


router = APIRouter(prefix="/products", tags=["Products"])


_PRODUCTS: list[Product] = [
    Product(
        id="PRD-1001",
        name="Industrial Safety Gloves",
        category="Safety",
        stock=220,
        price=12.5,
        reorderLevel=60,
        warehouseId="WH-3001",
    ),
    Product(
        id="PRD-1002",
        name="Hydraulic Pump Assembly",
        category="Mechanical",
        stock=34,
        price=480,
        reorderLevel=40,
        warehouseId="WH-3002",
    ),
]


def _next_product_id() -> str:
    max_number = 1000

    for product in _PRODUCTS:
        raw_value = product.id.replace("PRD-", "")
        if raw_value.isdigit():
            max_number = max(max_number, int(raw_value))

    return f"PRD-{max_number + 1}"


@router.get("/", response_model=list[Product])
def list_products():
    return _PRODUCTS


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    for product in _PRODUCTS:
        if product.id == product_id:
            return product

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate):
    product = Product(id=_next_product_id(), **payload.model_dump())
    _PRODUCTS.insert(0, product)
    return product


@router.patch("/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate):
    for index, product in enumerate(_PRODUCTS):
        if product.id != product_id:
            continue

        updated_data = product.model_dump()
        updated_data.update({key: value for key, value in payload.model_dump().items() if value is not None})

        updated_product = Product(**updated_data)
        _PRODUCTS[index] = updated_product
        return updated_product

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str):
    for index, product in enumerate(_PRODUCTS):
        if product.id == product_id:
            _PRODUCTS.pop(index)
            return

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")