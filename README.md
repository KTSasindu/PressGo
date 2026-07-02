# PressGo — Smart Laundry Aggregation Platform

PressGo is a full-stack laundry aggregation platform that connects customers, laundry owners, drivers, and administrators through a single web-based system. It combines order management, service discovery, delivery dispatch, role-based dashboards, and operational tooling into one practical workflow.

## Overview

PressGo is designed as an engineering portfolio project with a production-style structure:

- Express.js REST API backend
- PostgreSQL database with Prisma ORM
- React + Vite frontend
- JWT authentication and role-based access control
- Swagger API documentation
- Jest and Supertest backend testing
- Docker-based local development
- GitHub Actions CI

## Features

### Customer

- Browse active laundries
- View laundry services
- Build and place orders
- Track orders through workflow stages
- Review completed orders

### Laundry Owner

- Manage shop profile
- Manage services
- Process orders using a workflow / Kanban board
- View revenue visibility

### Driver

- View assigned deliveries
- Mark orders as picked up
- Mark orders as delivered

### Admin

- Dashboard analytics
- User management
- Shop management
- Payment management
- Delivery dispatch management

### Platform

- Notifications
- Order timeline and status history
- Payment tracking
- Reviews
- Swagger API documentation
- Automated backend tests
- Docker support

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation

### Tools

- Docker
- GitHub Actions
- Jest
- Supertest
- Swagger

## Architecture

```txt
Frontend
   ↓
REST API
   ↓
Express Controllers
   ↓
Prisma ORM
   ↓
PostgreSQL
```

## Project Structure

```txt
PressGo/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── validations/
│   │   └── server.js
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── web/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
├── .github/
│   └── workflows/
├── docker-compose.yml
├── package.json
└── README.md
```

## Environment Setup

### Backend

Use `backend/.env.example` as the template:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/pressgo_db?schema=public"
JWT_SECRET="change_this_secret"
PORT=5050
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend

Use `web/.env.example` as the template:

```env
VITE_API_URL=http://localhost:5050/api
```

## Local Development

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd web
npm install
npm run dev
```

### Root Scripts

```bash
npm run backend:dev
npm run backend:test
npm run web:dev
npm run web:build
```

## Demo Accounts

### Admin

- `admin@pressgo.com / 123456`

### Customer

- `kithsiri@pressgo.com / 123456`

### Laundry Owner

- `owner@freshwash.com / 123456`

### Driver

- `driver@pressgo.com / 123456`

## API Documentation

Swagger UI is available at:

- `http://localhost:5050/api/docs`

## Testing

Run backend tests with:

```bash
cd backend
npm test
```

## Docker

For local containerized development:

```bash
docker compose build
docker compose up
```

## Development Status

- Core MVP completed
- Production deployment planned

## Future Improvements

- Online payment gateway integration
- Maps / GPS delivery tracking
- WebSocket real-time updates
- Mobile application
- Cloud deployment
- Advanced analytics

## Notes

PressGo is currently focused on solid local development workflows, clear API structure, role-based operations, and portfolio-grade full-stack engineering practices. The next phase is production deployment and deeper operational refinement.
