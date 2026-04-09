import type {
  ApiErrorResponse,
  AuthApiSuccess,
  ClientResult,
} from "./api-types";

export type RegisterInput = {
  name: string;
  lastName: string;
  email: string;
  password: string;
};

export async function registerUser({
  name,
  lastName,
  email,
  password,
}: RegisterInput): Promise<ClientResult<AuthApiSuccess>> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastName, email, password }),
    });

    const result = (await response.json()) as AuthApiSuccess | ApiErrorResponse;

    if (!response.ok) {
      const message =
        "error" in result && typeof result.error === "string"
          ? result.error
          : "Registration failed";
      return { ok: false, error: message };
    }

    return { ok: true, data: result as AuthApiSuccess };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
