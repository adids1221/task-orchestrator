"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import type { ProjectItem } from "../types/project";
import AppButton from "./AppButton";
import styles from "./TopBar.module.css";

interface TopBarProps {
  onNewTask: () => void;
  onNewProject: () => void;
  onLogout: () => void;
  projects: ProjectItem[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  projectsLoading?: boolean;
  projectsError?: string | null;
  canCreateTask?: boolean;
}

function TopBar({
  onNewTask,
  onNewProject,
  onLogout,
  projects,
  selectedProjectId,
  onProjectChange,
  projectsLoading = false,
  projectsError = null,
  canCreateTask = true,
}: TopBarProps) {
  const { user } = useAuth();

  const displayName = user?.name?.trim() || user?.email?.trim() || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <span className={styles.title}>Task Orchestrator</span>

        <div className={styles.projectControl}>
          <select
            className={styles.projectSelect}
            value={selectedProjectId}
            onChange={(event) => onProjectChange(event.target.value)}
            disabled={projectsLoading || projects.length === 0}
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : null}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {projectsLoading ? (
            <span className={styles.metaText}>Loading...</span>
          ) : null}
          {!projectsLoading && projectsError ? (
            <span className={styles.metaError}>Couldn't load projects</span>
          ) : null}
        </div>

        <div className={styles.searchWrapper}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search tasks…"
          />
        </div>
      </div>

      <div className={styles.right}>
        <AppButton
          onClick={onNewTask}
          disabled={!canCreateTask}
          title={
            canCreateTask
              ? undefined
              : "Create or select a project before adding a task"
          }
        >
          + New Task
        </AppButton>
        <AppButton onClick={onNewProject}>+ New Project</AppButton>
        <AppButton onClick={onLogout} variant="ghost">
          {user && (
            <>
              <span className={styles.avatar}>{avatarInitial}</span>
              <span className={styles.userName}>{displayName}</span>
            </>
          )}
          Logout
        </AppButton>
      </div>
    </header>
  );
}

export default TopBar;
