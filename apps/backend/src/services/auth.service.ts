import { Prisma } from "@prisma/client";
import * as grpc from "@grpc/grpc-js";
import prisma from "../db";
import { authUtils, handleServiceError, respondWithGrpcError } from "../utils";
import { type AuthServiceServer } from "../../../../packages/generated/auth";

export const authHandler: AuthServiceServer = {
  login: async (call, callback) => {
    try {
      const { email, password } = call.request;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        respondWithGrpcError(
          callback,
          grpc.status.UNAUTHENTICATED,
          "Invalid credentials",
        );
        return;
      }

      const passwordMatch = await authUtils.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        respondWithGrpcError(
          callback,
          grpc.status.UNAUTHENTICATED,
          "Invalid credentials",
        );
        return;
      }

      const token = authUtils.generateAuthToken(user.id, user.email);

      callback(null, {
        token,
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      handleServiceError(error, callback, "Failed to login user");
    }
  },
  register: async (call, callback) => {
    try {
      if (!process.env.JWT_SECRET) {
        respondWithGrpcError(
          callback,
          grpc.status.INTERNAL,
          "JWT secret is not configured",
        );
        return;
      }

      const { email, password, name, lastName } = call.request;

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        respondWithGrpcError(
          callback,
          grpc.status.ALREADY_EXISTS,
          "User with this email already exists",
        );
        return;
      }

      const hashedPassword = await authUtils.hashPassword(password);

      const newUser = await prisma.user.create({
        data: { email, password: hashedPassword, name, lastName },
      });

      const token = authUtils.generateAuthToken(newUser.id, newUser.email);

      callback(null, {
        token,
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
      });
    } catch (error: unknown) {
      // Prisma error code for unique constraint violation - email already exists
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        respondWithGrpcError(
          callback,
          grpc.status.ALREADY_EXISTS,
          "User with this email already exists",
        );
        return;
      }

      handleServiceError(error, callback, "Failed to register user");
    }
  },
};
