jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      req.user = {
        userId: "customer-user-id",
        role: "CUSTOMER",
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

jest.mock("../../src/features/payment/paymentService", () => ({
  createPayment: jest.fn(),
  getPaymentByOrderId: jest.fn(),
  handleVNPayIPN: jest.fn(),
  handleVNPayReturn: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const paymentService = require("../../src/features/payment/paymentService");

describe("Payment routes", () => {
  test("POST /api/payments rejects VNPay requests without returnUrl", async () => {
    const res = await request(app).post("/api/payments").send({
      orderId: "order-1",
      method: "VNPAY",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Return URL is required for VNPay payment");
    expect(paymentService.createPayment).not.toHaveBeenCalled();
  });

  test("POST /api/payments creates a COD payment", async () => {
    paymentService.createPayment.mockResolvedValue({
      payment: {
        id: "payment-1",
        orderId: "order-1",
        method: "COD",
        status: "PENDING",
      },
      message: "COD payment created. Pay when you receive the order.",
    });

    const res = await request(app).post("/api/payments").send({
      orderId: "order-1",
      method: "COD",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment.method).toBe("COD");
    expect(paymentService.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        method: "COD",
        userId: "customer-user-id",
      }),
    );
  });

  test("GET /api/payments/:orderId returns payment details", async () => {
    paymentService.getPaymentByOrderId.mockResolvedValue({
      id: "payment-1",
      amount: 150000,
      method: "COD",
      status: "PENDING",
      orderId: "order-1",
    });

    const res = await request(app).get("/api/payments/order-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("order-1");
    expect(paymentService.getPaymentByOrderId).toHaveBeenCalledWith(
      "order-1",
      "customer-user-id",
      "CUSTOMER",
    );
  });
});
