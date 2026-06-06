# StockFlow — Inventory & Order Management System

A production-ready full-stack application for managing products, customers, orders, and inventory tracking.

**Stack:** FastAPI · React · PostgreSQL · Docker · Docker Compose

---

## Features

- **Product Management** — CRUD with unique SKU enforcement, stock tracking
- **Customer Management** — CRUD with unique email enforcement
- **Order Management** — Multi-item orders, automatic stock reduction, insufficient-stock protection
- **Dashboard** — Live stats: total products, customers, orders, and low-stock alerts
- **Business Rules** — All enforced server-side: unique SKUs, unique emails, non-negative quantities, automatic total calculation, stock restoration on order cancellation
- **Fully Containerized** — Docker + Docker Compose with health checks and named volumes

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models/models.py   # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas/schemas.py # Pydantic request/response schemas
│   │   └── routes/
│   │       ├── products.py    # /products CRUD
│   │       ├── customers.py   # /customers CRUD
│   │       └── orders.py      # /orders CRUD + /dashboard/stats
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/index.js       # Axios API client
│   │   ├── pages/             # Dashboard, Products, Customers, Orders
│   │   ├── components/        # Layout, Modal, ConfirmDialog, EmptyState
│   │   └── styles/globals.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start (Docker Compose)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd inventory-system
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD
```

### 3. Build and run

```bash
docker compose up --build
```

### 4. Access the app

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend API | http://localhost:8000     |
| API Docs | http://localhost:8000/docs   |
| ReDoc    | http://localhost:8000/redoc  |

---

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Set DATABASE_URL to your local PostgreSQL instance

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

npm run dev
```

---

## API Reference

### Products

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | /products          | List all products  |
| POST   | /products          | Create product     |
| GET    | /products/{id}     | Get product by ID  |
| PUT    | /products/{id}     | Update product     |
| DELETE | /products/{id}     | Delete product     |

### Customers

| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | /customers         | List all customers   |
| POST   | /customers         | Create customer      |
| GET    | /customers/{id}    | Get customer by ID   |
| DELETE | /customers/{id}    | Delete customer      |

### Orders

| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | /orders                     | List all orders    |
| POST   | /orders                     | Create order       |
| GET    | /orders/{id}                | Get order by ID    |
| DELETE | /orders/{id}                | Cancel order       |
| GET    | /orders/dashboard/stats     | Dashboard stats    |

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository, set **Root Directory** to `backend`
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL` → your Render PostgreSQL connection string
6. Create a **PostgreSQL** database on Render and link it

### Frontend — Vercel

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Build Command:** `npm run build`
4. Set **Output Directory:** `dist`
5. Add environment variable: `VITE_API_URL` → your Render backend URL (e.g. `https://your-app.onrender.com`)

### Backend Docker Image — Docker Hub

```bash
cd backend
docker build -t yourdockerhubuser/inventory-backend:latest .
docker push yourdockerhubuser/inventory-backend:latest
```

---

## Business Rules Implemented

| Rule | Implementation |
|------|----------------|
| Unique product SKU | DB unique constraint + 400 error on duplicate |
| Unique customer email | DB unique constraint + 400 error on duplicate |
| Non-negative quantities | DB `CHECK` constraint + Pydantic validator |
| Insufficient stock check | Server-side validation before order creation |
| Automatic stock reduction | Stock decremented atomically on order creation |
| Stock restoration | Stock restored when order is cancelled/deleted |
| Automatic total calculation | Backend calculates `sum(price × qty)` for all items |
| Proper HTTP status codes | 201 Created, 204 No Content, 400, 404 throughout |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI 0.111, SQLAlchemy 2.0, Pydantic v2 |
| Frontend | React 18, Vite 5, TailwindCSS 3, React Router 6, Axios |
| Database | PostgreSQL 16 |
| Container | Docker, Docker Compose, Nginx (Alpine) |
| Deployment | Render (backend), Vercel (frontend) |
