import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'

export default function KanbanBoard({ board, actions }) {
  const { addColumn, renameColumn, removeColumn, addCard, editCard, removeCard, moveCard } = actions
  const [activeCard, setActiveCard] = useState(null)
  const [addingCol, setAddingCol] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleAddColumn = () => {
    if (newColTitle.trim()) {
      addColumn(newColTitle.trim())
      setNewColTitle('')
      setAddingCol(false)
    }
  }

  const handleDragStart = ({ active }) => {
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card)
    }
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveCard(null)
    if (!over) return

    const activeData = active.data.current
    if (activeData?.type !== 'card') return

    const card = activeData.card
    const fromColumnId = activeData.columnId

    // Determine target column
    let toColumnId, toIndex

    if (over.id.toString().startsWith('col-')) {
      toColumnId = parseInt(over.id.toString().replace('col-', ''))
      const toCol = board.columns.find(c => c.id === toColumnId)
      toIndex = toCol ? toCol.cards.length : 0
    } else if (over.id.toString().startsWith('card-')) {
      const overCardId = parseInt(over.id.toString().replace('card-', ''))
      const overCol = board.columns.find(c => c.cards.some(ca => ca.id === overCardId))
      if (!overCol) return
      toColumnId = overCol.id
      toIndex = overCol.cards.findIndex(ca => ca.id === overCardId)
    } else {
      return
    }

    // Build optimistic update
    const optimisticColumns = board.columns.map(col => {
      if (col.id === fromColumnId && col.id === toColumnId) {
        const oldIndex = col.cards.findIndex(c => c.id === card.id)
        const newCards = arrayMove(col.cards, oldIndex, toIndex)
        return { ...col, cards: newCards.map((c, i) => ({ ...c, order: i })) }
      }
      if (col.id === fromColumnId) {
        return { ...col, cards: col.cards.filter(c => c.id !== card.id).map((c, i) => ({ ...c, order: i })) }
      }
      if (col.id === toColumnId) {
        const withCard = [...col.cards]
        withCard.splice(toIndex, 0, { ...card, column_id: toColumnId })
        return { ...col, cards: withCard.map((c, i) => ({ ...c, order: i })) }
      }
      return col
    })

    moveCard(card.id, fromColumnId, toColumnId, toIndex, optimisticColumns)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="board">
        {board.columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            onRename={renameColumn}
            onDelete={removeColumn}
            onAddCard={addCard}
            onEditCard={editCard}
            onDeleteCard={removeCard}
          />
        ))}

        <div className="add-col-area">
          {addingCol ? (
            <div className="add-col-form">
              <input
                className="add-col-input"
                placeholder="Column name..."
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') { setAddingCol(false); setNewColTitle('') } }}
                autoFocus
              />
              <div className="add-col-actions">
                <button className="btn-add-confirm" onClick={handleAddColumn}>Add Column</button>
                <button className="btn-add-cancel" onClick={() => { setAddingCol(false); setNewColTitle('') }}>✕</button>
              </div>
            </div>
          ) : (
            <button className="add-col-btn" onClick={() => setAddingCol(true)}>
              <span className="add-col-plus">+</span>
              <span>Add Column</span>
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="kanban-card drag-overlay">
            <div className="card-drag-handle">⠿</div>
            <div className="card-content">
              <p className="card-title">{activeCard.title}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
