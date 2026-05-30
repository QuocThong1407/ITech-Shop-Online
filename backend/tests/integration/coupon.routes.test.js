jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      const path = req.path || "";
      const isValidateRoute = path.includes("/validate");
      req.user = {
        userId: "admin-user-id",
        role: isValidateRoute ? "CUSTOMER" : "ADMIN",
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

jest.mock("../../src/features/coupon/couponService", () => ({
  createCoupon: jest.fn(),
  validateCoupon: jest.fn(),
  updateCoupon: jest.fn(),
  getCouponsByPromotion: jest.fn(),
  getCouponById: jest.fn(),
  deleteCoupon: jest.fn(),
  getAllCoupons: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const couponService = require("../../src/features/coupon/couponService");

describe("Coupon routes", () => {
  test("GET /api/coupons/:id returns coupon detail", async () => {
    couponService.getCouponById.mockResolvedValue({
      id: "coupon-1",
      code: "SALE10",
    });

    const res = await request(app).get("/api/coupons/coupon-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(couponService.getCouponById).toHaveBeenCalledWith("coupon-1");
  });

  test("GET /api/coupons returns list", async () => {
    couponService.getAllCoupons.mockResolvedValue({
      coupons: [{ id: "coupon-1" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const res = await request(app).get("/api/coupons");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(couponService.getAllCoupons).toHaveBeenCalled();
  });

  test("POST /api/coupons/validate rejects missing fields", async () => {
    const res = await request(app).post("/api/coupons/validate").send({
      code: "",
      orderAmount: 0,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Code and order amount are required");
    expect(couponService.validateCoupon).not.toHaveBeenCalled();
  });

  test("POST /api/coupons/validate validates coupon", async () => {
    couponService.validateCoupon.mockResolvedValue({
      valid: true,
      coupon: {
        id: "coupon-1",
        code: "SALE10",
        discountPercentage: 10,
        promotionName: "Summer Sale",
      },
      calculation: {
        originalAmount: 100000,
        discountPercentage: 10,
        discountAmount: 10000,
        finalAmount: 90000,
      },
      remainingUsage: 9,
    });

    const res = await request(app).post("/api/coupons/validate").send({
      code: "sale10",
      orderAmount: 100000,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(couponService.validateCoupon).toHaveBeenCalledWith(
      "sale10",
      100000,
    );
  });

  test("POST /api/coupons creates coupon", async () => {
    couponService.createCoupon.mockResolvedValue({
      id: "coupon-1",
      code: "SALE10",
    });

    const res = await request(app).post("/api/coupons").send({
      promotionId: "promo-1",
      code: "sale10",
      discountPercentage: 10,
      maxUsage: 10,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(couponService.createCoupon).toHaveBeenCalledWith({
      promotionId: "promo-1",
      code: "sale10",
      discountPercentage: 10,
      maxUsage: 10,
    });
  });

  test("PUT /api/coupons/:id rejects invalid maxUsage", async () => {
    const res = await request(app).put("/api/coupons/coupon-1").send({
      maxUsage: -1,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Max usage must be at least 1");
    expect(couponService.updateCoupon).not.toHaveBeenCalled();
  });

  test("PUT /api/coupons/:id updates coupon", async () => {
    couponService.updateCoupon.mockResolvedValue({
      id: "coupon-1",
      code: "SALE15",
    });

    const res = await request(app).put("/api/coupons/coupon-1").send({
      code: "sale15",
      maxUsage: 20,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(couponService.updateCoupon).toHaveBeenCalledWith("coupon-1", {
      code: "sale15",
      maxUsage: 20,
    });
  });

  test("GET /api/coupons/promotion/:id returns promotion coupons", async () => {
    couponService.getCouponsByPromotion.mockResolvedValue({
      promotion: { id: "promo-1", name: "Summer Sale" },
      coupons: [],
      totalCoupons: 0,
    });

    const res = await request(app).get("/api/coupons/promotion/promo-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(couponService.getCouponsByPromotion).toHaveBeenCalledWith("promo-1");
  });

  test("DELETE /api/coupons/:id deletes coupon", async () => {
    couponService.deleteCoupon.mockResolvedValue(true);

    const res = await request(app).delete("/api/coupons/coupon-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(couponService.deleteCoupon).toHaveBeenCalledWith("coupon-1");
  });
});
