"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/features/auth/logout-client";
import type { ProjectItem } from "./types/project";
import type { TaskItem } from "./types/task";
import { createProject, createTask, fetchProjects, fetchTasks } from "./utils";
import { TopBar, KanbanBoard, Form, type FormHandle } from "./components";
import Modal from "./components/Modal";
import loginStyles from "../login/page.module.css";

export default function TasksPage() {
  const router = useRouter();
  const { clearUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [projectFormError, setProjectFormError] = useState<string | null>(null);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);

  const projectFormRef = useRef<FormHandle>(null);
  const taskFormRef = useRef<FormHandle>(null);

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

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        setProjectsError(null);
        const nextProjects = await fetchProjects();
        setProjects(nextProjects);
      } catch (error) {
        setProjectsError(
          error instanceof Error ? error.message : "Failed to load projects",
        );
      } finally {
        setIsLoadingProjects(false);
      }
    }

    void loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

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

  const isBoardLoading =
    isLoadingTasks ||
    isLoadingProjects ||
    (projects.length > 0 && !selectedProjectId);

  const visibleTasks = selectedProjectId
    ? tasks.filter((task) => task.projectId === selectedProjectId)
    : [];

  function handleCloseProjectModal() {
    setShowNewProjectModal(false);
    setProjectFormError(null);
    setIsCreatingProject(false);
  }

  function handleProjectModalSave() {
    setProjectFormError(null);
    setIsCreatingProject(true);
    projectFormRef.current?.submit();
  }

  function handleTaskModalSave() {
    setTaskFormError(null);
    setIsCreatingTask(true);
    taskFormRef.current?.submit();
  }

  function handleCloseTaskModal() {
    setShowNewTaskModal(false);
    setTaskFormError(null);
    setIsCreatingTask(false);
  }

  const canCreateTask =
    !isLoadingProjects &&
    projects.length > 0 &&
    Boolean(selectedProjectId);

  return (
    <main
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <TopBar
        onNewTask={() => setShowNewTaskModal(true)}
        onNewProject={() => setShowNewProjectModal(true)}
        onLogout={handleLogout}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        projectsLoading={isLoadingProjects}
        projectsError={projectsError}
        canCreateTask={canCreateTask}
      />
      <KanbanBoard
        tasks={visibleTasks}
        loading={isBoardLoading}
        errorMessage={tasksError}
      />

      <Modal
        visible={showNewTaskModal}
        onClose={handleCloseTaskModal}
        title="Create New Task"
        isLoading={isCreatingTask}
        onSave={handleTaskModalSave}
        showDefaultFooter
        saveLabel={isCreatingTask ? "Creating…" : "Create Task"}
      >
        {selectedProjectId ? (
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--color-text-muted)" }}>
            Adding to{" "}
            <strong>
              {projects.find((p) => p.id === selectedProjectId)?.name ?? "project"}
            </strong>
          </p>
        ) : null}
        <Form
          ref={taskFormRef}
          fields={[
            {
              name: "title",
              label: "Task Title",
              type: "text",
              required: true,
              placeholder: "Enter task title",
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              required: false,
              placeholder: "Optional details",
            },
          ]}
          isLoading={isCreatingTask}
          onValidateResult={(ok) => {
            if (!ok) {
              setIsCreatingTask(false);
            }
          }}
          onSubmit={async (values) => {
            setTaskFormError(null);
            if (!selectedProjectId.trim()) {
              setTaskFormError("Select a project first.");
              setIsCreatingTask(false);
              return;
            }
            try {
              const description = String(values.description ?? "").trim();
              const newTask = await createTask({
                projectId: selectedProjectId,
                title: String(values.title ?? "").trim(),
                ...(description ? { description } : {}),
              });
              setTasks((prev) => [newTask, ...prev]);
              handleCloseTaskModal();
            } catch (err) {
              setTaskFormError(
                err instanceof Error ? err.message : "Failed to create task",
              );
            } finally {
              setIsCreatingTask(false);
            }
          }}
          submitLabel={isCreatingTask ? "Creating…" : "Create Task"}
          className={loginStyles.formGrid}
          inputClassName={loginStyles.input}
          fieldClassName={loginStyles.field}
          labelClassName={loginStyles.label}
        />
        {taskFormError ? (
          <div style={{ color: "#d32f2f", marginTop: 8, fontSize: 14 }}>
            {taskFormError}
          </div>
        ) : null}
      </Modal>

      <Modal
        visible={showNewProjectModal}
        onClose={handleCloseProjectModal}
        title="Create New Project"
        isLoading={isCreatingProject}
        onSave={handleProjectModalSave}
        showDefaultFooter
        saveLabel={isCreatingProject ? "Creating…" : "Create Project"}
      >
        <Form
          ref={projectFormRef}
          fields={[
            {
              name: "name",
              label: "Project Name",
              type: "text",
              required: true,
              placeholder: "Enter project name",
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              required: true,
              placeholder: "Describe this project",
            },
          ]}
          isLoading={isCreatingProject}
          onValidateResult={(ok) => {
            if (!ok) {
              setIsCreatingProject(false);
            }
          }}
          onSubmit={async (values) => {
            setProjectFormError(null);
            try {
              const newProject = await createProject({
                name: String(values.name ?? "").trim(),
                description: String(values.description ?? "").trim(),
              });
              setProjects((prev) => [newProject, ...prev]);
              setSelectedProjectId(newProject.id);
              handleCloseProjectModal();
            } catch (err) {
              setProjectFormError(
                err instanceof Error ? err.message : "Failed to create project",
              );
            } finally {
              setIsCreatingProject(false);
            }
          }}
          submitLabel={isCreatingProject ? "Creating…" : "Create Project"}
          className={loginStyles.formGrid}
          inputClassName={loginStyles.input}
          fieldClassName={loginStyles.field}
          labelClassName={loginStyles.label}
        />
        {projectFormError ? (
          <div style={{ color: "#d32f2f", marginTop: 8, fontSize: 14 }}>
            {projectFormError}
          </div>
        ) : null}
      </Modal>
    </main>
  );
}
