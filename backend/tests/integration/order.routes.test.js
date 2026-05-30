jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      const path = req.path || "";
      const method = req.method || "";
      const requiresCustomer =
        path.includes("/me") || (path === "/api/orders" && method === "POST");
      const requiresAdminSeller =
        path === "/api/orders" || path.includes("/status");

      req.user = {
        userId: "user-1",
        role: requiresCustomer
          ? "CUSTOMER"
          : requiresAdminSeller
            ? "ADMIN"
            : "CUSTOMER",
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
  };
});

jest.mock("../../src/features/order/orderService", () => ({
  createOrder: jest.fn(),
  getMyOrders: jest.fn(),
  getAllOrders: jest.fn(),
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
  deleteOrder: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const orderService = require("../../src/features/order/orderService");

describe("Order routes", () => {
  test("POST /api/orders rejects missing addressId", async () => {
    const res = await request(app).post("/api/orders").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Address ID is required");
    expect(orderService.createOrder).not.toHaveBeenCalled();
  });

  test("POST /api/orders creates an order when payload is valid", async () => {
    orderService.createOrder.mockResolvedValue({
      id: "order-1",
      status: "PENDING",
    });

    const res = await request(app).post("/api/orders").send({
      addressId: "address-1",
      paymentMethod: "COD",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(orderService.createOrder).toHaveBeenCalledWith(
      "user-1",
      "address-1",
      "COD",
    );
  });

  test("PATCH /api/orders/:id/status rejects invalid status", async () => {
    const res = await request(app)
      .patch("/api/orders/order-1/status")
      .send({ status: "ARCHIVED" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid status");
    expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
  });

  test("PATCH /api/orders/:id/status updates status when valid", async () => {
    orderService.updateOrderStatus.mockResolvedValue({
      id: "order-1",
      status: "SHIPPED",
    });

    const res = await request(app)
      .patch("/api/orders/order-1/status")
      .send({ status: "SHIPPED" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(
      "order-1",
      "SHIPPED",
      "user-1",
      "ADMIN",
    );
  });

  test("GET /api/orders/me returns customer orders", async () => {
    orderService.getMyOrders.mockResolvedValue({
      orders: [{ id: "order-1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app).get("/api/orders/me");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(orderService.getMyOrders).toHaveBeenCalledWith("user-1", {
      page: undefined,
      limit: undefined,
      status: undefined,
    });
  });

  test("DELETE /api/orders/:id returns success when service resolves", async () => {
    orderService.deleteOrder.mockResolvedValue(true);

    const res = await request(app).delete("/api/orders/order-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Order deleted successfully");
    expect(orderService.deleteOrder).toHaveBeenCalledWith(
      "order-1",
      "user-1",
      "CUSTOMER",
    );
  });
});
