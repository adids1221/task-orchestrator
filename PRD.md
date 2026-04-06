# 📝 Product Requirements Document (PRD): Task Orchestrator

**Version:** 1.0  

## 1. Project Vision
To build a high-performance, real-time task management platform (Kanban-style) that demonstrates professional-grade backend engineering, strict type-safety via gRPC, and seamless real-time user experiences.

## 2. Target User Personas
* **Admin (Team Owner):** Has full authority over the team, can create projects, invite members, and delete any data.
* **Member:** Can create tasks, move tasks, assign tasks to others, and manage tasks within their assigned projects.
* **Viewer:** Can view boards and tasks but cannot modify status, assign, or delete.

## 3. Functional Requirements (User Stories)

### 3.1 Authentication & Access
* **US1:** As a user, I want to **sign up and log in** so that my tasks and projects are private to my account.
* **US2:** As a user, I want to be **invited to a team** so that I can collaborate with others on specific projects.

### 3.2 Project & Team Management
* **US3:** As an Admin, I want to **create multiple projects** under a single team to organize different workstreams.
* **US4:** As a user, I want to **move a task from one project to another** to handle shifting priorities.

### 3.3 Task Management (The Core)
* **US5:** As a user, I want to **create a task** with a title, description, and initial status.
* **US6:** As a user, I want to **assign a task** to another team member to delegate responsibility.
* **US7:** As a user, I want to **update a task's status** (e.g., moving from "To Do" to "In Progress") to reflect real-time progress.
* **US8:** As a user, I want to **delete a task** (with the ability for an admin to restore it).

### 3.4 Discovery & Organization
* **US9:** As a user, I want to **filter tasks** by status, assigned user, project, or team.
* **US10:** As a user, I want to **search for tasks** by name or unique Task ID.

---

## 4. Non-Functional Requirements (System Requirements)

### 4.1 Real-Time Experience (The "No-Refresh" Rule)
* **NFR1 (Creation):** When any user creates a task, the task must appear on all relevant users' screens instantly without a page refresh.
* **NFR2 (Movement):** When a task is moved (via Drag & Drop) or its status is changed, the UI must update across all connected clients via gRPC streaming.
* **NFR3 (Deletion):** When a task is deleted, it must disappear from all active user boards immediately.

### 4.2 Data Integrity & Safety
* **NFR4 (Strict Typing):** All API communication must be validated against **Protobuf** schemas. Invalid data must be rejected at the transport layer.
* **NFR5 (Soft Delete):** Deleted tasks must not be immediately purged from the database. They must be "Soft Deleted" (marked with a timestamp) and remain recoverable for a configurable period.

### 4.3 Scalability & Performance
* **NFR6 (Low Latency):** The system must use an event-driven architecture (Redis Pub/Sub) to ensure real-time updates are delivered with sub-second latency.

---

## 5. Technical Specification (High-Level)

* **Frontend:** React (Vite), TypeScript, gRPC-web.
* **Backend:** Node.js, TypeScript, gRPC Server.
* **Database:** PostgreSQL (via Supabase) using Prisma ORM.
* **Communication:** Protobuf/gRPC for Request/Response; gRPC Server-side Streaming for Real-time updates.
* **Event Bus:** Redis (to trigger real-time broadcasts).
* **Deployment:** Dockerized containers, deployed via AWS ECS (Fargate).