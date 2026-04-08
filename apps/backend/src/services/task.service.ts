import * as grpc from "@grpc/grpc-js";
import { type TaskServiceServer } from "../grpc/contracts";
import {
  respondWithGrpcError,
  handleServiceError,
  mapTaskToResponse,
  requireUserId,
} from "../utils";
import prisma from "../db";
import { TASK_STATUS } from "../constants";

const findOwnedTask = async (
  taskId: string,
  userId: string,
  callback: (err: { code: number; message: string }) => void,
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    respondWithGrpcError(callback, grpc.status.NOT_FOUND, "Task not found");
    return null;
  }

  if (task.creatorId !== userId) {
    respondWithGrpcError(
      callback,
      grpc.status.PERMISSION_DENIED,
      "You can only update your own tasks",
    );
    return null;
  }

  return task;
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

      callback(null, mapTaskToResponse(task));
    } catch (error) {
      handleServiceError(error, callback, "Failed to create task");
    }
  },
  updateTaskStatus: async (call, callback) => {
    try {
      const userId = requireUserId(call.metadata, callback);
      if (!userId) return;

      const { taskId, newStatus } = call.request;

      const task = await findOwnedTask(taskId, userId, callback);
      if (!task) return;

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

      callback(null, mapTaskToResponse(updatedTask));
    } catch (error) {
      handleServiceError(error, callback, "Failed to update task status");
    }
  },
  updateTask: async (call, callback) => {
    try {
      const userId = requireUserId(call.metadata, callback);
      if (!userId) return;

      const { taskId, title, description, assigneeId } = call.request;

      if (!taskId) {
        respondWithGrpcError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          "taskId is required",
        );
        return;
      }

      const hasTitle = title !== undefined;
      const hasDescription = description !== undefined;
      const hasAssigneeId = assigneeId !== undefined;

      if (!hasTitle && !hasDescription && !hasAssigneeId) {
        respondWithGrpcError(
          callback,
          grpc.status.INVALID_ARGUMENT,
          "At least one field must be provided: title, description, assigneeId",
        );
        return;
      }

      const task = await findOwnedTask(taskId, userId, callback);
      if (!task) return;

      const updateData: {
        title?: string;
        description?: string | null;
        assigneeId?: string | null;
      } = {};

      let hasChanges = false;

      const changes: Record<
        string,
        { from: string | null; to: string | null }
      > = {};

      if (hasTitle && title !== task.title) {
        updateData.title = title;
        changes.title = { from: task.title, to: title };
        hasChanges = true;
      }

      if (hasDescription && description !== task.description) {
        updateData.description = description || null;
        changes.description = {
          from: task.description,
          to: description || null,
        };
        hasChanges = true;
      }

      if (hasAssigneeId && assigneeId !== task.assigneeId) {
        updateData.assigneeId = assigneeId || null;
        changes.assigneeId = { from: task.assigneeId, to: assigneeId || null };
        hasChanges = true;
      }

      if (!hasChanges) {
        callback(null, mapTaskToResponse(task));
        return;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
      });

      await prisma.taskAuditLog.create({
        data: {
          taskId,
          performedBy: userId,
          action: "TASK_UPDATED",
          changes,
        },
      });

      callback(null, mapTaskToResponse(updatedTask));
    } catch (error) {
      handleServiceError(error, callback, "Failed to update task");
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
