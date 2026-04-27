import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

export default function KanbanColumn({ column, onRename, onDelete, onAddCard, onEditCard, onDeleteCard }) {
  const [isEditing, setIsEditing] = useState(false)
  const [titleVal, setTitleVal] = useState(column.title)
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const saveTitle = () => {
    const trimmed = titleVal.trim()
    if (trimmed && trimmed !== column.title) onRename(column.id, trimmed)
    else setTitleVal(column.title)
    setIsEditing(false)
  }

  const handleAddCard = () => {
    const trimmed = newCardTitle.trim()
    if (trimmed) {
      onAddCard(column.id, trimmed)
      setNewCardTitle('')
      setAddingCard(false)
    }
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(column.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const { setNodeRef, isOver } = useDroppable({ id: `col-${column.id}` })
  const cardIds = column.cards.map(c => `card-${c.id}`)

  return (
    <div className={`kanban-column ${isOver ? 'col-over' : ''}`}>
      <div className="col-header">
        <div className="col-title-area">
          <span className="col-count">{column.cards.length}</span>
          {isEditing ? (
            <input
              ref={inputRef}
              className="col-title-input"
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleVal(column.title); setIsEditing(false) } }}
            />
          ) : (
            <h3 className="col-title" onClick={() => setIsEditing(true)}>{column.title}</h3>
          )}
        </div>
        <button
          className={`col-delete-btn ${confirmDelete ? 'col-delete-confirm' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Delete column'}
        >
          {confirmDelete ? '!' : '✕'}
        </button>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="col-cards">
          {column.cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
          {column.cards.length === 0 && (
            <div className="col-empty">Drop cards here</div>
          )}
        </div>
      </SortableContext>

      <div className="col-footer">
        {addingCard ? (
          <div className="add-card-form">
            <input
              className="add-card-input"
              placeholder="Card title..."
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCard(); if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle('') } }}
              autoFocus
            />
            <div className="add-card-actions">
              <button className="btn-add-confirm" onClick={handleAddCard}>Add Card</button>
              <button className="btn-add-cancel" onClick={() => { setAddingCard(false); setNewCardTitle('') }}>✕</button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={() => setAddingCard(true)}>
            <span>+</span> Add card
          </button>
        )}
      </div>
    </div>
  )
}
