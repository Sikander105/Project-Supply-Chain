from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.api.routes.health import router as health_router
from app.api.routes.products import router as products_router
from app.api.routes.purchase_orders import router as purchase_orders_router
from app.api.routes.reports import router as reports_router
from app.api.routes.shipments import router as shipments_router
from app.api.routes.vendors import router as vendors_router
from app.api.routes.warehouses import router as warehouses_router


app = FastAPI(
    title="Supply Chain API",
    version="1.0.0",
    redoc_url=None,
)


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


@app.get("/redoc", include_in_schema=False, response_class=HTMLResponse)
def custom_redoc():
    return HTMLResponse("""
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Supply Chain API Documentation</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
          }

          header {
            background: linear-gradient(90deg, #0f766e 0%, #0369a1 50%, #2563eb 100%);
            color: white;
            padding: 24px 32px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            position: relative;
          }

          .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          #redoc-container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
          }

          @media (max-width: 768px) {
            header {
              padding: 20px 16px;
            }

            .header-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }
        </style>
      </head>
      <body>
        <header id="doc-header">
          <div class="header-content">
            <div>
              <h1 style="margin: 0; font-size: 28px;">Supply Chain API</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Enterprise-Grade Inventory Management</p>
            </div>
            <div>API v1.0.0</div>
          </div>
        </header>

        <div id="redoc-container"></div>

        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        <script>
          Redoc.init("/openapi.json", {
            nativeScrollbars: true,
            hideDownloadButton: true,
            theme: {
              colors: {
                primary: { main: "#0f766e" }
              },
              typography: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                headings: {
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
              },
              sidebar: {
                backgroundColor: "#ffffff"
              }
            }
          }, document.getElementById("redoc-container"));
        </script>
      </body>
    </html>
    """)

app.include_router(health_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(vendors_router, prefix="/api")
app.include_router(warehouses_router, prefix="/api")
app.include_router(purchase_orders_router, prefix="/api")
app.include_router(shipments_router, prefix="/api")
app.include_router(reports_router, prefix="/api")