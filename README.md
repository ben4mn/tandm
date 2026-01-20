# TandM - Time and Motion Tracker

A time tracking application for tracking duration spent on "processes" via "instances" (individual tracking sessions).

## Quick Start with Docker

```bash
docker-compose up
```

Once running:
- **App**: http://localhost:8084
- **Frontend direct**: http://localhost:5174
- **Backend API**: http://localhost:3041/api

### Test User Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | password123 | Admin |
| user@test.com | password123 | User |

**Admin users** can create and manage official processes.
**Regular users** can track time against any process and create personal processes.

## Default Example Processes

The database is seeded with three work-specific processes:

### 1. Market Visit Deck
Track time building market visit decks - pulling reports and using multiple tools.

| Field | Type | Required |
|-------|------|----------|
| Current Step | Select | No |
| Client/Market | Text | No |
| Notes | Textarea | No |

**Current Step options:** Report Pull, Data Analysis, Slide Building, Review, Final Polish

### 2. Prep for Client Convo - Generic
Capture your prep process and time for client conversations.

| Field | Type | Required |
|-------|------|----------|
| Client Name | Text | Yes |
| Prep Steps Completed | Textarea | No |
| Key Topics to Cover | Textarea | No |
| Notes | Textarea | No |

### 3. Prep for Pitch
Track pitch preparation time and process.

| Field | Type | Required |
|-------|------|----------|
| Pitch/Opportunity Name | Text | Yes |
| Prep Steps Completed | Textarea | No |
| Key Differentiators | Textarea | No |
| Notes | Textarea | No |

## Architecture

**Tech Stack:** React 18 + Vite frontend, Express + PostgreSQL backend, Nginx reverse proxy, all containerized with Docker.

### Database Schema

- **users** - Authentication with bcrypt passwords, role-based (admin/user)
- **processes** - Trackable activities with optional JSONB metadata_schema for custom fields
- **instances** - Individual tracking sessions with start_time, end_time, duration_seconds, and JSONB metadata

### Port Mapping (Docker)

| Service | Internal | External |
|---------|----------|----------|
| Frontend | 5173 | 5174 |
| Backend | 3001 | 3041 |
| Postgres | 5432 | 5435 |
| Nginx | 80 | 8084 |

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Setup

1. Create PostgreSQL database:
```bash
createdb tandm
psql tandm < db/init.sql
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database connection string
```

3. Start backend:
```bash
cd backend
npm install
npm run dev
```

4. Start frontend:
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgres://tandm:tandm_dev_password@localhost:5432/tandm
JWT_SECRET=change_this_to_a_secure_random_string
PORT=3001
VITE_API_URL=http://localhost:3001/api
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Processes
- `GET /api/processes` - List all processes
- `POST /api/processes` - Create process
- `GET /api/processes/:id` - Get process details
- `PUT /api/processes/:id` - Update process
- `DELETE /api/processes/:id` - Delete process

### Instances
- `GET /api/instances` - List user's instances
- `POST /api/instances` - Create/start instance
- `GET /api/instances/:id` - Get instance details
- `PUT /api/instances/:id` - Update instance (stop timer, add metadata)
- `DELETE /api/instances/:id` - Delete instance
- `GET /api/instances/stats/summary` - Get time tracking summary

## Re-seeding Data

If you need to re-seed the example processes on an existing database:

```bash
cd backend/src
node seed-examples.js
```

Note: This requires an admin user to exist in the database.

## Resetting Docker Data

To completely reset and start fresh:

```bash
docker-compose down -v  # -v removes volumes (database data)
docker-compose up
```
