jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      req.user = {
        userId: "admin-user-id",
        role: "ADMIN",
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
      single: () => (req, res, next) => {
        req.file = null;
        next();
      },
      any: () => (req, res, next) => {
        req.files = [];
        next();
      },
      array: () => (req, res, next) => {
        req.files = [];
        next();
      },
    },
  };
});

jest.mock("../../src/features/promotion/promotionService", () => ({
  getAllPromotions: jest.fn(),
  getPromotionById: jest.fn(),
  createPromotion: jest.fn(),
  updatePromotion: jest.fn(),
  updatePromotionStatus: jest.fn(),
  deletePromotion: jest.fn(),
  applyPromotionToProducts: jest.fn(),
  applyPromotionToCategories: jest.fn(),
  getPromotionStats: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const promotionService = require("../../src/features/promotion/promotionService");

describe("Promotion routes", () => {
  test("GET /api/promotions returns list", async () => {
    promotionService.getAllPromotions.mockResolvedValue({
      promotions: [{ id: "promo-1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app).get("/api/promotions");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(promotionService.getAllPromotions).toHaveBeenCalled();
  });

  test("GET /api/promotions/stats returns stats", async () => {
    promotionService.getPromotionStats.mockResolvedValue({
      total: 1,
      upcoming: 0,
      active: 1,
      inactive: 0,
      expired: 0,
    });

    const res = await request(app).get("/api/promotions/stats");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(promotionService.getPromotionStats).toHaveBeenCalled();
  });

  test("POST /api/promotions rejects invalid date range", async () => {
    const res = await request(app).post("/api/promotions").send({
      name: "Summer Sale",
      startDate: "2026-02-01",
      endDate: "2026-01-01",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("End date must be after start date");
    expect(promotionService.createPromotion).not.toHaveBeenCalled();
  });

  test("POST /api/promotions creates promotion", async () => {
    promotionService.createPromotion.mockResolvedValue({
      id: "promo-1",
      name: "Summer Sale",
    });

    const res = await request(app).post("/api/promotions").send({
      name: "Summer Sale",
      description: "Hot deals",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(promotionService.createPromotion).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Summer Sale",
        createdBy: "admin-user-id",
      }),
    );
  });

  test("PATCH /api/promotions/:id/status rejects invalid status", async () => {
    const res = await request(app)
      .patch("/api/promotions/promo-1/status")
      .send({ status: "ARCHIVED" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid status");
    expect(promotionService.updatePromotionStatus).not.toHaveBeenCalled();
  });

  test("PATCH /api/promotions/:id/status updates status", async () => {
    promotionService.updatePromotionStatus.mockResolvedValue({
      id: "promo-1",
      status: "ACTIVE",
    });

    const res = await request(app)
      .patch("/api/promotions/promo-1/status")
      .send({ status: "ACTIVE" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(promotionService.updatePromotionStatus).toHaveBeenCalledWith(
      "promo-1",
      "ACTIVE",
    );
  });

  test("POST /api/promotions/:id/apply rejects empty productIds", async () => {
    const res = await request(app)
      .post("/api/promotions/promo-1/apply")
      .send({ productIds: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Product IDs array is required");
    expect(promotionService.applyPromotionToProducts).not.toHaveBeenCalled();
  });

  test("POST /api/promotions/:id/apply applies promotion to products", async () => {
    promotionService.applyPromotionToProducts.mockResolvedValue({
      promotionId: "promo-1",
      appliedProductsCount: 2,
    });

    const res = await request(app)
      .post("/api/promotions/promo-1/apply")
      .send({ productIds: ["p1", "p2"] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(promotionService.applyPromotionToProducts).toHaveBeenCalledWith(
      "promo-1",
      ["p1", "p2"],
    );
  });

  test("DELETE /api/promotions/:id deletes promotion", async () => {
    promotionService.deletePromotion.mockResolvedValue(true);

    const res = await request(app).delete("/api/promotions/promo-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(promotionService.deletePromotion).toHaveBeenCalledWith("promo-1");
  });
});
