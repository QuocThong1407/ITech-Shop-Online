const { createChain } = require("./testHelpers");

const mockSupabase = { from: jest.fn(), rpc: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-payment"),
}));

const paymentService = require("../../src/features/payment/paymentService");

describe("paymentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createPayment rejects invalid method", async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === "Customer") return createChain({ data: { id: "customer-1" }, error: null });
      if (table === "Order") {
        return createChain({
          data: {
            id: "order-1",
            status: "PENDING",
            customerId: "customer-1",
            Customer: { userId: "user-1" },
          },
          error: null,
        });
      }
      if (table === "Payment") return createChain({ data: null, error: null });
      if (table === "OrderItem") {
        return createChain({
          data: [
            { quantity: 1, ProductVariant: { priceAdjustment: 0, Product: { price: 100000 } } },
          ],
          error: null,
        });
      }
      return createChain({ data: null, error: null });
    });

    await expect(
      paymentService.createPayment({
        orderId: "order-1",
        method: "CASH",
        userId: "user-1",
      }),
    ).rejects.toEqual({ status: 400, message: "Invalid payment method" });
  });

  test("createPayment creates COD payment", async () => {
    mockSupabase.from
      .mockImplementationOnce(() => createChain({ data: { id: "customer-1" }, error: null }))
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "order-1",
            status: "PENDING",
            customerId: "customer-1",
            Customer: { userId: "user-1" },
          },
          error: null,
        }),
      )
      .mockImplementationOnce(() => createChain({ data: null, error: null }))
      .mockImplementationOnce(() =>
        createChain({
          data: [{ quantity: 2, ProductVariant: { priceAdjustment: 0, Product: { price: 100000 } } }],
          error: null,
        }),
      )
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "payment-1",
            orderId: "order-1",
            method: "COD",
            status: "PENDING",
          },
          error: null,
        }),
      );

    const result = await paymentService.createPayment({
      orderId: "order-1",
      method: "COD",
      userId: "user-1",
    });

    expect(result.payment.method).toBe("COD");
  });

  test("getPaymentByOrderId blocks unauthorized customer", async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === "Order") {
        return createChain({
          data: {
            id: "order-1",
            status: "PENDING",
            customerId: "customer-1",
            Customer: { id: "customer-1", userId: "other-user" },
          },
          error: null,
        });
      }
      if (table === "Payment") {
        return createChain({
          data: {
            id: "payment-1",
            amount: 100000,
            method: "COD",
            status: "PENDING",
            paymentDate: "2026-01-01T00:00:00.000Z",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            orderId: "order-1",
          },
          error: null,
        });
      }
      return createChain({ data: null, error: null });
    });

    await expect(
      paymentService.getPaymentByOrderId("order-1", "user-1", "CUSTOMER"),
    ).rejects.toEqual({
      status: 403,
      message: "You can only access your own orders",
    });
  });
});
