jest.mock("../../src/configs/supabase", () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
  supabaseAdmin: {},
}));

jest.mock("../../src/features/membership/membershipService", () => ({
  getMembershipByCustomerId: jest.fn(),
  getMembershipBenefits: jest.fn(),
}));

const orderHelper = require("../../src/features/order/orderHelper");

describe("orderHelper", () => {
  test("validatePaymentMethod accepts supported methods", () => {
    expect(() => orderHelper.validatePaymentMethod("COD")).not.toThrow();
    expect(() => orderHelper.validatePaymentMethod("VNPAY")).not.toThrow();
    expect(() => orderHelper.validatePaymentMethod("STRIPE")).not.toThrow();
  });

  test("validatePaymentMethod rejects invalid method", () => {
    expect(() => orderHelper.validatePaymentMethod("CASH")).toThrow(
      "Invalid payment method",
    );
  });

  test("validateCartItems rejects deleted product", () => {
    expect(() =>
      orderHelper.validateCartItems([
        {
          quantity: 1,
          ProductVariant: {
            quantity: 10,
            Product: {
              is_deleted: true,
              name: "Laptop",
            },
          },
        },
      ]),
    ).toThrow('Product "Laptop" is no longer available');
  });

  test("validateCartItems rejects insufficient stock", () => {
    expect(() =>
      orderHelper.validateCartItems([
        {
          quantity: 11,
          ProductVariant: {
            quantity: 10,
            Product: {
              is_deleted: false,
              name: "Laptop",
            },
          },
        },
      ]),
    ).toThrow('Insufficient stock for "Laptop"');
  });

  test("calculateOrderDetails returns total and stock updates", () => {
    const result = orderHelper.calculateOrderDetails([
      {
        quantity: 2,
        productVariantId: "variant-1",
        ProductVariant: {
          priceAdjustment: 5000,
          quantity: 10,
          productId: "product-1",
          Product: {
            price: 100000,
          },
        },
      },
    ]);

    expect(result.totalAmount).toBe(210000);
    expect(result.variantUpdates).toEqual([
      {
        variantId: "variant-1",
        productId: "product-1",
        quantityToDeduct: 2,
        currentQuantity: 10,
      },
    ]);
  });

  test("validateStatusTransition blocks invalid transitions", () => {
    expect(() =>
      orderHelper.validateStatusTransition("PENDING", "DELIVERED"),
    ).toThrow("Invalid status transition");
  });

  test("validateStatusTransition allows valid transitions", () => {
    expect(() =>
      orderHelper.validateStatusTransition("PENDING", "CONFIRMED"),
    ).not.toThrow();
  });
});
