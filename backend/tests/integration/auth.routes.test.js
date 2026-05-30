jest.mock("../../src/features/auth/authService", () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  completeProfile: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const authService = require("../../src/features/auth/authService");

describe("Auth routes", () => {
  test("POST /api/auth/register returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing required fields");
    expect(authService.register).not.toHaveBeenCalled();
  });

  test("POST /api/auth/register returns 201 when payload is valid", async () => {
    authService.register.mockResolvedValue({
      message: "Please verify your email to complete registration",
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "john",
      email: "john@example.com",
      password: "password123",
      password_confirmation: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      message: "Please verify your email to complete registration",
    });
    expect(authService.register).toHaveBeenCalledWith({
      username: "john",
      email: "john@example.com",
      password: "password123",
      password_confirmation: "password123",
    });
  });

  test("POST /api/auth/login returns 200 and sets token cookie", async () => {
    authService.login.mockResolvedValue({
      accessToken: "token-123",
      user: {
        id: "user-1",
        username: "john",
        email: "john@example.com",
        role: "CUSTOMER",
      },
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toEqual({
      id: "user-1",
      username: "john",
      email: "john@example.com",
      role: "CUSTOMER",
    });
    expect(res.body.data.accessToken).toBe("token-123");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(authService.login).toHaveBeenCalledWith({
      email: "john@example.com",
      password: "password123",
    });
  });

  test("POST /api/auth/login returns 400 when email or password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email and password are required");
    expect(authService.login).not.toHaveBeenCalled();
  });
});
