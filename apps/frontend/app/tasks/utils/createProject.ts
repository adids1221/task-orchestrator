import type { ProjectItem } from "../types/project";

export interface CreateProjectInput {
  name: string;
  description: string;
}

export async function createProject(input: CreateProjectInput): Promise<ProjectItem> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Failed to create project");
  }
  return {
    id: payload.project?.id || "",
    name: payload.project?.name || input.name,
    description: payload.project?.description || input.description,
    creatorId: payload.project?.creatorId || payload.project?.creator_id || "",
  };
}
