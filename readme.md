Worked for 1m 22s

# Supply Chain Build
 
Full-stack supply chain and inventory management app with:
- **Frontend:** React + Vite operations dashboard
- **Backend:** FastAPI + SQLAlchemy API
- **Database:** PostgreSQL via Alembic migrations
 
This README is intentionally concise and focused on setup + usage.
 
---
 
## Table of Contents
- [Overview](#section-overview)
- [Core Features](#section-core-features)
- [Tech Stack](#section-tech-stack)
- [Architecture](#section-architecture)
- [Project Structure](#section-project-structure)
- [Local Development Setup](#section-local-development-setup)
- [Environment Variables](#section-environment-variables)
- [API Reference](#section-api-reference)
- [Frontend Workflows](#section-frontend-workflows)
- [Scripts and Commands](#section-scripts-and-commands)
- [Demo Login Credentials](#section-demo-login-credentials)
- [Troubleshooting](#section-troubleshooting)
- [Security Notes](#section-security-notes)
 
---
 
<a id="section-overview"></a>
## Overview
 
Supply Chain Build manages key operational entities:
- Products
- Vendors
- Warehouses
- Purchase Orders
- Shipments
- Reports
 
Each authenticated user works with their own data scope.
 
---
 
<a id="section-core-features"></a>
## Core Features
 
### Authentication
- Register and login endpoints
- JWT bearer token auth
- Protected frontend routes and API resources
 
### CRUD Operations
Full create/read/update/delete support for:
- products
- vendors
- warehouses
- purchase orders
- shipments
 
### Dashboard & Reports
- KPI metrics (stock units, inventory value, pending POs)
- Low-stock visibility
- Charts by category/status/stock level
 
### UI/UX
- Search, sorting, and filters in tables
- Modal-based create/edit/delete flows
- Toast notifications and inline validation
 
---
 
<a id="section-tech-stack"></a>
## Tech Stack
 
### Frontend
- React 19
- Vite
- React Router
- Recharts
 
### Backend
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL (`psycopg`)
 
### Tooling
- ESLint
- Uvicorn
 
---
 
<a id="section-architecture"></a>
## Architecture
 
```text
[React UI] -> [FastAPI Routes] -> [Service Layer] -> [PostgreSQL]
Typical flow:

Login via /api/auth/login
Store token in frontend local storage
Include Authorization: Bearer <token> on protected requests
Backend scopes operations to the current authenticated user
[blocked]

Project Structure

.
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── main.py
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── utils/
│   ├── App.jsx
│   └── Main.jsx
├── package.json
└── README.md
[blocked]

Local Development Setup
Prerequisites
Node.js (LTS)
npm
Python 3.11+
PostgreSQL
1) Backend Setup
From repository root:


cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
Create backend/.env (see next section), then run:


alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
Backend URLs:

API: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs
ReDoc: http://127.0.0.1:8000/redoc
2) Frontend Setup
From repository root (new terminal):


npm install
npm run dev
Frontend URL:

http://localhost:5173
Optional: Backend Docker
From backend/:


docker build -t supply-chain-api .
docker run --rm -p 8000:8000 --env-file .env supply-chain-api
[blocked]

Environment Variables
Backend (backend/.env)
Required:

CORS_ORIGINS
DATABASE_URL
JWT_SECRET_KEY
Optional (with defaults):

ENV=development
DEBUG=False
API_PREFIX=/api
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
Example:


ENV=development
DEBUG=True
API_PREFIX=/api
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/supply_chain
JWT_SECRET_KEY=replace-with-a-strong-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
Frontend (optional root .env)

VITE_API_BASE_URL=http://127.0.0.1:8000/api
If unset, frontend defaults to the same local backend URL above.

[blocked]

API Reference
Base API prefix: /api

Public Endpoints
Method	Path	Purpose
POST	/api/auth/register	Register and return token
POST	/api/auth/login	Login and return token
POST	/api/auth/token	OAuth2 form-compatible token endpoint
GET	/api/health	Health check
Protected Endpoints
Add header:


Authorization: Bearer <access_token>
Resource	List	Get	Create	Update	Delete
Products	GET /api/products/	GET /api/products/{id}	POST /api/products/	PATCH /api/products/{id}	DELETE /api/products/{id}
Vendors	GET /api/vendors/	GET /api/vendors/{id}	POST /api/vendors/	PATCH /api/vendors/{id}	DELETE /api/vendors/{id}
Warehouses	GET /api/warehouses/	GET /api/warehouses/{id}	POST /api/warehouses/	PATCH /api/warehouses/{id}	DELETE /api/warehouses/{id}
Purchase Orders	GET /api/purchase-orders/	GET /api/purchase-orders/{id}	POST /api/purchase-orders/	PATCH /api/purchase-orders/{id}	DELETE /api/purchase-orders/{id}
Shipments	GET /api/shipments/	GET /api/shipments/{id}	POST /api/shipments/	PATCH /api/shipments/{id}	DELETE /api/shipments/{id}
Reports:

GET /api/reports/overview (auth required)
Login payload example:


{
  "email": "grader@grader.com",
  "password": "grader1231$"
}
Quick curl login:


TOKEN=$(curl -s http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"grader@grader.com","password":"grader1231$"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
[blocked]

Frontend Workflows
Main authenticated routes:

/dashboard
/products
/vendors
/warehouses
/purchase-orders
/shipments
/reports
Public route:

/login
What each page does:

Dashboard: KPIs, low-stock alerts, summary charts
Products: manage catalog, stock, and pricing
Vendors: manage supplier contacts
Warehouses: monitor capacity and usage
Purchase Orders: procurement records and statuses
Shipments: receiving flow by warehouse/date
Reports: aggregate analytics views
[blocked]

Scripts and Commands
Frontend (from repo root)

npm run dev
npm run build
npm run preview
npm run lint
Backend (from backend/)

alembic upgrade head
alembic current
alembic history
uvicorn main:app --reload
[blocked]

Demo Login Credentials
Use these credentials for both frontend and backend:

Account 1
Email: grader@grader.com
Password: grader1231$
Account 2
Email: demo@supplychainapp.com
Password: DemoPass123!
[blocked]

Troubleshooting
Frontend cannot reach backend
Confirm backend is running on http://127.0.0.1:8000
Verify VITE_API_BASE_URL if using non-default host/port
CORS errors
Ensure frontend URL is listed in CORS_ORIGINS
Authentication failures
Verify credentials
Ensure JWT_SECRET_KEY is set
Clear local storage if token is stale
Migration errors
Confirm DATABASE_URL is valid and DB is reachable
Run Alembic from backend/ with env loaded
[blocked]

Security Notes
Never commit production secrets
Use a strong JWT_SECRET_KEY
Restrict CORS origins in production
Prefer HTTPS for deployed environments
