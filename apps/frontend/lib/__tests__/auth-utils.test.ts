import {
  mapGrpcAuthErrorToHttp,
  mapGrpcRegisterErrorToHttp,
  parseLoginBody,
  parseRegisterBody,
} from "../auth-utils";

describe("auth-utils", () => {
  describe("parseLoginBody", () => {
    it("returns parsed login payload with trimmed normalized email", () => {
      const result = parseLoginBody({
        email: "  Test@Example.com ",
        password: "secret123",
      });

      expect(result).toEqual({
        ok: true,
        value: {
          email: "test@example.com",
          password: "secret123",
        },
      });
    });

    it("rejects invalid login body", () => {
      expect(parseLoginBody(null)).toEqual({
        ok: false,
        error: "Invalid request body",
      });

      expect(parseLoginBody({ email: "", password: "" })).toEqual({
        ok: false,
        error: "Email and password are required",
      });
    });
  });

  describe("parseRegisterBody", () => {
    it("returns parsed register payload", () => {
      const result = parseRegisterBody({
        name: " John ",
        lastName: " Doe ",
        email: " John@Example.com ",
        password: "secret123",
      });

      expect(result).toEqual({
        ok: true,
        value: {
          name: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "secret123",
        },
      });
    });

    it("rejects missing register fields", () => {
      expect(parseRegisterBody({ name: "John" })).toEqual({
        ok: false,
        error: "Name, last name, email and password are required",
      });
    });
  });

  describe("grpc error mappers", () => {
    it("maps auth grpc errors", () => {
      expect(mapGrpcAuthErrorToHttp({ code: 16 })).toEqual({
        status: 401,
        message: "Invalid credentials",
      });

      expect(mapGrpcAuthErrorToHttp({ code: 99 })).toEqual({
        status: 500,
        message: "Login failed",
      });
    });

    it("maps register grpc errors", () => {
      expect(mapGrpcRegisterErrorToHttp({ code: 6 })).toEqual({
        status: 409,
        message: "User already exists",
      });

      expect(mapGrpcRegisterErrorToHttp({ code: 3 })).toEqual({
        status: 400,
        message: "Invalid registration data",
      });

      expect(mapGrpcRegisterErrorToHttp({ code: 99 })).toEqual({
        status: 500,
        message: "Registration failed",
      });
    });
  });
});
