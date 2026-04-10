export const TASK_STATUSES = [
  {
    key: "TODO",
    label: "To Do",
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    key: "BLOCKED",
    label: "Blocked",
  },
  {
    key: "DONE",
    label: "Done",
  },
] as const;

export type TaskStatusKey = (typeof TASK_STATUSES)[number]["key"];

export const TASK_STATUS_LABEL_BY_KEY: Record<TaskStatusKey, string> =
  TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status.key] = status.label;
      return acc;
    },
    {} as Record<TaskStatusKey, string>,
  );
