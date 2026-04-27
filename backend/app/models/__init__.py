from sqlalchemy import Column as SAColumn, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Board(Base):
    __tablename__ = "boards"

    id = SAColumn(Integer, primary_key=True, index=True)
    title = SAColumn(String(255), nullable=False, default="My Board")
    created_at = SAColumn(DateTime(timezone=True), server_default=func.now())

    columns = relationship("KanbanColumn", back_populates="board", cascade="all, delete-orphan",
                           order_by="KanbanColumn.order")


class KanbanColumn(Base):
    __tablename__ = "columns"

    id = SAColumn(Integer, primary_key=True, index=True)
    board_id = SAColumn(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    title = SAColumn(String(255), nullable=False)
    order = SAColumn(Integer, nullable=False, default=0)
    created_at = SAColumn(DateTime(timezone=True), server_default=func.now())

    board = relationship("Board", back_populates="columns")
    cards = relationship("Card", back_populates="column", cascade="all, delete-orphan",
                         order_by="Card.order")


class Card(Base):
    __tablename__ = "cards"

    id = SAColumn(Integer, primary_key=True, index=True)
    column_id = SAColumn(Integer, ForeignKey("columns.id", ondelete="CASCADE"), nullable=False)
    title = SAColumn(String(255), nullable=False)
    description = SAColumn(Text, nullable=True, default="")
    order = SAColumn(Integer, nullable=False, default=0)
    created_at = SAColumn(DateTime(timezone=True), server_default=func.now())

    column = relationship("KanbanColumn", back_populates="cards")
