const { createChain } = require("./testHelpers");

const mockSupabase = {
  from: jest.fn(),
};

jest.mock("../../src/configs/supabase", () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase,
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-review"),
}));

const mockUploadImageToSupabase = jest.fn();
const mockDeleteImageFromSupabase = jest.fn(async () => true);

jest.mock("../../src/utils/uploadHelper", () => ({
  uploadImageToSupabase: mockUploadImageToSupabase,
  deleteImageFromSupabase: mockDeleteImageFromSupabase,
}));

const reviewService = require("../../src/features/review/reviewService");

describe("reviewService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllReviews returns empty page when product has no order items", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({ data: [], error: null }),
    );

    const result = await reviewService.getAllReviews({
      productId: "product-1",
      page: 1,
      limit: 10,
    });

    expect(result.reviews).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  test("createReview rejects review when order belongs to another customer", async () => {
    mockSupabase.from.mockReturnValue(
      createChain({
        data: {
          id: "item-1",
          order: {
            customerId: "customer-2",
            status: "DELIVERED",
          },
        },
        error: null,
      }),
    );

    await expect(
      reviewService.createReview({
        orderItemId: "item-1",
        rating: 5,
        comment: "Great",
        files: [],
        customerId: "customer-1",
      }),
    ).rejects.toEqual({
      status: 403,
      message: "You can only review your own orders",
    });
  });

  test("createReview saves review and uploads images", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({
          data: {
            id: "item-1",
            order: {
              customerId: "customer-1",
              status: "DELIVERED",
            },
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
            id: "review-1",
            orderItemId: "item-1",
            customerId: "customer-1",
            rating: 5,
            comment: "Great",
            images: ["https://img/1.png"],
          },
          error: null,
        }),
      );

    mockUploadImageToSupabase.mockResolvedValue("https://img/1.png");

    const result = await reviewService.createReview({
      orderItemId: "item-1",
      rating: 5,
      comment: "Great",
      files: [{ originalname: "a.png" }],
      customerId: "customer-1",
    });

    expect(result.id).toBe("review-1");
    expect(mockUploadImageToSupabase).toHaveBeenCalled();
  });

  test("adminDeleteReview removes review and deletes stored images", async () => {
    mockSupabase.from
      .mockImplementationOnce(() =>
        createChain({
          data: { id: "review-1", images: ["https://img/1.png"] },
          error: null,
        }),
      )
      .mockImplementationOnce(() =>
        createChain({ data: null, error: null }),
      );

    await expect(reviewService.adminDeleteReview("review-1")).resolves.toBe(true);
    expect(mockDeleteImageFromSupabase).toHaveBeenCalledWith(
      "https://img/1.png",
      "reviews",
    );
  });
});
