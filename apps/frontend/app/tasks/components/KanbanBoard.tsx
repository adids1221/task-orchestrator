import React from "react";
import { TASK_STATUSES } from "../config/statuses";
import type { TaskItem } from "../types/task";
import { groupTasksByStatus } from "../utils";
import KanbanColumn from "./KanbanColumn";
import styles from "./KanbanBoard.module.css";

type KanbanBoardProps = {
  tasks: TaskItem[];
  loading?: boolean;
  errorMessage?: string | null;
  showCounts?: boolean;
};

function KanbanBoard({
  tasks,
  loading = false,
  errorMessage = null,
  showCounts = true,
}: KanbanBoardProps) {
  const groupedTasks = groupTasksByStatus(tasks);

  return (
    <section className={styles.boardWrap} aria-label="Tasks board">
      {errorMessage ? <div className={styles.banner}>{errorMessage}</div> : null}

      <div className={styles.board}>
      {TASK_STATUSES.map((status) => (
        <KanbanColumn
          key={status.key}
          label={status.label}
          tasks={groupedTasks[status.key]}
          showCount={showCounts}
          emptyMessage={loading ? "Loading tasks..." : "No tasks"}
        />
      ))}
      </div>
    </section>
  );
}

export default KanbanBoard;
