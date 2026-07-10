# Backend — AI-Powered Task & Knowledge Management System

FastAPI + MySQL + FAISS semantic search + JWT auth/RBAC.

## Tech Stack
- **Framework:** FastAPI
- **DB:** MySQL (SQLAlchemy ORM)
- **Auth:** JWT (`python-jose`) + bcrypt password hashing (`passlib`)
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`, 384-dim, runs locally)
- **Vector store:** FAISS (`IndexFlatL2`), persisted to disk under `vector_store_data/`

## How the AI search works
Uploaded `.txt` documents are split into overlapping word chunks. Each chunk is
embedded locally with `sentence-transformers` (no external API call) and added
to a FAISS index. A search query is embedded the same way and matched against
the index with L2 distance; the top-k nearest chunks are returned along with
the source `document_id`. A MySQL `document_chunks` table mirrors the FAISS
positions so results can always be traced back to a document.

## Setup

### 1. Create the database
```sql
CREATE DATABASE task_knowledge_db;
```

### 2. Configure environment
```bash
cp .env.example .env
# edit .env: set DATABASE_URL to your MySQL credentials, set a real SECRET_KEY
```

### 3. Install dependencies
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Create tables + seed an admin/user
```bash
python seed.py
```
This creates the `admin` and `user` roles and two accounts you can log in with:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

### 5. Run the server
```bash
uvicorn app.main:app --reload
```
API docs (Swagger UI): http://localhost:8000/docs

## API Overview

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/login` | any | Returns JWT + role |
| POST | `/auth/register` | admin | Create a new user |
| POST | `/documents` | admin | Upload a `.txt` file, auto-indexes embeddings |
| GET | `/documents` | any | List uploaded documents |
| GET | `/search?q=...&k=5` | any | Semantic search over indexed documents |
| POST | `/tasks` | admin | Create + assign a task |
| GET | `/tasks?status=&assigned_to=` | any | List tasks (filtered); users see only their own |
| PATCH | `/tasks/{id}/status` | any (owner) / admin | Update task status |
| GET | `/analytics` | admin | Task counts + top search queries |

### Example: login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Example: upload a document
```bash
curl -X POST http://localhost:8000/documents \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "file=@notes.txt"
```

### Example: search
```bash
curl -G http://localhost:8000/search \
  -H "Authorization: Bearer <TOKEN>" \
  --data-urlencode "q=how do I reset my password"
```

## Project Structure
```
app/
├── main.py              # app entrypoint, router registration
├── config.py             # env-based settings
├── database.py            # SQLAlchemy engine/session
├── models/                # ORM models (users, roles, tasks, documents, logs)
├── schemas/                # Pydantic request/response schemas
├── routers/                 # API endpoints (thin — delegate to services)
├── services/                 # business logic (embeddings, activity logging)
├── core/                      # security (JWT/hashing) + auth dependencies
└── vector_store/               # FAISS index wrapper
```

## Notes
- Tables are created directly from SQLAlchemy models (`Base.metadata.create_all`)
  for MVP simplicity. Swap in Alembic migrations for a production setup.
- Only `.txt` uploads are supported per the assignment spec (PDF is optional
  and not implemented here — see the `pdf` skill / `pypdf` if you want to add it).
- Activity logging happens inline in each router (login, document_upload,
  task_update, search) rather than being bolted on afterward.
