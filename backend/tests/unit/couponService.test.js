const { createChain } = require("./testHelpers");

const mockSupabase = {
  from: jest.fn(),
};

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-coupon"),
}));

const couponService = require("../../src/features/coupon/couponService");

describe("couponService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createCoupon throws 404 when promotion does not exist", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({ data: null, error: { message: "not found" } }),
    );

    await expect(
      couponService.createCoupon({
        promotionId: "promo-1",
        code: "sale10",
        discountPercentage: 10,
        maxUsage: 5,
      }),
    ).rejects.toEqual({ status: 404, message: "Promotion not found" });
  });

  test("createCoupon throws when coupon code already exists", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "promo-1" }, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({ data: { id: "coupon-1" }, error: null }),
      );

    await expect(
      couponService.createCoupon({
        promotionId: "promo-1",
        code: "sale10",
        discountPercentage: 10,
        maxUsage: 5,
      }),
    ).rejects.toEqual({ status: 400, message: "Coupon code already exists" });
  });

  test("validateCoupon returns calculation for active promotion", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "coupon-1",
          code: "SALE10",
          discountPercentage: 10,
          maxUsage: 10,
          usageCount: 2,
          Promotion: {
            id: "promo-1",
            name: "Summer Sale",
            status: "ACTIVE",
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: "2026-12-31T23:59:59.000Z",
          },
        },
        error: null,
      }),
    );

    const result = await couponService.validateCoupon("sale10", 100000);

    expect(result.valid).toBe(true);
    expect(result.calculation.finalAmount).toBe(90000);
    expect(result.remainingUsage).toBe(8);
  });

  test("validateCoupon rejects inactive promotion", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "coupon-1",
          code: "SALE10",
          discountPercentage: 10,
          maxUsage: 10,
          usageCount: 2,
          Promotion: {
            id: "promo-1",
            name: "Summer Sale",
            status: "INACTIVE",
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: "2026-12-31T23:59:59.000Z",
          },
        },
        error: null,
      }),
    );

    await expect(couponService.validateCoupon("sale10", 100000)).rejects.toEqual(
      {
        status: 400,
        message: "This coupon's promotion is not active",
      },
    );
  });

  test("updateCoupon rejects duplicate code", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "coupon-1" }, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({ data: { id: "coupon-2" }, error: null }),
      );

    await expect(
      couponService.updateCoupon("coupon-1", { code: "SALE20" }),
    ).rejects.toEqual({ status: 400, message: "Coupon code already exists" });
  });
});
