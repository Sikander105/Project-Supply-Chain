MOCK_DATA = {
    "products": [
        {
            "id": "PRD-1001",
            "name": "Industrial Safety Gloves",
            "category": "Safety",
            "stock": 220,
            "price": 12.5,
            "reorderLevel": 60,
            "warehouseId": "WH-3001",
        },
        {
            "id": "PRD-1002",
            "name": "Hydraulic Pump Assembly",
            "category": "Mechanical",
            "stock": 34,
            "price": 480,
            "reorderLevel": 40,
            "warehouseId": "WH-3002",
        },
        {
            "id": "PRD-1003",
            "name": "Packaging Carton - Large",
            "category": "Packaging",
            "stock": 560,
            "price": 2.2,
            "reorderLevel": 120,
            "warehouseId": "WH-3003",
        },
    ],


    "vendors": [
        {
            "id": "VND-2001",
            "name": "Atlas Industrial Supplies",
            "contactPerson": "Maya Franklin",
            "phone": "+1 (555) 420-1101",
            "email": "maya@atlasindustrial.com",
        },
        {
            "id": "VND-2002",
            "name": "North Peak Components",
            "contactPerson": "Ethan Cole",
            "phone": "+1 (555) 420-2202",
            "email": "ethan@northpeakco.com",
        },
    ],


    "warehouses": [
        {
            "id": "WH-3001",
            "name": "Central Distribution Hub",
            "location": "Chicago, IL",
            "capacity": 3000,
            "currentUsage": 1880,
        },
        {
            "id": "WH-3002",
            "name": "West Coast Fulfillment",
            "location": "Sacramento, CA",
            "capacity": 2200,
            "currentUsage": 1485,
        },
        {
            "id": "WH-3003",
            "name": "East Regional Storage",
            "location": "Newark, NJ",
            "capacity": 1800,
            "currentUsage": 1090,
        },
    ],


    "purchaseOrders": [
        {
            "id": "PO-4001",
            "vendorId": "VND-2001",
            "productId": "PRD-1001",
            "quantity": 150,
            "status": "Approved",
            "createdDate": "2026-03-10",
        },
        {
            "id": "PO-4002",
            "vendorId": "VND-2002",
            "productId": "PRD-1002",
            "quantity": 50,
            "status": "Pending",
            "createdDate": "2026-03-17",
        },
    ],


    "shipments": [
        {
            "id": "SHP-5001",
            "productId": "PRD-1001",
            "warehouseId": "WH-3001",
            "quantity": 120,
            "receivedDate": "2026-03-20",
            "status": "Received",
        },
        {
            "id": "SHP-5002",
            "productId": "PRD-1002",
            "warehouseId": "WH-3002",
            "quantity": 35,
            "receivedDate": "2026-03-28",
            "status": "In Transit",
        },
    ],
}