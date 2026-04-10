import { Metadata } from "@grpc/grpc-js";
import { NextResponse } from "next/server";
import type {
  CreateProjectRequest,
  ListProjectsRequest,
  Project,
  ProjectList,
} from "../../../../../packages/generated/packages/proto/task";
import { taskClient } from "@/lib/server/grpc-clients";
import {
  buildAuthMetadata,
  mapGrpcErrorToHttp,
  readStringField,
} from "@/app/api/_utils/grpc-route-utils";

export const runtime = "nodejs";

function listProjects(
  request: ListProjectsRequest,
  metadata: Metadata,
): Promise<ProjectList> {
  return new Promise((resolve, reject) => {
    taskClient.listProjects(request, metadata, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

function createProject(
  request: CreateProjectRequest,
  metadata: Metadata,
): Promise<Project> {
  return new Promise((resolve, reject) => {
    taskClient.createProject(request, metadata, (error, response) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
}

export async function GET(request: Request) {
  const metadata = await buildAuthMetadata(request);
  if (!metadata) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await listProjects({}, metadata);
    return NextResponse.json({ projects: response.projects }, { status: 200 });
  } catch (error) {
    const mapped = mapGrpcErrorToHttp(error, "Project service error");
    console.error("[api/projects] listProjects failed", error);
    return NextResponse.json(
      { error: mapped.message },
      { status: mapped.status },
    );
  }
}

export async function POST(request: Request) {
  const metadata = await buildAuthMetadata(request);
  if (!metadata) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = readStringField(body, "name");
  const description = readStringField(body, "description");

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 },
    );
  }

  try {
    const project = await createProject({ name, description }, metadata);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const mapped = mapGrpcErrorToHttp(error, "Project service error");
    console.error("[api/projects] createProject failed", error);
    return NextResponse.json(
      { error: mapped.message },
      { status: mapped.status },
    );
  }
}
