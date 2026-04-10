# Task Orchestrator — Project Overview

## Purpose
A full-stack Kanban-style task/project management app built with:
- **Frontend:** Next.js (App Router), React, CSS Modules
- **Backend:** Node.js, gRPC, Prisma/Postgres
- **API:** BFF pattern (Next.js API routes proxy to gRPC backend)
- **Contracts:** Protobuf (ts-proto)

## Key Features
- Auth (JWT, cookie, context)
- Kanban board per project
- Project and task CRUD
- Optimistic UI updates
- Modular, scalable code structure

## Monorepo Structure
```
/ (root)
├── apps/
│   ├── backend/         # Node.js gRPC server, Prisma, service handlers
│   └── frontend/        # Next.js app, API routes, React components
├── packages/
│   ├── proto/           # Protobuf contracts (task.proto, auth.proto)
│   └── generated/       # ts-proto generated TypeScript types
├── README.md            # Main project readme
├── ME.md                # (You are here) Project background & structure
└── ...
```

## Frontend (apps/frontend)
- `app/` — Next.js App Router
  - `tasks/` — Kanban board, project/task modals, context, components
  - `api/` — BFF API routes (auth, tasks, projects)
  - `context/` — Auth context
  - `components/` — UI primitives (Modal, Form, AppButton, etc.)
- CSS Modules for styling
- State: React context/hooks, optimistic updates

## Backend (apps/backend)
- `src/services/` — Modular gRPC service handlers (task, project, auth)
- `prisma/` — Prisma schema, migrations
- `server.ts` — gRPC server entrypoint

## Contracts (packages/proto)
- `task.proto`, `auth.proto` — Service and message definitions
- Used for both backend and frontend type safety

## Dev Workflow
- Run backend and frontend separately (see README.md for scripts)
- Edit proto, regenerate types as needed
- Use Modal + Form primitives for all create/edit flows
- Optimistic UI for best user experience

---
For more details, see README.md or ask Copilot for code/architecture help.
