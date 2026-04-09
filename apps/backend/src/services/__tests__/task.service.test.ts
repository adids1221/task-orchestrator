import * as grpc from "@grpc/grpc-js";
import prisma from "../../db";
import {
  handleServiceError,
  mapTaskHistoryToResponse,
  mapTaskToResponse,
  requireUserId,
  respondWithGrpcError,
} from "../../utils";
import { TASK_STATUS } from "../../constants";
import { taskHandler } from "../task.service";

jest.mock("../../db", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    task: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    taskAuditLog: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("../../utils", () => ({
  __esModule: true,
  respondWithGrpcError: jest.fn(),
  handleServiceError: jest.fn(),
  requireUserId: jest.fn(),
  mapTaskToResponse: jest.fn(),
  mapTaskHistoryToResponse: jest.fn(),
}));

type MockedPrisma = {
  $transaction: jest.Mock;
  task: {
    count: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  taskHistory: {
    create: jest.Mock;
    findMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  taskAuditLog: {
    create: jest.Mock;
    deleteMany: jest.Mock;
  };
};

describe("taskService", () => {
  const prismaMock = prisma as unknown as MockedPrisma;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("returns early when user is unauthorized", async () => {
      (requireUserId as jest.Mock).mockReturnValue(null);
      const callback = jest.fn();

      await taskHandler.createTask(
        {
          metadata: {} as grpc.Metadata,
          request: {
            projectId: "proj-acme",
            title: "Fix login",
            description: "desc",
          },
        } as any,
        callback as any,
      );

      expect(prismaMock.task.count).not.toHaveBeenCalled();
      expect(prismaMock.task.create).not.toHaveBeenCalled();
    });

    it("creates a task with generated per-project task number", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      prismaMock.task.count.mockResolvedValue(0);

      const createdTask = {
        id: "t1",
        projectId: "proj-acme",
        title: "Fix login",
        description: "desc",
        status: TASK_STATUS.TODO,
        assigneeId: null,
        creatorId: "u1",
        taskNumber: "proj-acme-001",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };

      prismaMock.task.create.mockResolvedValue(createdTask);
      (mapTaskToResponse as jest.Mock).mockReturnValue({ id: "t1" });
      const callback = jest.fn();

      await taskHandler.createTask(
        {
          metadata: {} as grpc.Metadata,
          request: {
            projectId: "proj-acme",
            title: "Fix login",
            description: "desc",
          },
        } as any,
        callback as any,
      );

      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: {
          title: "Fix login",
          description: "desc",
          projectId: "proj-acme",
          status: TASK_STATUS.TODO,
          creatorId: "u1",
          taskNumber: "proj-acme-001",
        },
      });
      expect(callback).toHaveBeenCalledWith(null, { id: "t1" });
    });
  });

  describe("updateTask", () => {
    it("returns INVALID_ARGUMENT when no updatable fields are provided", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      const callback = jest.fn();

      await taskHandler.updateTask(
        {
          metadata: {} as grpc.Metadata,
          request: {
            taskId: "t1",
          },
        } as any,
        callback as any,
      );

      expect(respondWithGrpcError).toHaveBeenCalledWith(
        callback,
        grpc.status.INVALID_ARGUMENT,
        "At least one field must be provided: title, description, assigneeId",
      );
      expect(handleServiceError).not.toHaveBeenCalled();
    });

    it("does not write TaskAuditLog when no fields actually changed", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      const existingTask = {
        id: "t1",
        projectId: "proj-acme",
        title: "Fix login",
        description: "desc",
        status: TASK_STATUS.TODO,
        assigneeId: "u2",
        creatorId: "u1",
        taskNumber: "proj-acme-001",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };

      prismaMock.task.findUnique.mockResolvedValue(existingTask);
      (mapTaskToResponse as jest.Mock).mockReturnValue({ id: "t1" });
      const callback = jest.fn();

      await taskHandler.updateTask(
        {
          metadata: {} as grpc.Metadata,
          request: {
            taskId: "t1",
            title: "Fix login",
            description: "desc",
            assigneeId: "u2",
          },
        } as any,
        callback as any,
      );

      expect(prismaMock.task.update).not.toHaveBeenCalled();
      expect(prismaMock.taskAuditLog.create).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(null, { id: "t1" });
    });
  });

  describe("updateTaskStatus", () => {
    it("returns PERMISSION_DENIED when user is not the task creator", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      prismaMock.task.findUnique.mockResolvedValue({
        id: "t1",
        creatorId: "u2",
        status: TASK_STATUS.TODO,
      });
      const callback = jest.fn();

      await taskHandler.updateTaskStatus(
        {
          metadata: {} as grpc.Metadata,
          request: {
            taskId: "t1",
            newStatus: TASK_STATUS.IN_PROGRESS,
          },
        } as any,
        callback as any,
      );

      expect(respondWithGrpcError).toHaveBeenCalledWith(
        callback,
        grpc.status.PERMISSION_DENIED,
        "You can only update your own tasks",
      );
      expect(prismaMock.task.update).not.toHaveBeenCalled();
      expect(prismaMock.taskHistory.create).not.toHaveBeenCalled();
    });
  });

  describe("listTasks", () => {
    it("returns mapped tasks for the current user", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      prismaMock.task.findMany.mockResolvedValue([
        {
          id: "t1",
          projectId: "proj-acme",
          title: "Fix login",
          description: "desc",
          status: TASK_STATUS.TODO,
          assigneeId: null,
          creatorId: "u1",
          taskNumber: "proj-acme-001",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);
      (mapTaskToResponse as jest.Mock).mockReturnValue({ id: "t1" });
      const callback = jest.fn();

      await taskHandler.listTasks(
        {
          metadata: {} as grpc.Metadata,
          request: {},
        } as any,
        callback as any,
      );

      expect(prismaMock.task.findMany).toHaveBeenCalledWith({
        where: { creatorId: "u1" },
      });
      expect(callback).toHaveBeenCalledWith(null, { tasks: [{ id: "t1" }] });
    });
  });

  describe("deleteTask", () => {
    it("deletes task when user owns it", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      prismaMock.task.findUnique.mockResolvedValue({
        id: "t1",
        creatorId: "u1",
      });
      prismaMock.$transaction.mockResolvedValue([]);
      const callback = jest.fn();

      await taskHandler.deleteTask(
        {
          metadata: {} as grpc.Metadata,
          request: { taskId: "t1" },
        } as any,
        callback as any,
      );

      expect(prismaMock.taskHistory.deleteMany).toHaveBeenCalledWith({
        where: { taskId: "t1" },
      });
      expect(prismaMock.taskAuditLog.deleteMany).toHaveBeenCalledWith({
        where: { taskId: "t1" },
      });
      expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: "t1" } });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null, {});
    });
  });

  describe("getTaskHistory", () => {
    it("returns mapped task history entries", async () => {
      (requireUserId as jest.Mock).mockReturnValue("u1");
      prismaMock.task.findUnique.mockResolvedValue({
        id: "t1",
        creatorId: "u1",
      });
      prismaMock.taskHistory.findMany.mockResolvedValue([
        {
          id: "h1",
          taskId: "t1",
          changedByUserId: "u1",
          oldStatus: TASK_STATUS.TODO,
          newStatus: TASK_STATUS.IN_PROGRESS,
          changedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ]);
      (mapTaskHistoryToResponse as jest.Mock).mockReturnValue({ id: "h1" });
      const callback = jest.fn();

      await taskHandler.getTaskHistory(
        {
          metadata: {} as grpc.Metadata,
          request: { taskId: "t1" },
        } as any,
        callback as any,
      );

      expect(prismaMock.taskHistory.findMany).toHaveBeenCalledWith({
        where: { taskId: "t1" },
        orderBy: { changedAt: "desc" },
      });
      expect(callback).toHaveBeenCalledWith(null, { entries: [{ id: "h1" }] });
    });
  });
});
