"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/features/auth/logout-client";
import type { TaskItem } from "./types/task";
import { fetchTasks } from "./utils";
import { TopBar, KanbanBoard } from "./components";

export default function TasksPage() {
  const router = useRouter();
  const { clearUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        setIsLoadingTasks(true);
        setTasksError(null);
        const nextTasks = await fetchTasks();
        setTasks(nextTasks);
      } catch (error) {
        setTasksError(
          error instanceof Error ? error.message : "Failed to load tasks",
        );
      } finally {
        setIsLoadingTasks(false);
      }
    }

    void loadTasks();
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logoutUser();

    clearUser();
    setIsLoggingOut(false);

    router.replace("/login");
  }

  return (
    <main
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <TopBar onNewTask={() => {}} onLogout={handleLogout} />
      <KanbanBoard
        tasks={tasks}
        loading={isLoadingTasks}
        errorMessage={tasksError}
      />
    </main>
  );
}
