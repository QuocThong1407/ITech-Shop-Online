jest.mock("../../src/middleware/index", () => {
  const actual = jest.requireActual("../../src/middleware/index");

  return {
    ...actual,
    authenticate: (req, res, next) => {
      const isStockRoute = req.path && req.path.includes("/stock");
      req.user = {
        userId: "admin-user-id",
        role: isStockRoute ? "SELLER" : "ADMIN",
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
      any: () => (req, res, next) => {
        req.files = [];
        next();
      },
      single: () => (req, res, next) => {
        req.file = null;
        next();
      },
      array: () => (req, res, next) => {
        req.files = [];
        next();
      },
    },
  };
});

jest.mock("../../src/features/product/productService", () => ({
  getAllProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  updateProductStock: jest.fn(),
  syncVariantMetadata: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const productService = require("../../src/features/product/productService");

describe("Product routes", () => {
  test("GET /api/products returns the service payload", async () => {
    productService.getAllProducts.mockResolvedValue({
      products: [
        {
          id: "product-1",
          name: "Laptop",
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toHaveLength(1);
    expect(productService.getAllProducts).toHaveBeenCalled();
  });

  test("POST /api/products rejects duplicate variant definitions", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Gaming Laptop",
      description: "High performance",
      price: 25000000,
      categoryId: "category-1",
      sellerUserId: "seller-1",
      variants: [
        {
          variantAttributes: { color: "black", size: "15-inch" },
          quantity: 5,
        },
        {
          variantAttributes: { color: "black", size: "15-inch" },
          quantity: 3,
        },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Duplicate variant found/);
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  test("POST /api/products creates a product when payload is valid", async () => {
    productService.createProduct.mockResolvedValue({
      id: "product-1",
      name: "Gaming Laptop",
    });

    const res = await request(app).post("/api/products").send({
      name: "Gaming Laptop",
      description: "High performance",
      price: 25000000,
      stockQuantity: 10,
      categoryId: "category-1",
      sellerUserId: "seller-1",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      id: "product-1",
      name: "Gaming Laptop",
    });
    expect(productService.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Gaming Laptop",
        description: "High performance",
        price: 25000000,
        stockQuantity: 10,
        categoryId: "category-1",
        sellerUserId: "seller-1",
        createdBy: "admin-user-id",
        files: [],
      }),
    );
  });

  test("PATCH /api/products/:id/stock rejects negative quantities", async () => {
    const res = await request(app)
      .patch("/api/products/product-1/stock")
      .send({ stockQuantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Stock quantity must be a positive number");
    expect(productService.updateProductStock).not.toHaveBeenCalled();
  });

  test("DELETE /api/products/:id returns success when service resolves", async () => {
    productService.deleteProduct.mockResolvedValue(true);

    const res = await request(app).delete("/api/products/product-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product deleted successfully");
    expect(productService.deleteProduct).toHaveBeenCalledWith(
      "product-1",
      "admin-user-id",
    );
  });
});
