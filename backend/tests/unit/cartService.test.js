const { createChain } = require("./testHelpers");

const mockSupabase = { from: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-cart"),
}));

const cartService = require("../../src/features/cart/cartService");

describe("cartService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getMyCart calculates totals and filters deleted products", async () => {
    mockSupabase.from
      .mockReturnValueOnce(
        createChain({ data: { id: "customer-1" }, error: null }),
      )
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "cart-1",
            customerId: "customer-1",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
            CartItem: [
              {
                id: "item-1",
                quantity: 2,
                ProductVariant: {
                  quantity: 5,
                  priceAdjustment: 5000,
                  Product: {
                    price: 100000,
                    is_deleted: false,
                  },
                },
              },
              {
                id: "item-2",
                quantity: 1,
                ProductVariant: {
                  quantity: 5,
                  priceAdjustment: 0,
                  Product: {
                    price: 50000,
                    is_deleted: true,
                  },
                },
              },
            ],
          },
          error: null,
        }),
      );

    const result = await cartService.getMyCart("user-1");

    expect(result.totalItems).toBe(2);
    expect(result.totalPrice).toBe(210000);
    expect(result.items).toHaveLength(1);
  });

  test("addCartItem throws when stock is insufficient", async () => {
    mockSupabase.from
      .mockReturnValueOnce(createChain({ data: { id: "customer-1" }, error: null }))
      .mockReturnValueOnce(createChain({ data: { id: "cart-1" }, error: null }))
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "variant-1",
            quantity: 2,
            Product: { is_deleted: false, stockQuantity: 2 },
          },
          error: null,
        }),
      );

    await expect(
      cartService.addCartItem("user-1", {
        productVariantId: "variant-1",
        quantity: 3,
      }),
    ).rejects.toEqual({
      status: 400,
      message: "Only 2 items available in stock",
    });
  });

  test("updateCartItem blocks items that do not belong to cart", async () => {
    mockSupabase.from
      .mockReturnValueOnce(createChain({ data: { id: "customer-1" }, error: null }))
      .mockReturnValueOnce(createChain({ data: { id: "cart-1" }, error: null }))
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "item-1",
            cartId: "other-cart",
            ProductVariant: { quantity: 10 },
          },
          error: null,
        }),
      );

    await expect(
      cartService.updateCartItem("user-1", "item-1", { quantity: 1 }),
    ).rejects.toEqual({
      status: 403,
      message: "This item does not belong to your cart",
    });
  });

  test("clearCart deletes all items", async () => {
    mockSupabase.from
      .mockReturnValueOnce(createChain({ data: { id: "customer-1" }, error: null }))
      .mockReturnValueOnce(createChain({ data: { id: "cart-1" }, error: null }))
      .mockReturnValueOnce(createChain({ data: null, error: null }))
      .mockReturnValueOnce(createChain({ data: null, error: null }));

    await expect(cartService.clearCart("user-1")).resolves.toBe(true);
  });
});
