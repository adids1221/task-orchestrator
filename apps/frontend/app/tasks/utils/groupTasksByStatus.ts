import { TASK_STATUSES, type TaskStatusKey } from "../config/statuses";
import type { TaskItem } from "../types/task";

export function groupTasksByStatus(tasks: TaskItem[]) {
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
}
