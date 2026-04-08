import * as grpc from "@grpc/grpc-js";
import { type TaskServiceServer } from "../../../../packages/generated/task";
import { getAuthorizedUserId, respondWithGrpcError, handleServiceError } from "../utils";
import prisma from "../db";
import { TASK_STATUS } from "../constants/taskStatus";

const requireUserId = (
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

export const taskHandler: TaskServiceServer = {
  createTask: async (call, callback) => {
    try {
      const userId = requireUserId(call.metadata, callback);
      if (!userId) return;

      const { projectId, title, description } = call.request;

      // Count existing tasks in project to generate taskNumber
      const taskCount = await prisma.task.count({
        where: { projectId },
      });

      const taskNumber = `${projectId}-${String(taskCount + 1).padStart(3, "0")}`;

      // Create task
      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          projectId,
          status: TASK_STATUS.TODO,
          creatorId: userId,
          taskNumber,
        },
      });

      // Return task response
      callback(null, {
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
    } catch (error) {
      handleServiceError(error, callback, "Failed to create task");
    }
  },
  updateTaskStatus: async (call, callback) => {
    try {
      const userId = requireUserId(call.metadata, callback);
      if (!userId) return;

      const { taskId, newStatus } = call.request;

      // Find task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        respondWithGrpcError(callback, grpc.status.NOT_FOUND, "Task not found");
        return;
      }

      // Check ownership
      if (task.creatorId !== userId) {
        respondWithGrpcError(
          callback,
          grpc.status.PERMISSION_DENIED,
          "You can only update your own tasks"
        );
        return;
      }

      // Update task status and create history entry
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          lastStatusChange: new Date(),
        },
      });

      // Create TaskHistory entry
      await prisma.taskHistory.create({
        data: {
          taskId,
          oldStatus: task.status,
          newStatus,
          changedByUserId: userId,
        },
      });

      // Return updated task
      callback(null, {
        id: updatedTask.id,
        projectId: updatedTask.projectId,
        title: updatedTask.title,
        description: updatedTask.description || "",
        status: updatedTask.status,
        assigneeId: updatedTask.assigneeId || "",
        creatorId: updatedTask.creatorId,
        taskNumber: updatedTask.taskNumber,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      });
    } catch (error) {
      handleServiceError(error, callback, "Failed to update task status");
    }
  },
  listTasks: (_call, callback) => {
    callback(null, { tasks: [] });
  },
  deleteTask: (_call, callback) => {
    callback(null, {});
  },
  getTaskHistory: (_call, callback) => {
    callback(null, { entries: [] });
  },
};
