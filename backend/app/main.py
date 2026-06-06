import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import products, customers, orders

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for managing products, customers, and orders",
    version="1.0.0"
)


@app.on_event("startup")
def create_tables():
    """Create database tables with retry logic to handle DB connection delays."""
    max_retries = 30
    retry_delay = 1  # seconds
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            print("✓ Database tables created successfully")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠ Attempt {attempt + 1}/{max_retries} - Database not ready: {e}")
                time.sleep(retry_delay)
            else:
                print(f"✗ Failed to create tables after {max_retries} attempts: {e}")
                raise

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Inventory & Order Management API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
