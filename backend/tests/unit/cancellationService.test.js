const { createChain } = require("./testHelpers");

const mockSupabase = {
  from: jest.fn(),
};

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-cancel"),
}));

const cancellationService = require("../../src/features/cancellation/cancellationService");

describe("cancellationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createCancellationRequest creates request for eligible order", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "customer-1" }, error: null }),
      )
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
      .mockImplementationOnce(() =>
        createChain({ data: null, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "cancel-1",
            orderId: "order-1",
            status: "REQUESTED",
          },
          error: null,
        }),
      );

    const result = await cancellationService.createCancellationRequest(
      "order-1",
      "Need to cancel",
      "user-1",
    );

    expect(result.id).toBe("cancel-1");
  });

  test("createCancellationRequest rejects delivered orders", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "customer-1" }, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "order-1",
            status: "DELIVERED",
            customerId: "customer-1",
            Customer: { userId: "user-1" },
          },
          error: null,
        }),
      );

    await expect(
      cancellationService.createCancellationRequest(
        "order-1",
        "Need to cancel",
        "user-1",
      ),
    ).rejects.toEqual({
      status: 400,
      message:
        "Cannot cancel order with status DELIVERED. Only PENDING, CONFIRMED, or SHIPPED orders can be cancelled.",
    });
  });

  test("updateCancellationStatus rejects invalid transition", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "cancel-1",
          orderId: "order-1",
          status: "REQUESTED",
          Order: { id: "order-1", status: "PENDING" },
        },
        error: null,
      }),
    );

    await expect(
      cancellationService.updateCancellationStatus(
        "cancel-1",
        "COMPLETED",
        "admin-user",
        "ADMIN",
      ),
    ).rejects.toEqual({
      status: 400,
      message:
        "Invalid status transition: REQUESTED → COMPLETED. Allowed: APPROVED, REJECTED",
    });
  });

  test("getCancellationById blocks unauthorized customer", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "cancel-1",
          orderId: "order-1",
          Order: {
            Customer: {
              userId: "other-user",
            },
          },
        },
        error: null,
      }),
    );

    await expect(
      cancellationService.getCancellationById("cancel-1", "user-1", "CUSTOMER"),
    ).rejects.toEqual({
      status: 403,
      message: "You can only access your own cancellation requests",
    });
  });
});
