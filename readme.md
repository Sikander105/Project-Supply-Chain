📦 Supply Chain Build

A full-stack Supply Chain & Inventory Management System built with modern web technologies.

Frontend: React + Vite
Backend: FastAPI + SQLAlchemy
Database: PostgreSQL (Dockerized)
🚀 Overview

This application manages core supply chain operations:

Products
Vendors
Warehouses
Purchase Orders
Shipments
Reports

Each authenticated user works within their own data scope.

🔑 Core Features
Authentication
JWT-based login system
Protected API routes
Role-based data access
CRUD Operations

Supports full create/read/update/delete for:

Products
Vendors
Warehouses
Purchase Orders
Shipments
Dashboard & Reports
Real-time KPI metrics
Inventory value tracking
Low stock alerts
Data visualization with charts
🛠 Tech Stack
Frontend
React
Vite
React Router
Recharts
Backend
FastAPI
SQLAlchemy
Alembic
Pydantic
Database
PostgreSQL
SQLite (fallback)
🏗 Architecture
[React Frontend]
        ↓ API Requests
[FastAPI Backend]
        ↓ CRUD Operations
[PostgreSQL Database]
📁 Project Structure
.
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   └── utils/
└── README.md
⚙️ Setup Instructions
Run with Docker (Recommended)
docker compose up --build
Access the Application
Frontend: http://localhost:5173
Backend API Docs: http://localhost:8000/docs
🔐 Demo Login Credentials
👤 Grader Account
Email: grader@grader.com  
Password: grader1231$
👤 Demo Account
Email: demo@supplychainapp.com  
Password: DemoPass123!
🧪 API Example

Login request:

{
  "email": "grader@grader.com",
  "password": "grader1231$"
}