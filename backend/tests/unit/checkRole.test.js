const { checkRole } = require("../../src/middleware/checkRole");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("checkRole middleware", () => {
  test("returns 401 when req.user is missing", () => {
    const req = {};
    const res = createRes();
    const next = jest.fn();

    checkRole("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required",
      errors: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when role is not allowed", () => {
    const req = {
      user: {
        role: "CUSTOMER",
      },
    };
    const res = createRes();
    const next = jest.fn();

    checkRole("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You do not have permission to access this resource",
      errors: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when role is allowed", () => {
    const req = {
      user: {
        role: "ADMIN",
      },
    };
    const res = createRes();
    const next = jest.fn();

    checkRole("ADMIN", "SELLER")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
