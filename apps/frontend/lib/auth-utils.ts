import type { ServiceError } from "@grpc/grpc-js";
import type { LoginRequest, RegisterRequest } from "../../../packages/generated/auth";

export function parseLoginBody(body: unknown): {
  ok: true;
  value: LoginRequest;
} | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password.trim() : "";

  if (!email || !password) {
    return { ok: false, error: "Email and password are required" };
  }

  return {
    ok: true,
    value: {
      email,
      password,
    },
  };
}

export function parseRegisterBody(body: unknown): {
  ok: true;
  value: RegisterRequest;
} | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const lastName = typeof raw.lastName === "string" ? raw.lastName.trim() : "";

  if (!name || !lastName || !email || !password) {
    return {
      ok: false,
      error: "Name, last name, email and password are required",
    };
  }

  return {
    ok: true,
    value: {
      name,
      lastName,
      email,
      password,
    },
  };
}

export function mapGrpcAuthErrorToHttp(error: unknown): {
  status: number;
  message: string;
} {
  const grpcError = error as Partial<ServiceError>;
  const code = grpcError.code;

  if (code === 16 || code === 3 || code === 7) {
    return { status: 401, message: "Invalid credentials" };
  }

  return { status: 500, message: "Login failed" };
}

export function mapGrpcRegisterErrorToHttp(error: unknown): {
  status: number;
  message: string;
} {
  const grpcError = error as Partial<ServiceError>;
  const code = grpcError.code;

  if (code === 6) {
    return { status: 409, message: "User already exists" };
  }

  if (code === 3) {
    return { status: 400, message: "Invalid registration data" };
  }

  return { status: 500, message: "Registration failed" };
}
