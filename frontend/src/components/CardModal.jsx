import { useState, useEffect } from 'react'

export default function CardModal({ card, columnId, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(card.title)
  const [desc, setDesc] = useState(card.description || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = () => {
    if (!title.trim()) return
    onSave(card.id, columnId, { title: title.trim(), description: desc })
    onClose()
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(card.id, columnId)
      onClose()
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">✦</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label className="field-label">CARD TITLE</label>
          <input
            className="modal-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />

          <label className="field-label" style={{ marginTop: '1.25rem' }}>DESCRIPTION</label>
          <textarea
            className="modal-textarea"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Add a description..."
            rows={4}
          />
        </div>

        <div className="modal-footer">
          <button
            className={`btn-delete ${confirmDelete ? 'btn-delete-confirm' : ''}`}
            onClick={handleDelete}
          >
            {confirmDelete ? '⚠ Confirm Delete' : 'Delete'}
          </button>
          <div className="modal-actions-right">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-save" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
