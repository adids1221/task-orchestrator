import { type AuthServiceServer } from "../grpc/contracts";
import { authHandlers } from "./auth/auth.handlers";

export const authHandler: AuthServiceServer = {
  ...authHandlers,
};
