import { Prisma } from "@prisma/client";
import * as grpc from "@grpc/grpc-js";
import type { TaskServiceServer } from "../../grpc/contracts";
import { handleServiceError, requireUserId, respondWithGrpcError } from "../../utils";
import prisma from "../../db";

export const projectHandlers: Pick<
  TaskServiceServer,
  "createProject" | "listProjects"
> = {
  createProject: async (call, callback) => {
    try {
      const userId = requireUserId(call.metadata, callback);
      if (!userId) return;

      const { name, description } = call.request;

      if (!name || !name.trim()) {
        respondWithGrpcError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          "name is required",
        );
        return;
      }

      const creator = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!creator) {
        respondWithGrpcError(
          callback,
          grpc.status.UNAUTHENTICATED,
          "User not found for current token",
        );
        return;
      }

      const project = await prisma.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          creatorId: userId,
        },
      });

      callback(null, {
        id: project.id,
        name: project.name,
        description: project.description || "",
        creatorId: project.creatorId,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        respondWithGrpcError(
          callback,
          grpc.status.UNAUTHENTICATED,
          "Invalid user context",
        );
        return;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        respondWithGrpcError(
          callback,
          grpc.status.ALREADY_EXISTS,
          "Project already exists",
        );
        return;
      }

      handleServiceError(error, callback, "Failed to create project");
    }
  },
  listProjects: async (call, callback) => {
    try {
      const userId = requireUserId(call.metadata, callback);
      if (!userId) return;

      const rows = await prisma.project.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: "desc" },
      });

      callback(null, {
        projects: rows.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description || "",
          creatorId: row.creatorId,
        })),
      });
    } catch (error) {
      handleServiceError(error, callback, "Failed to list projects");
    }
  },
};
