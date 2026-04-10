import type { TaskStatusKey } from "../config/statuses";

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatusKey;
  assigneeId: string;
  creatorId: string;
  taskNumber: string;
  createdAt: string;
  updatedAt: string;
}
