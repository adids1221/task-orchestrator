# Task Orchestrator

A task management system built with a modern full-stack architecture.

## Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Node.js, TypeScript, gRPC
- **Database:** Supabase (PostgreSQL), Prisma
- **Deployment:** Docker, AWS ECS

## Structure

- `apps/frontend` — Next.js web app
- `apps/backend` — gRPC server
- `packages/proto` — Protobuf definitions
- `packages/generated` — Auto-generated types

## Getting Started

```bash
npm install
npm run dev:backend
npm run dev:frontend
```