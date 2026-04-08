import { Prisma } from "@prisma/client";
import * as grpc from "@grpc/grpc-js";
import prisma from "../../db";
import {
  authUtils,
  handleServiceError,
  respondWithGrpcError,
} from "../../utils";
import { authHandler } from "../auth.service";

jest.mock("../../db", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../../utils", () => ({
  __esModule: true,
  authUtils: {
    comparePassword: jest.fn(),
    generateAuthToken: jest.fn(),
    hashPassword: jest.fn(),
  },
  respondWithGrpcError: jest.fn(),
  handleServiceError: jest.fn(),
}));

type MockedPrisma = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

const registerRequest = {
  email: "a@test.com",
  password: "plain",
  name: "Ada",
  lastName: "L",
};

describe("authService", () => {
  const prismaMock = prisma as unknown as MockedPrisma;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("login", () => {
    it("returns UNAUTHENTICATED when login user is missing", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const callback = jest.fn();

      await authHandler.login(
        { request: { email: "a@test.com", password: "x" } } as any,
        callback as any,
      );

      expect(respondWithGrpcError).toHaveBeenCalledWith(
        callback,
        grpc.status.UNAUTHENTICATED,
        "Invalid credentials",
      );
    });

    it("returns AuthResponse on successful login", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "u1",
        email: "a@test.com",
        name: "Ada",
        password: "hashed",
      });
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.generateAuthToken as jest.Mock).mockReturnValue("jwt-token");
      const callback = jest.fn();

      await authHandler.login(
        { request: { email: "a@test.com", password: "plain" } } as any,
        callback as any,
      );

      expect(callback).toHaveBeenCalledWith(null, {
        token: "jwt-token",
        userId: "u1",
        email: "a@test.com",
        name: "Ada",
      });
    });
  });

  describe("register", () => {
    it("returns ALREADY_EXISTS when register email already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "u1" });
      const callback = jest.fn();

      await authHandler.register(
        {
          request: registerRequest,
        } as any,
        callback as any,
      );

      expect(respondWithGrpcError).toHaveBeenCalledWith(
        callback,
        grpc.status.ALREADY_EXISTS,
        "User with this email already exists",
      );
    });

    it("returns ALREADY_EXISTS on Prisma P2002 during register", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue("hashed");

      const p2002Error = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      ) as Prisma.PrismaClientKnownRequestError;
      Object.assign(p2002Error, { code: "P2002" });

      prismaMock.user.create.mockRejectedValue(p2002Error);
      const callback = jest.fn();

      await authHandler.register(
        {
          request: registerRequest,
        } as any,
        callback as any,
      );

      expect(respondWithGrpcError).toHaveBeenCalledWith(
        callback,
        grpc.status.ALREADY_EXISTS,
        "User with this email already exists",
      );
      expect(handleServiceError).not.toHaveBeenCalled();
    });
  });
});
