const { createChain } = require("./testHelpers");

const mockSupabase = { from: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-variant"),
}));

const mockSyncVariantMetadata = jest.fn();

jest.mock("../../src/features/product/productService", () => ({
  syncVariantMetadata: mockSyncVariantMetadata,
}));

jest.mock("../../src/utils/uploadHelper", () => ({
  uploadImageToSupabase: jest.fn(async () => "https://img.example/v.png"),
  deleteImageFromSupabase: jest.fn(async () => true),
}));

const variantService = require("../../src/features/variant/variantService");

describe("variantService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createVariant rejects when seller does not own the product", async () => {
    mockSupabase.from
      .mockReturnValueOnce(createChain({ data: { id: "seller-1" }, error: null }))
      .mockReturnValueOnce(createChain({ data: null, error: null }))
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "product-1",
            createdBy: "seller-2",
            is_deleted: false,
            name: "Laptop",
          },
          error: null,
        }),
      );

    await expect(
      variantService.createVariant({
        productId: "product-1",
        quantity: 1,
        variantAttributes: { color: "black" },
        files: [],
        priceAdjustment: 0,
        userId: "user-1",
      }),
    ).rejects.toEqual({
      status: 403,
      message: "You do not have permission to perform this action",
    });
  });

  test("createVariant stores new variant and syncs metadata", async () => {
    mockSupabase.from
      .mockReturnValueOnce(createChain({ data: { id: "seller-1" }, error: null }))
      .mockReturnValueOnce(createChain({ data: null, error: null }))
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "product-1",
            createdBy: "seller-1",
            is_deleted: false,
            name: "Laptop",
          },
          error: null,
        }),
      )
      .mockReturnValueOnce(createChain({ data: [], error: null }))
      .mockReturnValueOnce(
        createChain({
          data: {
            id: "variant-1",
            productId: "product-1",
            quantity: 2,
            variantAttributes: { color: "black" },
            images: [],
            priceAdjustment: 5000,
          },
          error: null,
        }),
      );

    const result = await variantService.createVariant({
      productId: "product-1",
      quantity: 2,
      variantAttributes: { color: "black" },
      files: [],
      priceAdjustment: 5000,
      userId: "user-1",
    });

    expect(result.id).toBe("variant-1");
    expect(mockSyncVariantMetadata).toHaveBeenCalledWith("product-1");
  });

  test("updateVariant rejects deleted product", async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === "ProductVariant") {
        return createChain({
          data: {
            id: "variant-1",
            productId: "product-1",
            images: [],
            variantAttributes: { color: "black" },
            Product: {
              id: "product-1",
              createdBy: "seller-1",
              is_deleted: true,
            },
          },
          error: null,
        });
      }
      if (table === "Seller") return createChain({ data: { id: "seller-1" }, error: null });
      if (table === "Admin") return createChain({ data: null, error: null });
      return createChain({ data: null, error: null });
    });

    await expect(
      variantService.updateVariant("variant-1", { quantity: 2 }, "user-1"),
    ).rejects.toEqual({
      status: 400,
      message: "Cannot update variant of deleted product",
    });
  });

  test("getVariantsByProductId returns array", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: [{ id: "variant-1" }, { id: "variant-2" }],
        error: null,
      }),
    );

    const result = await variantService.getVariantsByProductId("product-1");

    expect(result).toHaveLength(2);
  });
});
