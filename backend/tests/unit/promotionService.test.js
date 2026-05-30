const { createChain } = require("./testHelpers");

const mockSupabase = {
  from: jest.fn(),
};

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-promotion"),
}));

const mockUploadImageToSupabase = jest.fn();
const mockDeleteImageFromSupabase = jest.fn();

jest.mock("../../src/utils/uploadHelper", () => ({
  uploadImageToSupabase: mockUploadImageToSupabase,
  deleteImageFromSupabase: mockDeleteImageFromSupabase,
}));

const promotionService = require("../../src/features/promotion/promotionService");

describe("promotionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createPromotion stores ACTIVE promotion when date range includes now", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "admin-1" }, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "promo-1",
            name: "Summer Sale",
            status: "ACTIVE",
          },
          error: null,
        }),
      );

    const result = await promotionService.createPromotion({
      name: "Summer Sale",
      description: "Hot deals",
      startDate: new Date(Date.now() - 60_000).toISOString(),
      endDate: new Date(Date.now() + 60_000).toISOString(),
      createdBy: "user-1",
      file: null,
    });

    expect(result.status).toBe("ACTIVE");
    expect(mockSupabase.from).toHaveBeenCalledWith("Admin");
    expect(mockSupabase.from).toHaveBeenCalledWith("Promotion");
  });

  test("updatePromotionStatus rejects manual EXPIRED status when auto status differs", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "promo-1",
          startDate: new Date(Date.now() + 86_400_000).toISOString(),
          endDate: new Date(Date.now() + 172_800_000).toISOString(),
          status: "UPCOMING",
        },
        error: null,
      }),
    );

    await expect(
      promotionService.updatePromotionStatus("promo-1", "EXPIRED"),
    ).rejects.toEqual({
      status: 400,
      message:
        "Cannot manually set status to EXPIRED. This status is auto-determined by dates.",
    });
  });

  test("applyPromotionToProducts rejects when a product is missing", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({ data: { id: "promo-1" }, error: null }),
      )
      .mockImplementationOnce(() =>
        createChain({ data: [{ id: "p1" }], error: null }),
      );

    await expect(
      promotionService.applyPromotionToProducts("promo-1", ["p1", "p2"]),
    ).rejects.toEqual({
      status: 400,
      message: "One or more products not found",
    });
  });

  test("getPromotionStats counts upcoming active inactive and expired promotions", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: [
          {
            status: "INACTIVE",
            startDate: new Date(Date.now() - 86_400_000).toISOString(),
            endDate: new Date(Date.now() + 86_400_000).toISOString(),
          },
          {
            status: "ACTIVE",
            startDate: new Date(Date.now() - 60_000).toISOString(),
            endDate: new Date(Date.now() + 60_000).toISOString(),
          },
          {
            status: "ACTIVE",
            startDate: new Date(Date.now() + 86_400_000).toISOString(),
            endDate: new Date(Date.now() + 172_800_000).toISOString(),
          },
          {
            status: "ACTIVE",
            startDate: new Date(Date.now() - 172_800_000).toISOString(),
            endDate: new Date(Date.now() - 86_400_000).toISOString(),
          },
        ],
        error: null,
      }),
    );

    const stats = await promotionService.getPromotionStats();

    expect(stats.total).toBe(4);
    expect(stats.inactive).toBe(1);
    expect(stats.active).toBe(1);
    expect(stats.upcoming).toBe(1);
    expect(stats.expired).toBe(1);
  });
});
