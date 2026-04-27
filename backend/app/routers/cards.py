from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Card, KanbanColumn as ColumnModel
from app.schemas import CardOut, CardCreate, CardUpdate, CardMove

router = APIRouter(prefix="/cards", tags=["cards"])


@router.post("/", response_model=CardOut, status_code=201)
def create_card(data: CardCreate, db: Session = Depends(get_db)):
    col = db.query(ColumnModel).filter(ColumnModel.id == data.column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")

    max_order = db.query(Card).filter(Card.column_id == data.column_id).count()
    card = Card(column_id=data.column_id, title=data.title,
                description=data.description or "", order=max_order)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{card_id}", response_model=CardOut)
def update_card(card_id: int, data: CardUpdate, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if data.title is not None:
        card.title = data.title
    if data.description is not None:
        card.description = data.description
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{card_id}/move", response_model=CardOut)
def move_card(card_id: int, data: CardMove, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    old_column_id = card.column_id
    new_column_id = data.column_id
    new_order = data.order

    if old_column_id == new_column_id:
        # Reorder within same column
        cards = db.query(Card).filter(
            Card.column_id == old_column_id, Card.id != card_id
        ).order_by(Card.order).all()
        cards.insert(new_order, card)
        for i, c in enumerate(cards):
            c.order = i
    else:
        # Remove from old column and reorder
        old_cards = db.query(Card).filter(
            Card.column_id == old_column_id, Card.id != card_id
        ).order_by(Card.order).all()
        for i, c in enumerate(old_cards):
            c.order = i

        # Insert into new column
        new_cards = db.query(Card).filter(
            Card.column_id == new_column_id
        ).order_by(Card.order).all()
        card.column_id = new_column_id
        new_cards.insert(new_order, card)
        for i, c in enumerate(new_cards):
            c.order = i

    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    column_id = card.column_id
    db.delete(card)
    db.flush()

    # Reorder remaining cards
    remaining = db.query(Card).filter(
        Card.column_id == column_id
    ).order_by(Card.order).all()
    for i, c in enumerate(remaining):
        c.order = i

    db.commit()