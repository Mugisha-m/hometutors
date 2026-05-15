# HomeTutors

This repository contains the HomeTutors application with two separate workspaces:

- `backend/` - Node.js + TypeScript + Express + Prisma + PostgreSQL
- `frontend/` - React + TypeScript + Vite + Tailwind CSS

## Setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` from `.env.example` and set `DATABASE_URL`.
3. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
4. Start backend:
   ```bash
   npm run dev
   ```
5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
6. Start frontend:
   ```bash
   npm run dev
   ```

## Notes

- Tutor contact details remain hidden until admin confirms recruiter access.
- Recruiter users must sign up and be approved by admin for sensitive data.
- The app is designed around a single primary admin with monitoring and messaging capabilities.
