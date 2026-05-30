const mockDb = {
  from: jest.fn(),
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    setSession: jest.fn(),
    updateUser: jest.fn(),
  },
};

const mockAdminDb = {
  from: jest.fn(),
  auth: mockDb.auth,
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn((url, key) =>
    key === process.env.SUPABASE_SERVICE_ROLE_KEY ? mockAdminDb : mockDb,
  ),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-auth"),
}));

const authService = require("../../src/features/auth/authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register rejects mismatched passwords", async () => {
    await expect(
      authService.register({
        username: "john",
        email: "john@example.com",
        password: "password123",
        password_confirmation: "password321",
      }),
    ).rejects.toEqual({ status: 400, message: "Passwords do not match" });
  });

  test("login rejects invalid credentials", async () => {
    mockDb.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error("bad credentials"),
    });

    await expect(
      authService.login({
        email: "john@example.com",
        password: "wrong",
      }),
    ).rejects.toEqual({ status: 401, message: "Invalid credentials" });
  });

  test("login rejects unverified email", async () => {
    mockDb.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email_confirmed_at: null,
        },
        session: {
          access_token: "token-1",
        },
      },
      error: null,
    });

    await expect(
      authService.login({
        email: "john@example.com",
        password: "password123",
      }),
    ).rejects.toEqual({
      status: 403,
      message: "Please verify your email before logging in",
    });
  });

  test("completeProfile returns existing user when profile exists", async () => {
    mockAdminDb.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(async () => ({
        data: { id: "user-1" },
        error: null,
      })),
    });

    const result = await authService.completeProfile({
      id: "user-1",
      email: "john@example.com",
      user_metadata: { username: "john" },
    });

    expect(result).toEqual({ id: "user-1" });
  });
});
