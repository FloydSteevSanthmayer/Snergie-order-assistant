# SYNERGIE Order Assistant

**Production-ready starter for order intake and customer-assistant workflows.**

This repository provides an extensible template for building an order intake API and a lightweight customer assistant. It pairs a FastAPI backend (asyncpg + Pydantic) with a Vite + React frontend (Tailwind). The project is designed for local development, containerized deployment, and easy extension with LLM hooks (e.g., WatsonX).

---

## Key features
- FastAPI backend with async PostgreSQL connection pooling
- Pydantic models for robust request validation
- Minimal, responsive Vite + React frontend with Tailwind styling
- Optional WatsonX.ai integration hooks for conversational features
- `.env` driven configuration and example files
- Docker and Docker Compose examples for local development
- CI pipeline scaffold (GitHub Actions), Dependabot config, and pre-commit hooks
- Basic pytest scaffold for backend tests

---

## Tech stack
- Backend: Python, FastAPI, asyncpg, Pydantic, Uvicorn
- Frontend: Vite, React, Tailwind CSS
- Database: PostgreSQL
- DevOps: Docker, Docker Compose, GitHub Actions
- Optional: WatsonX.ai for LLM integration

---

## Repository structure (recommended)
```
.
├── app-backend/            # Backend application (FastAPI) - add main.py, routers, models
├── app-frontend/           # Frontend (Vite + React) - add package.json, src/, public/
├── flowchart_colored.mmd   # Mermaid source for the flowchart
├── flowchart_colored.png   # Rendered flowchart image
├── .env.example            # Example environment variables (DO NOT commit real secrets)
├── Dockerfile              # Example Dockerfile for backend
├── docker-compose.yml      # Optional: compose file for local dev
├── requirements.txt        # Python dependencies (example)
├── .gitignore              # Root-level ignore (includes both frontend/backend basics)
├── .github/                # CI and automation templates
├── tests/                  # Test scaffold
├── LICENSE
└── README.md               # This file
```

---

## Prerequisites
- Python 3.11+
- Node.js 18+ (or Bun/PNPM depending on your package manager)
- Docker & Docker Compose (recommended for local development)
- PostgreSQL (local or containerized)

---

## Quickstart - Backend (local)
1. Copy `.env.example` to `.env` and fill in values (esp. `DATABASE_URL`).
2. Create a virtual environment and install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
3. Apply database migrations or run `create_tables.sql` to create the `orders` table.
4. Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

---

## Quickstart - Frontend (local)
1. Navigate to `app-frontend/`.
2. Install dependencies and run the dev server:
```bash
npm install
npm run dev
# or `pnpm install && pnpm dev` or `bun install && bun dev` depending on your package manager
```
3. By default, Vite runs the frontend on `http://localhost:5173`. Ensure the backend CORS allows this origin.

---

## Docker Compose (recommended)
A `docker-compose.yml` can start PostgreSQL and the backend together. Example:
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: order_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    env_file: .env
    depends_on:
      - db
    ports:
      - "8000:8000"
    command: uvicorn main:app --host 0.0.0.0 --port 8000

volumes:
  pgdata:
```

---

## Tests
Run backend tests with:
```bash
pytest -q
```
Use `pytest-asyncio` for async endpoint tests and include fixtures to spin up a test database (or use a Dockerized test DB).

---

## CI & Automation
This repository includes a GitHub Actions scaffold under `.github/workflows/ci.yml` that runs unit tests and linting on push/PR. Dependabot config is provided to keep dependencies updated.

---

## Security & Best Practices
- Never commit `.env` or secrets to the repository. Use `.env.example` for reference.
- Use GitHub Secrets (or a secret manager) for CI and production credentials.
- Use TLS for production and restrict CORS to known domains.
- Use least privilege for DB credentials and rotate keys periodically.

---

## Contributing
Author: **Floyd Steev Santhmayer**

Please read `CONTRIBUTING.md` and follow these steps:
1. Fork the repository.
2. Create a branch for your feature/fix.
3. Run tests and linters locally.
4. Submit a pull request with clear description and tests.

---

## License
This project is released under the MIT License. See `LICENSE` for full text.

---

If you would like, I can also:
- Generate a `docker-compose.yml` and add it to the repo.
- Create a complete `main.py` backend example and a minimal `app-frontend` starter (React + Vite) so the project is runnable end-to-end.
- Produce a high-resolution export of the flowchart.

Tell me which of those to add next and I will include them in the ZIP.
