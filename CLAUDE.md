# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Docker (Full Stack)
```bash
docker-compose up                    # Start all services
# Frontend: http://localhost:5174
# Backend API: http://localhost:3041/api
# Nginx proxy: http://localhost:8084
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev                          # Dev server on port 5173
npm run build                        # Production build to dist/
npm run preview                      # Preview production build
```

### Backend (Node.js + Express)
```bash
cd backend
npm run dev                          # Dev with nodemon (auto-reload)
npm run start                        # Production start
```

## Architecture

**Tech Stack:** React 18 + Vite frontend, Express + PostgreSQL backend, Nginx reverse proxy, all containerized with Docker.

**Purpose:** Time tracking application where users track duration spent on "processes" via "instances" (individual tracking sessions).

### Database Schema (db/init.sql)
- **users** - Authentication with bcrypt passwords, role-based (admin/user)
- **processes** - Trackable activities with optional JSONB metadata_schema for custom fields
- **instances** - Individual tracking sessions with start_time, end_time, duration_seconds, and JSONB metadata

### Frontend Architecture (frontend/src/)
- **pages/** - Login, Register, Dashboard, Processes, ProcessDetail
- **components/** - Timer, ProcessList, InstanceList, Layout, forms
- **hooks/** - `useAuth()` (auth context), `useApi()` (HTTP with JWT), `useTimer()` (stopwatch logic)
- **context/** - AuthContext manages JWT token (stored in localStorage)

### Backend API (backend/src/)
- **routes/auth.js** - POST /register, POST /login, GET /me
- **routes/processes.js** - CRUD for processes (users own custom, admins manage official)
- **routes/instances.js** - CRUD for instances + GET /stats/summary
- **middleware/auth.js** - JWT verification, attaches user to req.user

### Request Flow
```
Browser → Nginx :8084 → /api/* routes to Backend :3001
                      → /* routes to Frontend :5173
```

Frontend uses `useApi()` hook which auto-includes JWT Bearer token on all requests.

## Key Patterns

- All database primary keys are UUIDs
- Authorization: ownership checks + role-based (admin can manage official processes)
- Flexible metadata: processes define schema, instances store values as JSONB
- Protected routes use `ProtectedRoute` component checking `useAuth()` state

## Environment Variables (.env.example)
```
DATABASE_URL=postgres://tandm:tandm_dev_password@postgres:5432/tandm
JWT_SECRET=change_this_to_a_secure_random_string
PORT=3001
VITE_API_URL=http://localhost:3001/api
```

## Port Mapping (Docker)
| Service  | Internal | External |
|----------|----------|----------|
| Frontend | 5173     | 5174     |
| Backend  | 3001     | 3041     |
| Postgres | 5432     | 5435     |
| Nginx    | 80       | 8084     |
