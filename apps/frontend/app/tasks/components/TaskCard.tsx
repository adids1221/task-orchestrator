import React from "react";
import type { TaskItem } from "../types/task";
import styles from "./TaskCard.module.css";

type TaskCardProps = {
  task: TaskItem;
};

function TaskCard({ task }: TaskCardProps) {
  const title = task.title.trim() || "Untitled task";
  const description = task.description.trim() || "No description yet.";
  const statusLabel = task.status.replace(/_/g, " ");

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.number}>#{task.taskNumber || task.id}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <span className={styles.status}>{statusLabel}</span>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Created</span>
          <span className={styles.metaValue}>{task.createdAt || "-"}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Updated</span>
          <span className={styles.metaValue}>{task.updatedAt || "-"}</span>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
