jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      const path = req.originalUrl || req.url || req.path || "";
      const isAdminArea = path.endsWith("/status") || path === "/api/returns";
      const isCustomerArea =
        path.includes("/return/request") ||
        path.includes("/me") ||
        (path.includes("/api/returns/") && !isAdminArea);

      req.user = {
        userId: "customer-user-id",
        customerId: "customer-1",
        role: isCustomerArea ? "CUSTOMER" : "ADMIN",
      };
      next();
    },
    checkRole:
      (...allowedRoles) =>
      (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource",
          });
        }

        next();
      },
    upload: {
      any: () => (req, res, next) => {
        req.files = [];
        next();
      },
      single: () => (req, res, next) => {
        req.file = null;
        next();
      },
      array: () => (req, res, next) => {
        req.files = [];
        next();
      },
    },
  };
});

jest.mock("../../src/features/return/returnService", () => ({
  createReturnRequest: jest.fn(),
  updateReturnStatus: jest.fn(),
  getMyReturns: jest.fn(),
  getAllReturns: jest.fn(),
  getReturnById: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const returnService = require("../../src/features/return/returnService");

describe("Return routes", () => {
  test("POST /api/orders/:id/return/request rejects empty reason", async () => {
    const res = await request(app)
      .post("/api/orders/order-1/return/request")
      .send({ reason: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Return reason is required");
    expect(returnService.createReturnRequest).not.toHaveBeenCalled();
  });

  test("POST /api/orders/:id/return/request creates request", async () => {
    returnService.createReturnRequest.mockResolvedValue({
      id: "return-1",
      status: "REQUESTED",
    });

    const res = await request(app)
      .post("/api/orders/order-1/return/request")
      .send({ reason: "Product arrived damaged" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(returnService.createReturnRequest).toHaveBeenCalledWith(
      "order-1",
      "Product arrived damaged",
      "customer-user-id",
    );
  });

  test("GET /api/returns/me returns customer returns", async () => {
    returnService.getMyReturns.mockResolvedValue({
      returns: [{ id: "return-1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app).get("/api/returns/me");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(returnService.getMyReturns).toHaveBeenCalledWith(
      "customer-user-id",
      {
        page: undefined,
        limit: undefined,
        status: undefined,
      },
    );
  });

  test("GET /api/returns/:id returns return detail", async () => {
    returnService.getReturnById.mockResolvedValue({
      id: "return-1",
      status: "REQUESTED",
    });

    const res = await request(app).get("/api/returns/return-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(returnService.getReturnById).toHaveBeenCalledWith(
      "return-1",
      "customer-user-id",
      "CUSTOMER",
    );
  });

  test("PATCH /api/returns/:id/status rejects invalid status", async () => {
    const res = await request(app)
      .patch("/api/returns/return-1/status")
      .send({ status: "DONE" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid status");
    expect(returnService.updateReturnStatus).not.toHaveBeenCalled();
  });

  test("PATCH /api/returns/:id/status updates return status", async () => {
    returnService.updateReturnStatus.mockResolvedValue({
      id: "return-1",
      status: "APPROVED",
    });

    const res = await request(app)
      .patch("/api/returns/return-1/status")
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(returnService.updateReturnStatus).toHaveBeenCalledWith(
      "return-1",
      "APPROVED",
      "customer-user-id",
      "ADMIN",
    );
  });
});
