import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import * as api from '../api'

export function useBoard() {
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchBoard = useCallback(async () => {
    try {
      const data = await api.getDefaultBoard()
      setBoard(data)
    } catch (e) {
      toast.error('Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  const addColumn = async (title) => {
    try {
      const col = await api.createColumn(board.id, title)
      setBoard(b => ({ ...b, columns: [...b.columns, { ...col, cards: [] }] }))
    } catch {
      toast.error('Failed to add column')
    }
  }

  const renameColumn = async (columnId, title) => {
    const prev = board.columns
    setBoard(b => ({
      ...b,
      columns: b.columns.map(c => c.id === columnId ? { ...c, title } : c)
    }))
    try {
      await api.updateColumn(columnId, title)
    } catch {
      setBoard(b => ({ ...b, columns: prev }))
      toast.error('Failed to rename column')
    }
  }

  const removeColumn = async (columnId) => {
    const prev = board.columns
    setBoard(b => ({ ...b, columns: b.columns.filter(c => c.id !== columnId) }))
    try {
      await api.deleteColumn(columnId)
      toast.success('Column deleted')
    } catch {
      setBoard(b => ({ ...b, columns: prev }))
      toast.error('Failed to delete column')
    }
  }

  const addCard = async (columnId, title) => {
    try {
      const card = await api.createCard(columnId, title)
      setBoard(b => ({
        ...b,
        columns: b.columns.map(c =>
          c.id === columnId ? { ...c, cards: [...c.cards, card] } : c
        )
      }))
    } catch {
      toast.error('Failed to add card')
    }
  }

  const editCard = async (cardId, columnId, data) => {
    const prev = board.columns
    setBoard(b => ({
      ...b,
      columns: b.columns.map(c =>
        c.id === columnId
          ? { ...c, cards: c.cards.map(card => card.id === cardId ? { ...card, ...data } : card) }
          : c
      )
    }))
    try {
      await api.updateCard(cardId, data)
    } catch {
      setBoard(b => ({ ...b, columns: prev }))
      toast.error('Failed to update card')
    }
  }

  const removeCard = async (cardId, columnId) => {
    const prev = board.columns
    setBoard(b => ({
      ...b,
      columns: b.columns.map(c =>
        c.id === columnId ? { ...c, cards: c.cards.filter(card => card.id !== cardId) } : c
      )
    }))
    try {
      await api.deleteCard(cardId)
      toast.success('Card deleted')
    } catch {
      setBoard(b => ({ ...b, columns: prev }))
      toast.error('Failed to delete card')
    }
  }

  const moveCard = async (cardId, fromColumnId, toColumnId, newOrder, optimisticColumns) => {
    const prev = board.columns
    setBoard(b => ({ ...b, columns: optimisticColumns }))
    try {
      await api.moveCard(cardId, toColumnId, newOrder)
    } catch {
      setBoard(b => ({ ...b, columns: prev }))
      toast.error('Failed to move card')
    }
  }

  return {
    board, loading,
    addColumn, renameColumn, removeColumn,
    addCard, editCard, removeCard, moveCard
  }
}
