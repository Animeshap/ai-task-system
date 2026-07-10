# Frontend — AI-Powered Task & Knowledge Management System

React (Vite) + React Router + Axios, talking to the FastAPI backend at `http://localhost:8000`.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Make sure the backend is running first (`uvicorn app.main:app --reload` from the `backend/` folder) and that you've run `python seed.py` there so you have accounts to log in with:

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Structure

```
src/
├── api/            axios calls, one file per resource (auth, tasks, documents, search, analytics)
├── context/         AuthContext — stores JWT + role, exposes login/logout
├── routes/            ProtectedRoute — redirects based on auth state and role
├── components/         Navbar, AppLayout, StatusPill, MatchGauge
└── pages/
    ├── Login.jsx
    ├── Search.jsx        shared semantic search, used by both roles
    ├── admin/            UploadDocs, AdminTasks, Analytics
    └── user/             UserTasks
```

## Notes

- The JWT is stored in `localStorage` and attached to every request via an axios
  interceptor (`src/api/axiosInstance.js`). A 401 response automatically clears
  the token and redirects to `/login`.
- `ProtectedRoute` guards routes by auth state and, optionally, by admin role —
  non-admins are redirected to `/unauthorized` if they hit an admin-only URL directly.
- The admin "assign task" form takes a raw user ID for simplicity (the backend
  spec doesn't include a "list users" endpoint) — check user IDs via
  `/auth/register` responses or your MySQL `users` table.
- Search results show a small "match" gauge derived from the FAISS L2 distance
  score returned by the backend, so relevance is easy to read at a glance.

## Build for production

```bash
npm run build
```
Outputs static files to `dist/`, which you can serve with any static host (or point FastAPI's `StaticFiles` at it).
