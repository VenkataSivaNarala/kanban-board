from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Board, KanbanColumn as ColumnModel, Card
from app.schemas import BoardOut, BoardCreate

router = APIRouter(prefix="/boards", tags=["boards"])


@router.get("/{board_id}", response_model=BoardOut)
def get_board(board_id: int, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


@router.post("/", response_model=BoardOut, status_code=201)
def create_board(data: BoardCreate, db: Session = Depends(get_db)):
    board = Board(title=data.title)
    db.add(board)
    db.flush()

    default_columns = ["To Do", "In Progress", "Done"]
    for i, col_title in enumerate(default_columns):
        col = ColumnModel(board_id=board.id, title=col_title, order=i)
        db.add(col)

    db.commit()
    db.refresh(board)
    return board


@router.get("/default/init", response_model=BoardOut)
def get_or_create_default_board(db: Session = Depends(get_db)):
    board = db.query(Board).first()
    if not board:
        board = Board(title="My Kanban Board")
        db.add(board)
        db.flush()
        default_columns = ["To Do", "In Progress", "Done"]
        for i, col_title in enumerate(default_columns):
            col = ColumnModel(board_id=board.id, title=col_title, order=i)
            db.add(col)
        db.commit()
        db.refresh(board)
    return board
