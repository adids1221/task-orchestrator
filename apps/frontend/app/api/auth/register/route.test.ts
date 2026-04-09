import type { AuthResponse } from "../../../../../../packages/generated/auth";
import { POST } from "./route";
import { authClient } from "@/lib/server/grpc-clients";

jest.mock("@/lib/server/grpc-clients", () => ({
  authClient: {
    register: jest.fn(),
  },
}));

type RegisterCallback = (
  error: { code?: number } | null,
  response: AuthResponse,
) => void;

const mockedRegister = authClient.register as unknown as jest.Mock;

describe("register route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid request body", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Name, last name, email and password are required",
    });
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("returns 201 for successful registration", async () => {
    mockedRegister.mockImplementation(
      (_payload: unknown, callback: RegisterCallback) => {
        callback(null, {
          token: "jwt-token",
          userId: "u1",
          email: "john@example.com",
          name: "John",
        });
      },
    );

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        name: "John",
        lastName: "Doe",
        password: "secret123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      user: {
        id: "u1",
        email: "john@example.com",
        name: "John",
      },
    });
    const setCookie = response.headers.get("set-cookie")?.toLowerCase() ?? "";

    expect(setCookie).toContain("auth_token=jwt-token");
    expect(setCookie).toContain("httponly");
    expect(setCookie).toContain("path=/");
    expect(setCookie).toContain("samesite=lax");
    expect(mockedRegister).toHaveBeenCalledTimes(1);
    expect(mockedRegister).toHaveBeenCalledWith(
      {
        email: "john@example.com",
        name: "John",
        lastName: "Doe",
        password: "secret123",
      },
      expect.any(Function),
    );
  });

  it("returns 409 for conflict duplicate registration", async () => {
    mockedRegister.mockImplementation(
      (_payload: unknown, callback: RegisterCallback) => {
        callback({ code: 6 }, null as unknown as AuthResponse);
      },
    );

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        name: "John",
        lastName: "Doe",
        password: "secret123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({
      error: "User already exists",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(mockedRegister).toHaveBeenCalledTimes(1);
    expect(mockedRegister).toHaveBeenCalledWith(
      {
        email: "john@example.com",
        name: "John",
        lastName: "Doe",
        password: "secret123",
      },
      expect.any(Function),
    );
  });
});
