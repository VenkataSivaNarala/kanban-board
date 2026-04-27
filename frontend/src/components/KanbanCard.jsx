import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CardModal from './CardModal'

export default function KanbanCard({ card, columnId, onEdit, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging
  } = useSortable({ id: `card-${card.id}`, data: { type: 'card', card, columnId } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`kanban-card ${isDragging ? 'dragging' : ''}`}
        onClick={() => setModalOpen(true)}
        {...attributes}
        {...listeners}
      >
        <div className="card-drag-handle">⠿</div>
        <div className="card-content">
          <p className="card-title">{card.title}</p>
          {card.description && (
            <p className="card-desc">{card.description}</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <CardModal
          card={card}
          columnId={columnId}
          onClose={() => setModalOpen(false)}
          onSave={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  )
}
