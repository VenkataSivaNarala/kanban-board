import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Board
export const getDefaultBoard = () => api.get('/boards/default/init').then(r => r.data)

// Columns
export const createColumn = (boardId, title) =>
  api.post('/columns/', { board_id: boardId, title }).then(r => r.data)

export const updateColumn = (columnId, title) =>
  api.patch(`/columns/${columnId}`, { title }).then(r => r.data)

export const deleteColumn = (columnId) =>
  api.delete(`/columns/${columnId}`)

// Cards
export const createCard = (columnId, title) =>
  api.post('/cards/', { column_id: columnId, title, description: '' }).then(r => r.data)

export const updateCard = (cardId, data) =>
  api.patch(`/cards/${cardId}`, data).then(r => r.data)

export const moveCard = (cardId, columnId, order) =>
  api.patch(`/cards/${cardId}/move`, { column_id: columnId, order }).then(r => r.data)

export const deleteCard = (cardId) =>
  api.delete(`/cards/${cardId}`)
