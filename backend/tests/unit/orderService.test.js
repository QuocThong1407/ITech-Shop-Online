const mockSupabase = { from: jest.fn(), rpc: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("../../src/features/order/orderHelper", () => ({
  validatePaymentMethod: jest.fn(),
  getCustomerByUserId: jest.fn(),
  getSellerByUserId: jest.fn(),
  validateAddressOwnership: jest.fn(),
  getCartWithItems: jest.fn(),
  validateCartItems: jest.fn(),
  calculateOrderDetailsWithDiscount: jest.fn(),
  createOrderRecord: jest.fn(),
  deductStockAtomic: jest.fn(),
  updateProductStock: jest.fn(),
  createOrderItems: jest.fn(),
  createPayment: jest.fn(),
  clearCart: jest.fn(),
  rollbackOrder: jest.fn(),
  validateStatusTransition: jest.fn(),
  updateOrderStatusRecord: jest.fn(),
  updatePaymentStatus: jest.fn(),
  checkOrderOwnership: jest.fn(),
  checkSellerOrderOwnership: jest.fn(),
  getOrderIdsForSeller: jest.fn(),
}));

jest.mock("../../src/features/membership/membershipService", () => ({
  getMembershipByCustomerId: jest.fn(),
  getMembershipBenefits: jest.fn(),
}));

jest.mock("../../src/features/membership/membershipRefundHandler", () => ({
  handleOrderRestore: jest.fn(),
  handleOrderRefund: jest.fn(),
}));

const orderHelper = require("../../src/features/order/orderHelper");
const orderService = require("../../src/features/order/orderService");

describe("orderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createOrder rolls back when createOrderRecord fails", async () => {
    orderHelper.validatePaymentMethod.mockImplementation(() => {});
    orderHelper.getCustomerByUserId.mockResolvedValue({ id: "customer-1" });
    orderHelper.validateAddressOwnership.mockResolvedValue(true);
    orderHelper.getCartWithItems.mockResolvedValue({
      cart: { id: "cart-1" },
      cartItems: [],
    });
    orderHelper.validateCartItems.mockImplementation(() => {});
    orderHelper.calculateOrderDetailsWithDiscount.mockResolvedValue({
      subtotal: 100,
      discountPercentage: 0,
      discountAmount: 0,
      finalAmount: 100,
      membershipTier: "BRONZE",
      variantUpdates: [],
    });
    orderHelper.createOrderRecord.mockRejectedValue(new Error("db error"));

    await expect(
      orderService.createOrder("user-1", "address-1", "COD"),
    ).rejects.toEqual({
      status: 500,
      message: "db error",
    });
  });

  test("getMyOrders returns paginated orders", async () => {
    orderHelper.getCustomerByUserId.mockResolvedValue({ id: "customer-1" });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn(async () => ({ data: [{ id: "order-1" }], error: null, count: 1 })),
    });

    const result = await orderService.getMyOrders("user-1", { page: 1, limit: 10 });

    expect(result.orders).toHaveLength(1);
  });

  test("updateOrderStatus validates seller ownership", async () => {
    orderHelper.getSellerByUserId.mockResolvedValue({ id: "seller-1" });
    orderHelper.checkSellerOrderOwnership.mockResolvedValue(true);
    orderHelper.validateStatusTransition.mockImplementation(() => {});
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(async () => ({ data: { id: "order-1", status: "PENDING" }, error: null })),
      update: jest.fn().mockReturnThis(),
    });
    orderHelper.updateOrderStatusRecord.mockResolvedValue(true);
    orderHelper.updatePaymentStatus.mockResolvedValue(true);

    await expect(
      orderService.updateOrderStatus("order-1", "SHIPPED", "user-1", "SELLER"),
    ).resolves.toEqual(true);
  });

  test("deleteOrder blocks non-pending orders", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(async () => ({
        data: {
          id: "order-1",
          status: "SHIPPED",
          customerId: "customer-1",
          Customer: { userId: "user-1" },
        },
        error: null,
      })),
    });

    await expect(
      orderService.deleteOrder("order-1", "user-1", "CUSTOMER"),
    ).rejects.toEqual({
      status: 400,
      message: "Only PENDING orders can be deleted",
    });
  });
});
