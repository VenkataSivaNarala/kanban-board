from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import Board, KanbanColumn, Card  # noqa: F401 — ensure models are registered
from app.routers import boards, columns, cards

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kanban API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(boards.router)
app.include_router(columns.router)
app.include_router(cards.router)


@app.get("/health")
def health():
    return {"status": "ok"}