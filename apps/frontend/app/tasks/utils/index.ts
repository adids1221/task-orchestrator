import { TASK_STATUSES, type TaskStatusKey } from "../config/statuses";
import type { TaskItem } from "../types/task";

type FetchTasksResponse = {
  tasks?: TaskItem[];
  error?: string;
};

export const fetchTasks = async (): Promise<TaskItem[]> => {
  console.log("inside fetchTasks");
  const response = await fetch("/api/tasks");
  console.log({ response });
  const payload = (await response.json()) as FetchTasksResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Failed to fetch tasks");
  }

  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

  return [...tasks].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt || left.createdAt || "");
    const rightTime = Date.parse(right.updatedAt || right.createdAt || "");

    return (
      (Number.isNaN(rightTime) ? 0 : rightTime) -
      (Number.isNaN(leftTime) ? 0 : leftTime)
    );
  });
};

export const groupTasksByStatus = (tasks: TaskItem[]) => {
  const grouped = TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status.key] = [];
      return acc;
    },
    {} as Record<TaskStatusKey, TaskItem[]>,
  );

  for (const task of tasks) {
    if (task.status in grouped) {
      grouped[task.status as TaskStatusKey].push(task);
    }
  }

  return grouped;
};
