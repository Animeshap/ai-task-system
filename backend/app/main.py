from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa: F401 - ensures all models are registered on Base
from app.routers import auth, tasks, documents, search, analytics

# For this MVP we create tables directly from models instead of Alembic migrations.
# Swap this for `alembic upgrade head` in a production setup.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Task & Knowledge Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "API is running. See /docs for interactive API docs."}
