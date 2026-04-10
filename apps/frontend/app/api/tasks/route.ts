import { Metadata } from "@grpc/grpc-js";
import { NextResponse } from "next/server";
import type {
  CreateTaskRequest,
  Task,
  TaskFilter,
  TaskList,
  UpdateStatusRequest,
} from "../../../../../packages/generated/packages/proto/task";
import { taskClient } from "@/lib/server/grpc-clients";
import {
  buildAuthMetadata,
  mapGrpcErrorToHttp,
  readStringField,
} from "@/app/api/_utils/grpc-route-utils";

export const runtime = "nodejs";

function listTasks(request: TaskFilter, metadata: Metadata): Promise<TaskList> {
  return new Promise((resolve, reject) => {
    taskClient.listTasks(request, metadata, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

function createTask(
  request: CreateTaskRequest,
  metadata: Metadata,
): Promise<Task> {
  return new Promise((resolve, reject) => {
    taskClient.createTask(request, metadata, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

function updateTaskStatus(
  request: UpdateStatusRequest,
  metadata: Metadata,
): Promise<Task> {
  return new Promise((resolve, reject) => {
    taskClient.updateTaskStatus(request, metadata, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

export async function GET(request: Request) {
  const metadata = await buildAuthMetadata(request);
  if (!metadata) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await listTasks(
      {
        status: "",
        assigneeId: "",
        projectId: "",
        teamId: "",
        searchQuery: "",
      },
      metadata,
    );

    return NextResponse.json({ tasks: response.tasks }, { status: 200 });
  } catch (error) {
    const mapped = mapGrpcErrorToHttp(error, "Task service error");
    console.error("[api/tasks] listTasks failed", error);
    return NextResponse.json(
      { error: mapped.message },
      { status: mapped.status },
    );
  }
}

export async function POST(request: Request) {
  const metadata = await buildAuthMetadata(request);
  if (!metadata) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const projectId = readStringField(body, "projectId", "project_id");
  const title = readStringField(body, "title");
  const description = readStringField(body, "description");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 },
    );
  }

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const task = await createTask({ projectId, title, description }, metadata);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const mapped = mapGrpcErrorToHttp(error, "Task service error");
    console.error("[api/tasks] createTask failed", error);
    return NextResponse.json(
      { error: mapped.message },
      { status: mapped.status },
    );
  }
}

export async function PATCH(request: Request) {
  const metadata = await buildAuthMetadata(request);
  if (!metadata) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const taskId = readStringField(body, "taskId", "task_id");
  const newStatus = readStringField(body, "newStatus", "new_status");

  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  if (!newStatus) {
    return NextResponse.json(
      { error: "newStatus is required" },
      { status: 400 },
    );
  }

  try {
    const task = await updateTaskStatus({ taskId, newStatus }, metadata);
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    const mapped = mapGrpcErrorToHttp(error, "Task service error");
    console.error("[api/tasks] updateTaskStatus failed", error);
    return NextResponse.json(
      { error: mapped.message },
      { status: mapped.status },
    );
  }
}
