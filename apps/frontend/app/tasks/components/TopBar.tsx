"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./TopBar.module.css";

interface TopBarProps {
  onNewTask: () => void;
  onLogout: () => void;
}

function TopBar({ onNewTask, onLogout }: TopBarProps) {
  const { user } = useAuth();

  const displayName = user?.name?.trim() || user?.email?.trim() || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <span className={styles.title}>Task Orchestrator</span>

        <select className={styles.projectSelect} defaultValue="">
          <option value="" disabled>
            Select project
          </option>
        </select>

        <div className={styles.searchWrapper}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search tasks…"
          />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.newTaskBtn} onClick={onNewTask}>
          + New Task
        </button>
        <button className={styles.logoutBtn} onClick={onLogout}>
          {user && (
            <>
              <span className={styles.avatar}>{avatarInitial}</span>
              <span className={styles.userName}>{displayName}</span>
            </>
          )}
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopBar;
