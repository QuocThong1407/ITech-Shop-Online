const { createChain } = require("./testHelpers");

const mockSupabase = { from: jest.fn() };

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("../../src/utils/uploadHelper", () => ({
  uploadImageToSupabase: jest.fn(),
  deleteImageFromSupabase: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-product"),
}));

jest.mock("../../src/features/product/productService", () => {
  const actual = jest.requireActual("../../src/features/product/productService");
  return {
    ...actual,
    syncVariantMetadata: jest.fn(),
  };
});

const productService = require("../../src/features/product/productService");

describe("productService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getProductById throws 404 when product missing", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({ data: null, error: { status: 404, message: "not found" } }),
    );

    await expect(productService.getProductById("product-1")).rejects.toBeTruthy();
  });

  test("deleteProduct rejects non-admin user", async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === "Admin") return createChain({ data: null, error: null });
      return createChain({ data: null, error: null });
    });

    await expect(productService.deleteProduct("product-1", "user-1")).rejects.toEqual(
      { status: 403, message: "Only admins can delete products" },
    );
  });

  test("updateProductStock rejects products with variants", async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === "Seller") return createChain({ data: { id: "seller-1" }, error: null });
      if (table === "Product") {
        return createChain({
          data: {
            id: "product-1",
            createdBy: "seller-1",
            variantTypes: ["COLOR"],
          },
          error: null,
        });
      }
      return createChain({ data: null, error: null });
    });

    await expect(
      productService.updateProductStock("product-1", 10, "user-1"),
    ).rejects.toEqual({
      status: 400,
      message: "This product has variants. Please update variant quantities instead.",
    });
  });
});
