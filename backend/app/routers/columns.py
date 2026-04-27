from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import KanbanColumn as ColumnModel, Board
from app.schemas import ColumnOut, ColumnCreate, ColumnUpdate

router = APIRouter(prefix="/columns", tags=["columns"])


@router.post("/", response_model=ColumnOut, status_code=201)
def create_column(data: ColumnCreate, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == data.board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    max_order = db.query(ColumnModel).filter(ColumnModel.board_id == data.board_id).count()
    col = ColumnModel(board_id=data.board_id, title=data.title, order=max_order)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.patch("/{column_id}", response_model=ColumnOut)
def update_column(column_id: int, data: ColumnUpdate, db: Session = Depends(get_db)):
    col = db.query(ColumnModel).filter(ColumnModel.id == column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    if data.title is not None:
        col.title = data.title
    db.commit()
    db.refresh(col)
    return col


@router.delete("/{column_id}", status_code=204)
def delete_column(column_id: int, db: Session = Depends(get_db)):
    col = db.query(ColumnModel).filter(ColumnModel.id == column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    board_id = col.board_id
    db.delete(col)
    db.flush()

    # Reorder remaining columns
    remaining = db.query(ColumnModel).filter(
        ColumnModel.board_id == board_id
    ).order_by(ColumnModel.order).all()
    for i, c in enumerate(remaining):
        c.order = i

    db.commit()