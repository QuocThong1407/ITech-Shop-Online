jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      const path = req.path || "";
      const isAdminDelete = path.includes("/admin/");
      req.user = {
        userId: "customer-user-id",
        customerId: "customer-1",
        role: isAdminDelete ? "ADMIN" : "CUSTOMER",
      };
      next();
    },
    checkRole:
      (...allowedRoles) =>
      (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource",
          });
        }

        next();
      },
    upload: {
      array: () => (req, res, next) => {
        req.files = [];
        next();
      },
      single: () => (req, res, next) => {
        req.file = null;
        next();
      },
      any: () => (req, res, next) => {
        req.files = [];
        next();
      },
    },
  };
});

jest.mock("../../src/features/review/reviewService", () => ({
  getAllReviews: jest.fn(),
  getReviewById: jest.fn(),
  getReviewsByProduct: jest.fn(),
  getReviewsByVariant: jest.fn(),
  createReview: jest.fn(),
  updateReview: jest.fn(),
  adminDeleteReview: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const reviewService = require("../../src/features/review/reviewService");

describe("Review routes", () => {
  test("GET /api/reviews returns review list", async () => {
    reviewService.getAllReviews.mockResolvedValue({
      reviews: [{ id: "review-1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app).get("/api/reviews");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(reviewService.getAllReviews).toHaveBeenCalled();
  });

  test("GET /api/reviews/product/:productId returns product reviews", async () => {
    reviewService.getReviewsByProduct.mockResolvedValue({
      reviews: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });

    const res = await request(app).get("/api/reviews/product/product-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(reviewService.getReviewsByProduct).toHaveBeenCalledWith(
      "product-1",
      {
        page: undefined,
        limit: undefined,
        rating: undefined,
      },
    );
  });

  test("GET /api/reviews/:id returns review detail", async () => {
    reviewService.getReviewById.mockResolvedValue({
      id: "review-1",
      rating: 5,
    });

    const res = await request(app).get("/api/reviews/review-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(reviewService.getReviewById).toHaveBeenCalledWith("review-1");
  });

  test("POST /api/reviews rejects invalid rating", async () => {
    const res = await request(app).post("/api/reviews").send({
      orderItemId: "item-1",
      rating: 6,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Rating must be between 1 and 5");
    expect(reviewService.createReview).not.toHaveBeenCalled();
  });

  test("POST /api/reviews creates review", async () => {
    reviewService.createReview.mockResolvedValue({
      id: "review-1",
      rating: 5,
    });

    const res = await request(app).post("/api/reviews").send({
      orderItemId: "item-1",
      rating: 5,
      comment: "Great",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(reviewService.createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        orderItemId: "item-1",
        rating: 5,
        comment: "Great",
        customerId: "customer-1",
        files: [],
      }),
    );
  });

  test("PUT /api/reviews/:id rejects invalid rating", async () => {
    const res = await request(app).put("/api/reviews/review-1").send({
      rating: 10,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Rating must be between 1 and 5");
    expect(reviewService.updateReview).not.toHaveBeenCalled();
  });

  test("PUT /api/reviews/:id updates review", async () => {
    reviewService.updateReview.mockResolvedValue({
      id: "review-1",
      rating: 4,
    });

    const res = await request(app).put("/api/reviews/review-1").send({
      rating: 4,
      comment: "Updated",
      existingImages: [],
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(reviewService.updateReview).toHaveBeenCalledWith(
      "review-1",
      "customer-1",
      expect.objectContaining({
        rating: 4,
        comment: "Updated",
        files: [],
        existingImages: [],
      }),
    );
  });

  test("DELETE /api/reviews/admin/:id deletes review", async () => {
    reviewService.adminDeleteReview.mockResolvedValue(true);

    const res = await request(app).delete("/api/reviews/admin/review-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(reviewService.adminDeleteReview).toHaveBeenCalledWith("review-1");
  });
});
