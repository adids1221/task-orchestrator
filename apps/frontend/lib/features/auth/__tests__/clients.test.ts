import { loginUser } from "../login-client";
import { registerUser } from "../register-client";

describe("auth client helpers", () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    Object.defineProperty(global, "fetch", {
      writable: true,
      value: fetchMock,
    });
  });

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("loginUser returns success payload", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "u1", email: "test@example.com", name: "John" },
      }),
    });

    await expect(loginUser("test@example.com", "secret123")).resolves.toEqual({
      ok: true,
      data: {
        user: { id: "u1", email: "test@example.com", name: "John" },
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "secret123" }),
    });
  });

  it("loginUser returns api error message on failed response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    await expect(loginUser("test@example.com", "wrong")).resolves.toEqual({
      ok: false,
      error: "Invalid credentials",
    });
  });

  it("registerUser returns success payload", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "u2", email: "jane@example.com", name: "Jane" },
      }),
    });

    await expect(
      registerUser({
        name: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "secret123",
      }),
    ).resolves.toEqual({
      ok: true,
      data: {
        user: { id: "u2", email: "jane@example.com", name: "Jane" },
      },
    });
  });

  it("registerUser returns network error on fetch failure", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(
      registerUser({
        name: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "secret123",
      }),
    ).resolves.toEqual({
      ok: false,
      error: "Network error. Please try again.",
    });
  });
});
