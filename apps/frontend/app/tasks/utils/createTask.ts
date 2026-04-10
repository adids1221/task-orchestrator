import type { TaskStatusKey } from "../config/statuses";
import type { TaskItem } from "../types/task";

export interface CreateTaskInput {
  projectId: string;
  title: string;
  /** Optional; omitted or empty is fine for the API. */
  description?: string;
}

type TaskApiPayload = {
  id?: string;
  title?: string;
  description?: string;
  projectId?: string;
  project_id?: string;
  status?: string;
  assigneeId?: string;
  assignee_id?: string;
  creatorId?: string;
  creator_id?: string;
  taskNumber?: string;
  task_number?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

function mapApiTaskToItem(
  t: TaskApiPayload | undefined,
  input: CreateTaskInput,
): TaskItem {
  const status = (t?.status as TaskStatusKey) || "TODO";
  return {
    id: t?.id || "",
    title: t?.title || input.title,
    description: t?.description ?? input.description ?? "",
    projectId: t?.projectId || t?.project_id || input.projectId,
    status,
    assigneeId: t?.assigneeId || t?.assignee_id || "",
    creatorId: t?.creatorId || t?.creator_id || "",
    taskNumber: t?.taskNumber || t?.task_number || "",
    createdAt:
      t?.createdAt || t?.created_at || new Date().toISOString(),
    updatedAt:
      t?.updatedAt || t?.updated_at || new Date().toISOString(),
  };
}

export async function createTask(input: CreateTaskInput): Promise<TaskItem> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? "",
    }),
  });
  const payload = (await response.json()) as {
    task?: TaskApiPayload;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error || "Failed to create task");
  }
  return mapApiTaskToItem(payload.task, input);
}
