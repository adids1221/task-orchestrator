import type {
  ApiErrorResponse,
  AuthApiSuccess,
  ClientResult,
} from "./api-types";

export async function loginUser(
  email: string,
  password: string,
): Promise<ClientResult<AuthApiSuccess>> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = (await response.json()) as AuthApiSuccess | ApiErrorResponse;

    if (!response.ok) {
      const message =
        "error" in result && typeof result.error === "string"
          ? result.error
          : "Login failed";
      return { ok: false, error: message };
    }

    return { ok: true, data: result as AuthApiSuccess };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
