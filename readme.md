# Supply Chain Build

Full-stack supply chain and inventory management application designed to handle core operational workflows across procurement, inventory tracking, and reporting.

## Overview

This system centralizes key supply chain entities into a single interface, allowing users to manage and track operational data with clear separation per account.

Core entities include:

* **Products** — catalog, pricing, and stock levels
* **Vendors** — supplier records and relationships
* **Warehouses** — storage locations and capacity tracking
* **Purchase Orders** — procurement lifecycle management
* **Shipments** — inbound logistics and receiving workflows
* **Reports** — aggregated operational insights

Each authenticated user operates within their own isolated dataset.

## Live App

Main site: https://www.supplyos.app/
API Docs: https://www.supplyos.app/docs#/

The deployed environment provides full access to the application UI and API without requiring local setup.

## Tech Stack

**Frontend**

* React (component-based UI)
* Vite (build tool and dev server)

**Backend**

* FastAPI (API framework)
* SQLAlchemy (ORM and data layer)
* PostgreSQL (relational database)

This stack supports a clear separation between UI, API logic, and persistent storage.

## Architecture

The system follows a layered request flow:

React UI → FastAPI Routes → Service Layer → PostgreSQL

* **Frontend** handles user interaction, state, and routing
* **API layer** manages request validation and routing
* **Service layer** contains business logic and data operations
* **Database** persists structured operational data

Authentication is handled via JWT tokens, which are attached to requests and used to scope all operations to the authenticated user.

## Project Structure

```
backend/        # API, database models, services
src/            # Frontend application (components, pages, state)
package.json    # Frontend dependencies and scripts
```

The backend and frontend are separated to allow independent scaling and deployment.

## API

Base path: `/api`

### Authentication

* `POST /api/auth/register` — create a new user account
* `POST /api/auth/login` — authenticate and receive access token

### Using the API Docs

To interact with protected endpoints in the API docs, authorization is required.

1. Click **Authorize** in the docs UI
2. Enter the same email and password used in the frontend app
3. Submit to authenticate and enable access to secured routes

### Core Resources

Each resource supports standard CRUD operations.

* `/products` — manage inventory items and stock levels
* `/vendors` — manage supplier data
* `/warehouses` — manage storage locations
* `/purchase-orders` — track procurement activity
* `/shipments` — manage incoming goods and fulfillment status
* `/reports` — retrieve aggregated metrics and summaries

All protected endpoints require a valid JWT in the request header.

## Frontend Routes

Authenticated routes map directly to operational workflows:

* `/dashboard` — high-level metrics and system overview
* `/products` — product catalog and inventory management
* `/vendors` — supplier management
* `/warehouses` — warehouse visibility and tracking
* `/purchase-orders` — procurement workflow interface
* `/shipments` — shipment intake and status tracking
* `/reports` — analytics and aggregated views

Each page is structured around data tables, filters, and action flows for creating and updating records.
