jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      const path = req.originalUrl || req.url || req.path || "";
      const isAdminArea =
        path.endsWith("/status") || path === "/api/cancellations";
      const isCustomerArea =
        path.includes("/cancel/request") ||
        path.includes("/me") ||
        (path.includes("/api/cancellations/") && !isAdminArea);

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

jest.mock("../../src/features/cancellation/cancellationService", () => ({
  createCancellationRequest: jest.fn(),
  updateCancellationStatus: jest.fn(),
  getMyCancellations: jest.fn(),
  getAllCancellations: jest.fn(),
  getCancellationById: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const cancellationService = require("../../src/features/cancellation/cancellationService");

describe("Cancellation routes", () => {
  test("POST /api/orders/:id/cancel/request rejects empty reason", async () => {
    const res = await request(app)
      .post("/api/orders/order-1/cancel/request")
      .send({ reason: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cancellation reason is required");
    expect(cancellationService.createCancellationRequest).not.toHaveBeenCalled();
  });

  test("POST /api/orders/:id/cancel/request creates request", async () => {
    cancellationService.createCancellationRequest.mockResolvedValue({
      id: "cancel-1",
      status: "REQUESTED",
    });

    const res = await request(app)
      .post("/api/orders/order-1/cancel/request")
      .send({ reason: "Need to cancel order" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(cancellationService.createCancellationRequest).toHaveBeenCalledWith(
      "order-1",
      "Need to cancel order",
      "customer-user-id",
    );
  });

  test("GET /api/cancellations/me returns customer cancellations", async () => {
    cancellationService.getMyCancellations.mockResolvedValue({
      cancellations: [{ id: "cancel-1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app).get("/api/cancellations/me");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(cancellationService.getMyCancellations).toHaveBeenCalledWith(
      "customer-user-id",
      {
        page: undefined,
        limit: undefined,
        status: undefined,
      },
    );
  });

  test("GET /api/cancellations/:id returns cancellation detail", async () => {
    cancellationService.getCancellationById.mockResolvedValue({
      id: "cancel-1",
      status: "REQUESTED",
    });

    const res = await request(app).get("/api/cancellations/cancel-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(cancellationService.getCancellationById).toHaveBeenCalledWith(
      "cancel-1",
      "customer-user-id",
      "CUSTOMER",
    );
  });

  test("PATCH /api/cancellations/:id/status rejects invalid status", async () => {
    const res = await request(app)
      .patch("/api/cancellations/cancel-1/status")
      .send({ status: "DONE" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid status");
    expect(cancellationService.updateCancellationStatus).not.toHaveBeenCalled();
  });

  test("PATCH /api/cancellations/:id/status updates cancellation status", async () => {
    cancellationService.updateCancellationStatus.mockResolvedValue({
      id: "cancel-1",
      status: "APPROVED",
    });

    const res = await request(app)
      .patch("/api/cancellations/cancel-1/status")
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(cancellationService.updateCancellationStatus).toHaveBeenCalledWith(
      "cancel-1",
      "APPROVED",
      "customer-user-id",
      "ADMIN",
    );
  });
});
