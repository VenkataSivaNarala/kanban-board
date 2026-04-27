from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Card Schemas ---
class CardBase(BaseModel):
    title: str
    description: Optional[str] = ""

class CardCreate(CardBase):
    column_id: int

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class CardMove(BaseModel):
    column_id: int
    order: int

class CardOut(CardBase):
    id: int
    column_id: int
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Column Schemas ---
class ColumnBase(BaseModel):
    title: str

class ColumnCreate(ColumnBase):
    board_id: int

class ColumnUpdate(BaseModel):
    title: Optional[str] = None

class ColumnOut(ColumnBase):
    id: int
    board_id: int
    order: int
    cards: List[CardOut] = []
    created_at: datetime

    class Config:
        from_attributes = True


# --- Board Schemas ---
class BoardBase(BaseModel):
    title: str

class BoardCreate(BoardBase):
    pass

class BoardOut(BoardBase):
    id: int
    columns: List[ColumnOut] = []
    created_at: datetime

    class Config:
        from_attributes = True
