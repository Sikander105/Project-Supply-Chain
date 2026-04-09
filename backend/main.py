from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.products import router as products_router
from app.api.routes.purchase_orders import router as purchase_orders_router
from app.api.routes.reports import router as reports_router
from app.api.routes.shipments import router as shipments_router
from app.api.routes.vendors import router as vendors_router
from app.api.routes.warehouses import router as warehouses_router


app = FastAPI(title="Supply Chain API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Supply Chain API running"}


app.include_router(health_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(vendors_router, prefix="/api")
app.include_router(warehouses_router, prefix="/api")
app.include_router(purchase_orders_router, prefix="/api")
app.include_router(shipments_router, prefix="/api")
app.include_router(reports_router, prefix="/api")