import * as grpc from "@grpc/grpc-js";
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
