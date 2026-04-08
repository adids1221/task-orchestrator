import * as grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";

type GrpcCallback = (err: { code: number; message: string }) => void;

export const respondWithGrpcError = (
  callback: GrpcCallback,
  code: grpc.status,
  message: string,
): void => {
  callback({ code, message });
};

export const handleServiceError = (
  error: unknown,
  callback: GrpcCallback,
  message = "An unexpected error occurred",
): void => {
  console.error("Service error:", error);
  respondWithGrpcError(callback, grpc.status.INTERNAL, message);
};

export const getAuthorizedUserId = (metadata: grpc.Metadata): string | null => {
  const authHeader = metadata.get("authorization")[0];

  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && "userId" in decoded) {
      return decoded.userId as string;
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
  return null;
};
