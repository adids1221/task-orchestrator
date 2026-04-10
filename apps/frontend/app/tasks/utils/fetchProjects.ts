import type { ProjectItem } from "../types/project";

type ProjectApiItem = {
  id?: string;
  name?: string;
  description?: string;
  creatorId?: string;
  creator_id?: string;
};

type FetchProjectsResponse = {
  projects?: ProjectApiItem[];
  error?: string;
};

export async function fetchProjects(): Promise<ProjectItem[]> {
  const response = await fetch("/api/projects");
  const payload = (await response.json()) as FetchProjectsResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Failed to fetch projects");
  }

  const projects = Array.isArray(payload.projects) ? payload.projects : [];

  return projects
    .map((project) => ({
      id: project.id || "",
      name: project.name || "",
      description: project.description || "",
      creatorId: project.creatorId || project.creator_id || "",
    }))
    .filter((project) => Boolean(project.id && project.name));
}
