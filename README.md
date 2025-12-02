# SYNERGIE Order Assistant

**Production-ready starter for order intake and customer-assistant workflows.**

---

## Overview

SYNERGIE Order Assistant is a professionally structured starter repository for building a modern, extensible order intake API and lightweight product-assistant. The project pairs a high-performance **FastAPI** backend (asyncpg + Pydantic) with a **Vite + React** frontend styled by **Tailwind CSS**, and includes configuration hooks for optional LLM integration (e.g., WatsonX). The codebase is optimized for local development, containerized deployment, and incremental production hardening.

---

## Key Features

- **FastAPI backend** with asynchronous PostgreSQL connection pooling (`asyncpg`)  
- **Pydantic** data models for robust request validation and clear error messages  
- **Vite + React** frontend scaffold with Tailwind CSS for rapid UI development  
- **Environment-driven configuration** (`.env.example`) and secure secrets guidance  
- **Docker / Docker Compose** friendly for consistent development environments  
- **CI/CD scaffolding** (GitHub Actions, Dependabot) and pre-commit hooks included as templates  
- **Test scaffold** (pytest) with recommendations for async testing and fixtures  
- **Clear architecture & documentation**, including a colorized flowchart and a detailed flow explanation for reviewers

---

## Repository Layout

```
.
├── app-backend/            # FastAPI backend (add main.py, routers, models)
├── app-frontend/           # Vite + React frontend (add package.json, src/, public/)
├── flowchart_colored.mmd   # Mermaid source for the flowchart
├── flowchart_colored.png   # Rendered flowchart image
├── .env.example            # Example environment variables (DO NOT commit secrets)
├── Dockerfile              # Example Dockerfile for backend
├── docker-compose.yml      # Optional: Compose file for local dev
├── requirements.txt        # Python dependencies (example)
├── .gitignore
├── .github/                # CI and automation templates
├── tests/                  # Test scaffold
├── LICENSE
└── README.md               # This file
```

---

## Technology Stack

- **Backend:** Python, FastAPI, asyncpg, Pydantic, Uvicorn  
- **Frontend:** Vite, React, Tailwind CSS  
- **Database:** PostgreSQL  
- **DevOps & CI:** Docker, Docker Compose, GitHub Actions, Dependabot  
- **Optional LLM:** WatsonX.ai or other LLM providers via small integration hooks

---

## Quickstart (Local Development)

> These commands assume you have Docker & Docker Compose installed. If you prefer to run services locally, follow the non-Docker steps below.

### 1. Clone the repository
```bash
git clone <repo-url>
cd synergie-order-assistant
```

### 2. Copy environment template
```bash
cp .env.example .env
# Edit .env and populate DATABASE_URL and any LLM credentials
```

### 3. Start with Docker Compose (recommended)
```bash
docker-compose up --build
```
This will typically start PostgreSQL and the backend. Follow backend logs for migration instructions.

### 4. Backend (manual / local Python)
```bash
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Create DB and run migrations (or execute provided SQL)
uvicorn main:app --reload --port 8000
```

### 5. Frontend (local)
```bash
cd app-frontend
npm install
npm run dev
# Frontend should be available at http://localhost:5173
```

---

## Database & Migrations

A SQL migration or Alembic configuration should be provided in `app-backend/migrations/`. Minimal schema for the `orders` table:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  customer_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  order_status TEXT NOT NULL DEFAULT 'Processing',
  expected_delivery_date DATE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

> Recommendation: use Alembic for versioned migrations and keep `migrations/` under source control.

---

## Testing

- Backend tests should use `pytest` with `pytest-asyncio` for async endpoints.
- Include fixtures to spin up a test database (Dockerized or ephemeral) and run migrations before tests.
- Example:
```bash
pip install -r requirements-dev.txt
pytest -q
```

---

## CI / Automation

The project includes CI scaffolding under `.github/workflows/ci.yml` to run tests and linters. Configure repository secrets (e.g., `TEST_DATABASE_URL`) in GitHub to allow safe test runs. Dependabot config is provided to automate dependency updates.

---

## Security & Best Practices

- **Never commit `.env`** — use `.env.example` and `.gitignore`.
- Use secret management (GitHub Secrets, Vault, or cloud provider secret stores) for CI and production.
- Restrict CORS in production to trusted domains.
- Use TLS for all public endpoints and follow security headers (HSTS, CSP).
- Run dependency scanning and container image scanning as part of CI.

---

## Contribution Guide

Author: **Floyd Steev Santhmayer**

Contributions are welcome. Please:
1. Fork the repository and create a descriptive branch name.
2. Run tests and linters locally before opening a PR.
3. Include tests for any new functionality.
4. Keep commits focused and documented.

See `CONTRIBUTING.md` for templates and PR guidance.

---

## License

This project is provided under the **MIT License**. See `LICENSE` for details.

---

## Contact & Support

For questions or support, open an issue or contact the repository maintainer:

**Floyd Steev Santhmayer**
