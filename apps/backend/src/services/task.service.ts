import { type TaskServiceServer } from "../grpc/contracts";
import { projectHandlers } from "./task/project.handlers";
import { taskHandlers } from "./task/task.handlers";

export const taskHandler: TaskServiceServer = {
  ...projectHandlers,
  ...taskHandlers,
};
