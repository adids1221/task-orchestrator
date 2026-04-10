import type { ClientResult } from "./api-types";

export async function logoutUser(): Promise<ClientResult<{ message: string }>> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const payload = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      return {
        ok: false,
        error: payload.error || "Logout failed",
      };
    }

    return {
      ok: true,
      data: { message: payload.message || "Logged out" },
    };
  } catch {
    return {
      ok: false,
      error: "Network error",
    };
  }
}
