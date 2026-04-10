import type { TaskItem } from "../types/task";

type FetchTasksResponse = {
  tasks?: TaskItem[];
  error?: string;
};

export async function fetchTasks(): Promise<TaskItem[]> {
  const response = await fetch("/api/tasks");
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
}
