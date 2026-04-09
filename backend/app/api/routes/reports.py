from collections import defaultdict

from fastapi import APIRouter

from app.services.inventory import get_store_snapshot


router = APIRouter(prefix="/reports", tags=["Reports"])



def _get_stock_status(product: dict) -> str:
    stock = int(product.get("stock", 0) or 0)
    reorder_level = int(product.get("reorderLevel", 0) or 0)

    if stock <= 0:
        return "Out of Stock"
    if stock <= reorder_level:
        return "Low Stock"
    return "In Stock"


def _group_count(items: list[dict], key: str, fallback: str):
    grouped = defaultdict(int)

    for item in items:
        grouped[item.get(key) or fallback] += 1

    return [{"name": name, "value": value} for name, value in grouped.items()]



@router.get("/overview")
def get_reports_overview():
    data = get_store_snapshot()

    products = data["products"]
    purchase_orders = data["purchaseOrders"]

    total_stock_units = sum(int(product.get("stock", 0) or 0) for product in products)
    total_inventory_value = sum(
        (int(product.get("stock", 0) or 0) * float(product.get("price", 0) or 0))
        for product in products
    )

    return {
        "summaries": {
            "totalProducts": len(products),
            "totalVendors": len(data["vendors"]),
            "totalWarehouses": len(data["warehouses"]),
            "totalPurchaseOrders": len(purchase_orders),
            "totalShipments": len(data["shipments"]),
            "pendingPurchaseOrders": len([item for item in purchase_orders if item.get("status") == "Pending"]),
            "totalStockUnits": total_stock_units,
            "totalInventoryValue": total_inventory_value,
            "lowStockItems": len([item for item in products if _get_stock_status(item) != "In Stock"]),
        },
        "productsByCategory": _group_count(products, "category", "Uncategorized"),
        "purchaseOrdersByStatus": _group_count(purchase_orders, "status", "Unknown"),
        "productsByStockLevel": _group_count(
            [{"status": _get_stock_status(product)} for product in products],
            "status",
            "Unknown",
        ),
    }