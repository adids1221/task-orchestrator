# Task Orchestrator

A high-performance, real-time task management system built to demonstrate modern full-stack architecture.

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, Vite, [Zustand/Redux]
- **Backend:** Node.js, TypeScript, gRPC, Protobuf
- **Database:** Supabase (PostgreSQL)
- **Communication:** gRPC (Server-side streaming for real-time updates)
- **Real-time/Event Bus:** Redis
- **ORM:** Prisma
- **Deployment:** Docker, AWS ECS (Fargate)

## 🏗 Architecture

This project follows a **Modular Monorepo** structure:
- `apps/frontend`: React application.
- `apps/backend`: Node.js gRPC server.
- `packages/proto`: Shared Protobuf definitions (Source of Truth).
- `packages/generated`: Auto-generated TypeScript types from Protobuf.

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- [Your Package Manager: npm/pnpm/yarn]

### Installation
1. Clone the repo: `git clone <your-repo-url>`
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env`
4. Start the development environment: `docker-compose up -d`
5. Run the app: `npm run dev`

## 📝 Roadmap
- [ ] Define Protobuf schemas
- [ ] Setup Backend & Prisma
- [ ] Implement Auth Service
- [ ] Implement Task Service
- [ ] Frontend integration