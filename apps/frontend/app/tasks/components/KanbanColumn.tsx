import React from "react";
import TaskCard from "./TaskCard";
import type { TaskItem } from "../types/task";
import styles from "./KanbanColumn.module.css";

type KanbanColumnProps = {
  label: string;
  tasks: TaskItem[];
  showCount?: boolean;
  emptyMessage?: string;
};

function KanbanColumn({
  label,
  tasks,
  showCount = true,
  emptyMessage = "No tasks",
}: KanbanColumnProps) {
  return (
    <section className={styles.column} aria-label={label}>
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <h2 className={styles.title}>{label}</h2>
          {showCount ? <span className={styles.count}>{tasks.length}</span> : null}
        </div>

        <button type="button" className={styles.menuButton} aria-label={`${label} options`}>
          ...
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.laneSurface}>
          {tasks.length === 0 ? (
            <div className={styles.emptyState}>{emptyMessage}</div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    </section>
  );
}

export default KanbanColumn;
