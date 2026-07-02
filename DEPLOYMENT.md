# PressGo Deployment Guide

This document prepares PressGo for v1.0 deployment using:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

This guide does not deploy the project automatically. It documents the required configuration, environment variables, and verification steps.

## Deployment Plan

1. Create a Neon PostgreSQL database.
2. Copy the Neon connection string and set it as `DATABASE_URL` in the backend hosting environment.
3. Deploy the backend service to Render.
4. Deploy the frontend app to Vercel.
5. Set `VITE_API_URL` in Vercel to the deployed backend API URL.
6. Run Prisma migrations against the production database.
7. Optionally seed demo data if a non-empty demo environment is needed.

## Target Hosting

### Database

- Neon PostgreSQL

### Backend

- Render Web Service

### Frontend

- Vercel

## Backend Deployment

### Recommended Render Settings

- Runtime: Node
- Root directory: `backend`
- Build command:

```bash
npm install
```

- Start command:

```bash
npm start
```

### Backend Production Environment Variables

Set these in Render:

```env
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_strong_secret
PORT=5050
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Backend Production Notes

- `DATABASE_URL` should point to the Neon database.
- `JWT_SECRET` should be a strong private secret.
- `FRONTEND_URL` should match the deployed Vercel domain to support CORS.
- `PORT` is typically injected by Render, but keeping it configured is fine because the backend already supports it.

## Frontend Deployment

### Recommended Vercel Settings

- Framework preset: Vite
- Root directory: `web`
- Build command:

```bash
npm run build
```

- Output directory:

```bash
dist
```

### Frontend Production Environment Variable

Set this in Vercel:

```env
VITE_API_URL=https://your-backend-url/api
```

Example:

```env
VITE_API_URL=https://pressgo-backend.onrender.com/api
```

## Prisma Migration Workflow

After the backend is connected to Neon, run Prisma migrations against the production database.

From the backend project:

```bash
cd backend
npx prisma migrate deploy
```

If you need to validate the schema before release:

```bash
npx prisma validate
```

## Optional Demo Data Seeding

If you want demo accounts and sample data in a staging or portfolio environment:

```bash
cd backend
npx prisma db seed
```

Do not seed demo data into a real production environment unless that is explicitly intended.

## Local-to-Production Environment Mapping

### Backend

Current local template:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/pressgo_db?schema=public"
JWT_SECRET="change_this_secret"
PORT=5050
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Production replacement:

```env
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_strong_secret
PORT=5050
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Frontend

Local template:

```env
VITE_API_URL=http://localhost:5050/api
```

Production replacement:

```env
VITE_API_URL=https://your-backend-url/api
```

## Deployment Verification Checklist

After deployment, verify:

- Backend root URL works
- Swagger URL works
- Frontend loads successfully
- Login works
- Customer order flow works
- Admin dashboard works

Suggested checks:

### Backend

- `GET https://your-backend-url/`
- `GET https://your-backend-url/api/docs`

### Frontend

- Open the Vercel URL
- Log in with a seeded or production account
- Confirm role-based navigation works
- Confirm API requests point to the deployed backend

## Useful Commands

### Backend Local

```bash
cd backend
npm install
npm run dev
```

### Backend Production Entry

```bash
cd backend
npm start
```

### Frontend Local

```bash
cd web
npm install
npm run dev
```

### Frontend Production Build

```bash
cd web
npm run build
```

## Final Notes

- This guide prepares PressGo for deployment but does not perform deployment automatically.
- Keep secrets in Render and Vercel environment settings only.
- Confirm the deployed frontend URL is reflected in backend `FRONTEND_URL`.
- Confirm the deployed backend URL is reflected in frontend `VITE_API_URL`.
