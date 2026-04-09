import * as grpc from "@grpc/grpc-js";
import type {
  Task as PrismaTask,
  TaskHistory as PrismaTaskHistory,
} from "@prisma/client";
import { getAuthorizedUserId, respondWithGrpcError } from "./grpcUtils";

export const requireUserId = (
  metadata: grpc.Metadata,
  callback: (err: { code: number; message: string }) => void,
): string | null => {
  const userId = getAuthorizedUserId(metadata);

  if (!userId) {
    respondWithGrpcError(callback, grpc.status.UNAUTHENTICATED, "Unauthorized");
    return null;
  }

  return userId;
};

export const mapTaskToResponse = (task: PrismaTask) => ({
  id: task.id,
  projectId: task.projectId,
  title: task.title,
  description: task.description || "",
  status: task.status,
  assigneeId: task.assigneeId || "",
  creatorId: task.creatorId,
  taskNumber: task.taskNumber,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

export const mapTaskHistoryToResponse = (entry: PrismaTaskHistory) => ({
  id: entry.id,
  taskId: entry.taskId,
  changedByUserId: entry.changedByUserId,
  oldStatus: entry.oldStatus,
  newStatus: entry.newStatus,
  changedAt: entry.changedAt.toISOString(),
});
