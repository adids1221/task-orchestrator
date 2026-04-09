import * as grpc from "@grpc/grpc-js";
import { AuthServiceClient } from "../../../../packages/generated/auth";
import { TaskServiceClient } from "../../../../packages/generated/packages/proto/task";

const grpcAddress =
  process.env.GRPC_SERVER_ADDRESS ??
  process.env.GRPC_AUTH_ADDRESS ??
  process.env.GRPC_TASK_ADDRESS ??
  "localhost:50051";

const credentials = grpc.credentials.createInsecure();

export const authClient = new AuthServiceClient(grpcAddress, credentials);
export const taskClient = new TaskServiceClient(grpcAddress, credentials);
