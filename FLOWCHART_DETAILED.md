# FLOWCHART_DETAILED.md

This document expands the high-level flowchart into a detailed, step-by-step description suitable for technical reviewers.

## Overview
The order processing flow is intentionally minimal to support clarity and extensibility. It focuses on validation, database reliability, idempotency concerns, and meaningful HTTP responses.

## Steps

1. **User Fills Order Form (Frontend)**
   - The frontend collects user inputs: `name`, `email`, `address`, `city`, `postalCode`, `country`.
   - Frontend should perform light validation (required fields, basic email regex) before submitting to minimize bad requests.

2. **Send Request to `/api/orders`**
   - Frontend issues `POST /api/orders` with a JSON payload.
   - Use `Content-Type: application/json` and an appropriate request timeout (e.g., 10s).

3. **Validate Input (Backend)**
   - Use Pydantic models (`OrderIn`) to validate request schema and types.
   - Return `422 Unprocessable Entity` for invalid payloads (FastAPI/Pydantic default).

4. **Database Connected?**
   - On startup, the FastAPI lifespan creates an `asyncpg` connection pool.
   - Each request should check pool availability; if `db_pool` is `None` or health check fails, return `503 Service Unavailable`.

5. **Generate Customer UUID**
   - Create a `customer_id` using UUID v4. This ID associates orders with customers without exposing sequential primary keys.

6. **Insert Order into DB**
   - Use parameterized queries to `INSERT` into `orders` table.
   - Wrap complex operations in a transaction (`conn.transaction()`).

7. **Insert Successful?**
   - On success, database returns the inserted row.
   - If a `UniqueViolationError` occurs (e.g., duplicate email when uniqueness is enforced), return `409 Conflict`.
   - For other errors, return `500 Internal Server Error` with a minimal message and log details on the server.

8. **Format Dates & Build JSON Response**
   - Convert `date`/`datetime` fields to ISO strings for JSON serialization.
   - Return `201 Created` with the fully formed order JSON.

9. **Send Success Response to Frontend**
   - Frontend displays a confirmation to the user and may poll or navigate to order details.

## Notes for Reviewers
- Consider idempotency: add an `idempotency_key` header to allow safe retries.
- For production, ensure secrets are stored securely (e.g., Kubernetes secrets, HashiCorp Vault).
- Add observability: structured logs, request tracing, metrics for DB pool usage and request latencies.

