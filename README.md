# Kanban Board App

A full-stack Trello-style Kanban board built with **FastAPI + MySQL + Vite + React**.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python 3.11+, FastAPI, SQLAlchemy 2.0   |
| Database  | MySQL 8.0+                              |
| Frontend  | Vite + React 18, @dnd-kit (drag & drop) |
| Styling   | Plain CSS with CSS variables            |

---

## Project Structure

```
kanban/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point + CORS
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── routers/         # Route handlers (boards, columns, cards)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/             # Axios API client
    │   ├── components/      # KanbanBoard, KanbanColumn, KanbanCard, CardModal
    │   ├── hooks/           # useBoard (state management)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── vite.config.js
```

---

## Setup & Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+ running locally

### 1. Database

```sql
CREATE DATABASE kanban_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and update DATABASE_URL with your MySQL credentials

# Run the server (tables are auto-created on startup)
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## Environment Variables

| Variable       | Description                                 | Example                                            |
|----------------|---------------------------------------------|----------------------------------------------------|
| `DATABASE_URL` | MySQL connection string (SQLAlchemy format) | `mysql+pymysql://root:password@localhost:3306/kanban_db` |

> ⚠️ Never commit `.env` to version control.

---

## Features

- **Columns**: Add, rename (click title), delete with confirmation
- **Cards**: Add, edit (click card → modal), delete with confirmation
- **Drag & Drop**: Move cards between columns or reorder within a column using `@dnd-kit`
- **Persistence**: All drag-and-drop moves are persisted to MySQL via REST API
- **Optimistic UI**: Board updates instantly on drag; rolls back on API error
- **Toast notifications**: Success/error feedback on all mutations

---

## API Endpoints

| Method | Path                        | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | `/boards/default/init`      | Get or create default board    |
| POST   | `/columns/`                 | Create a new column            |
| PATCH  | `/columns/{id}`             | Rename a column                |
| DELETE | `/columns/{id}`             | Delete column + cascade cards  |
| POST   | `/cards/`                   | Create a new card              |
| PATCH  | `/cards/{id}`               | Update card title/description  |
| PATCH  | `/cards/{id}/move`          | Move card (column + order)     |
| DELETE | `/cards/{id}`               | Delete a card                  |

---

## Trade-offs & Shortcuts (due to 2-hour scope)

1. **Single board only** — The app supports one default board. Multi-board support is trivial to add (the schema supports it via `board_id` on columns) but skipped to stay focused.
2. **No authentication** — Single-user, no login required as specified.
3. **Order uses integer slots** — Cards use integer `order` field; reordering shifts all siblings. A fractional (float) ordering strategy (e.g., Jira-style) would be more efficient at scale but overkill here.
4. **No migration tool** — Tables are created via `Base.metadata.create_all()` on startup. Alembic is listed in requirements for future use.


## Nice-to-Haves (with more time)

- Labels / color tags on cards
- Due dates with overdue indicator
- Search bar to filter cards by title
- Dark/light mode toggle
- Multiple boards with board switcher
- Alembic migrations for schema evolution
