const { createChain } = require("./testHelpers");

const mockSupabase = {
  from: jest.fn(),
};

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-return"),
}));

const returnService = require("../../src/features/return/returnService");

describe("returnService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createReturnRequest creates a return for delivered order", async () => {
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
      )
      .mockImplementationOnce(() =>
        createChain({ data: null, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "return-1",
            orderId: "order-1",
            status: "REQUESTED",
          },
          error: null,
        }),
      );

    const result = await returnService.createReturnRequest(
      "order-1",
      "Damaged item",
      "user-1",
    );

    expect(result.id).toBe("return-1");
  });

  test("createReturnRequest rejects non-delivered orders", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "customer-1" }, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "order-1",
            status: "SHIPPED",
            customerId: "customer-1",
            Customer: { userId: "user-1" },
          },
          error: null,
        }),
      );

    await expect(
      returnService.createReturnRequest("order-1", "Damaged item", "user-1"),
    ).rejects.toEqual({
      status: 400,
      message: "Only DELIVERED orders can be returned",
    });
  });

  test("updateReturnStatus rejects invalid status transition", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "return-1",
          orderId: "order-1",
          status: "REQUESTED",
          Order: { id: "order-1", status: "DELIVERED" },
        },
        error: null,
      }),
    );

    await expect(
      returnService.updateReturnStatus(
        "return-1",
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

  test("getReturnById blocks customer who does not own the request", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "return-1",
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
      returnService.getReturnById("return-1", "user-1", "CUSTOMER"),
    ).rejects.toEqual({
      status: 403,
      message: "You can only access your own return requests",
    });
  });
});
