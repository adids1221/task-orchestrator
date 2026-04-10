import { Metadata } from "@grpc/grpc-js";
import { cookies } from "next/headers";

export function mapGrpcErrorToHttp(
  error: unknown,
  fallbackMessage = "Service error",
): { status: number; message: string } {
  const fallback = {
    status: 502,
    message: error instanceof Error ? error.message : fallbackMessage,
  };

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const maybeCode = (error as { code?: unknown }).code;
  const message =
    (error as { message?: unknown }).message &&
    typeof (error as { message?: unknown }).message === "string"
      ? ((error as { message: string }).message as string)
      : fallback.message;

  switch (maybeCode) {
    case 3:
      return { status: 400, message };
    case 5:
      return { status: 404, message };
    case 6:
      return { status: 409, message };
    case 7:
      return { status: 403, message };
    case 12:
      return { status: 501, message };
    case 16:
      return { status: 401, message };
    default:
      return { status: 502, message };
  }
}

export function getBearerTokenFromHeader(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith("Bearer ")) {
    return null;
  }

  const token = value.slice("Bearer ".length).trim();
  return token || null;
}

export async function buildAuthMetadata(request: Request): Promise<Metadata | null> {
  const authHeaderToken = getBearerTokenFromHeader(
    request.headers.get("authorization"),
  );

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("auth_token")?.value;
  const token = authHeaderToken || cookieToken;

  if (!token) {
    return null;
  }

  const metadata = new Metadata();
  metadata.set("authorization", `Bearer ${token}`);
  return metadata;
}

export function readStringField(body: unknown, ...keys: string[]): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = (body as Record<string, unknown>)[key];
    if (typeof value === "string") {
      return value.trim();
    }
  }

  return "";
}