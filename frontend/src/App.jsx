import { Toaster } from 'react-hot-toast'
import { useBoard } from './hooks/useBoard'
import KanbanBoard from './components/KanbanBoard'

export default function App() {
  const { board, loading, ...actions } = useBoard()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your board…</p>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid #2d2d4e',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
        }}
      />
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <span className="header-logo">✦</span>
            <h1 className="header-title">{board?.title || 'Kanban Board'}</h1>
          </div>
          <div className="header-right">
            <span className="header-meta">
              {board?.columns?.length || 0} columns · {board?.columns?.reduce((a, c) => a + c.cards.length, 0) || 0} cards
            </span>
          </div>
        </header>

        <main className="board-container">
          {board && <KanbanBoard board={board} actions={actions} />}
        </main>
      </div>
    </>
  )
}
