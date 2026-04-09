import type { AuthResponse } from "../../../../../../packages/generated/auth";
import { POST } from "./route";
import { authClient } from "@/lib/server/grpc-clients";

jest.mock("@/lib/server/grpc-clients", () => ({
  authClient: {
    login: jest.fn(),
  },
}));

type LoginCallback = (
  error: { code?: number } | null,
  response: AuthResponse,
) => void;

const mockedLogin = authClient.login as unknown as jest.Mock;

describe("login route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid request body", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Email and password are required" });
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("returns 200 and sets auth cookie on successful login", async () => {
    mockedLogin.mockImplementation(
      (_payload: unknown, callback: LoginCallback) => {
        callback(null, {
          token: "jwt-token",
          userId: "u1",
          email: "john@example.com",
          name: "John",
        });
      },
    );

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        password: "secret123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: {
        id: "u1",
        email: "john@example.com",
        name: "John",
      },
    });
    expect(setCookie).toContain("auth_token=jwt-token");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
    expect(setCookie?.toLowerCase()).toContain("samesite=lax");
  });

  it("returns 401 when grpc login fails with auth error", async () => {
    mockedLogin.mockImplementation(
      (_payload: unknown, callback: LoginCallback) => {
        callback({ code: 16 }, {} as AuthResponse);
      },
    );

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        password: "wrong-password",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Invalid credentials" });
  });
});
