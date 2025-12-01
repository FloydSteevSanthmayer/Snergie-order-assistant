import os
import re
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, date
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncpg
from dotenv import load_dotenv
from typing import TypedDict, Optional
import json
from fastapi.responses import JSONResponse
import requests
from fastapi import Request, HTTPException
import uuid # Import the UUID library

# --- Global variable for the database connection pool ---
db_pool = None

class GraphState(TypedDict, total=False):
    user_prompt: str
    intent: Optional[str]
    output: Optional[str]

# --- Load .env ---
load_dotenv()

# --- Lifespan Context Manager for DB Connection ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events. Connects to the database on startup
    and closes the connection on shutdown.
    """
    global db_pool
    DATABASE_URL = os.getenv("DATABASE_URL")
    print("--- Connecting to PostgreSQL ---")
    try:
        db_pool = await asyncpg.create_pool(dsn=DATABASE_URL, min_size=1, max_size=10)
        # Test the connection
        async with db_pool.acquire() as connection:
            await connection.fetchval("SELECT 1")
        print("PostgreSQL connection pool: SUCCESS")
    except Exception as e:
        print(f"PostgreSQL connection pool: FAILED. Error: {e}")
        db_pool = None
    
    yield
    
    if db_pool:
        await db_pool.close()
        print("PostgreSQL connection pool closed.")

# --- FastAPI Setup ---
app = FastAPI(title="Order & Product Assistant API", lifespan=lifespan)

origins = [
    "http://localhost:8080",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WatsonX.ai LLM Setup ---
WATSONX_URL = os.getenv("WATSONX_URL")
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_MODEL = "meta-llama/llama-3-8b-instruct"

def watsonx_rephrase(prompt_text: str, fallback: str) -> str:
    """Generates a conversational response using WatsonX.ai."""
    if not all([WATSONX_URL, WATSONX_API_KEY, WATSONX_PROJECT_ID]):
        print("WARN: WatsonX credentials not set. Using fallback.")
        return fallback
    try:
        headers = { "Authorization": f"Bearer {WATSONX_API_KEY}", "Content-Type": "application/json", "Accept": "application/json" }
        data = { "model_id": WATSONX_MODEL, "input": prompt_text, "parameters": { "max_new_tokens": 80, "temperature": 0.3 }, "project_id": WATSONX_PROJECT_ID }
        resp = requests.post(WATSONX_URL, headers=headers, json=data, timeout=20)
        resp.raise_for_status()
        result = resp.json()
        return result["results"][0]["generated_text"].strip()
    except Exception as e:
        print(f"WatsonX.ai LLM error: {e}")
        return fallback

# --- API Endpoints ---
@app.post("/api/orders")
async def create_order(request: Request):
    """
    Receives order data from the frontend and saves it to the database.
    """
    print("\n--- Received new order request ---")
    try:
        order_data = await request.json()
        print(f"Received data: {json.dumps(order_data, indent=2)}")

        # Extract all fields from the incoming JSON
        name = order_data.get("name")
        email = order_data.get("email")
        # **CHANGE:** We now generate a new, unique UUID for every single order.
        customer_id = str(uuid.uuid4())
        address = order_data.get("address")
        city = order_data.get("city")
        postal_code = order_data.get("postalCode")
        country = order_data.get("country")
        
        # Basic validation
        if not all([name, email, address, city, postal_code, country]):
            print("ERROR: Missing required fields.")
            raise HTTPException(status_code=400, detail="Missing required customer information.")

        # Set default values for a new order
        order_status = "Processing"
        expected_delivery_date = datetime.utcnow().date() + timedelta(days=7)
        
        print(f"Generated new Customer ID: {customer_id}")
        print("Inserting into DB...")
        async with db_pool.acquire() as connection:
            new_order = await connection.fetchrow(
                """
                INSERT INTO orders (name, email, customer_id, order_status, expected_delivery_date, address, city, postal_code, country)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING * """,
                name, email, customer_id, order_status, expected_delivery_date, address, city, postal_code, country
            )
        
        if not new_order:
            raise HTTPException(status_code=500, detail="Database insert failed.")
        
        print(f"SUCCESS: Order created with ID: {new_order['id']}")
        
        # Convert the new order record to a JSON-serializable format before returning
        order_dict = dict(new_order)
        for key, value in order_dict.items():
            if isinstance(value, (datetime, date)):
                order_dict[key] = value.isoformat()
        return order_dict

    except asyncpg.exceptions.UniqueViolationError:
        print("ERROR: Duplicate email or phone number detected.")
        raise HTTPException(status_code=409, detail="An order with this email or phone number already exists.")
    except Exception as e:
        print(f"--- UNEXPECTED ERROR in create_order: {e} ---")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {e}")

@app.get("/api/orders")
async def list_orders():
    """
    Fetches all orders from the database and returns them.
    This function now correctly formats dates into strings.
    """
    print("\n--- Received request to list all orders ---")
    async with db_pool.acquire() as connection:
        records = await connection.fetch("SELECT * FROM orders ORDER BY created_at DESC")
    
    # **CRITICAL FIX:** Convert all date/datetime objects to strings (ISO format) for JSON serialization.
    orders = []
    for record in records:
        order = dict(record)
        for key, value in order.items():
            if isinstance(value, (datetime, date)):
                order[key] = value.isoformat()
        orders.append(order)
        
    print(f"Found {len(orders)} orders to return.")
    return orders

@app.get("/api/health")
async def health():
    """A simple health check endpoint to verify database connectivity."""
    if db_pool:
        return {"database_status": "connected"}
    return {"database_status": "disconnected"}

