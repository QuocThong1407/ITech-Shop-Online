// backend/src/features/product/productController.js - FIXED VERSION
const productService = require("./productService");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelpers");

const getAllProducts = async (req, res) => {
  try {
    const { page, limit, categoryId, search, minPrice, maxPrice, sellerId } =
      req.query;
    const result = await productService.getAllProducts({
      page,
      limit,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sellerId,
    });
    successResponse(res, 200, result);
  } catch (error) {
    console.error("Get all products error:", error);
    errorResponse(res, 500, error.message || "Failed to get products");
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    successResponse(res, 200, product);
  } catch (error) {
    console.error("Get product error:", error);
    errorResponse(res, 404, error.message || "Product not found");
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stockQuantity, categoryId, variants } =
      req.body;

    if (!name || !description || price === undefined || !categoryId) {
      return errorResponse(
        res,
        400,
        "Name, description, price, and category ID are required",
      );
    }

    if (price < 0) {
      return errorResponse(res, 400, "Price must be a positive number");
    }

    if (variants) {
      let parsedVariants;
      try {
        parsedVariants =
          typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (e) {
        return errorResponse(res, 400, "Invalid variants format");
      }

      if (!Array.isArray(parsedVariants)) {
        return errorResponse(res, 400, "Variants must be an array");
      }

      if (parsedVariants.length === 0) {
        return errorResponse(
          res,
          400,
          "Variants array cannot be empty. Either provide variants or remove the variants field.",
        );
      }

      for (const v of parsedVariants) {
        if (!v.variantAttributes || typeof v.variantAttributes !== "object") {
          return errorResponse(
            res,
            400,
            "Each variant must have variantAttributes object",
          );
        }

        if (Object.keys(v.variantAttributes).length === 0) {
          return errorResponse(res, 400, "Variant attributes cannot be empty");
        }

        if (v.quantity !== undefined && v.quantity < 0) {
          return errorResponse(res, 400, "Variant quantity must be positive");
        }
      }

      const seen = new Set();
      for (const v of parsedVariants) {
        const key = JSON.stringify(v.variantAttributes);
        if (seen.has(key)) {
          return errorResponse(res, 400, `Duplicate variant found: ${key}`);
        }
        seen.add(key);
      }
    } else {
      if (stockQuantity === undefined || stockQuantity < 0) {
        return errorResponse(
          res,
          400,
          "Stock quantity is required for products without variants",
        );
      }
    }

    const result = await productService.createProduct({
      ...req.body,
      createdBy: req.user.userId,
      files: req.files,
    });

    successResponse(res, 201, result, "Product created successfully");
  } catch (error) {
    console.error("Create product error:", error);
    errorResponse(res, 400, error.message || "Failed to create product");
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.userId;

    if (updates.variantTypes || updates.variantOptions) {
      return errorResponse(
        res,
        400,
        "variantTypes and variantOptions are auto-managed. Use variant endpoints to modify variants.",
      );
    }

    if (updates.price !== undefined && updates.price < 0) {
      return errorResponse(res, 400, "Price must be a positive number");
    }

    if (updates.stockQuantity !== undefined && updates.stockQuantity < 0) {
      return errorResponse(
        res,
        400,
        "Stock quantity must be a positive number",
      );
    }

    const result = await productService.updateProduct(
      id,
      updates,
      userId,
      req.files,
    );
    successResponse(res, 200, result, "Product updated successfully");
  } catch (error) {
    console.error("Update product error:", error);
    errorResponse(res, 400, error.message || "Failed to update product");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await productService.deleteProduct(id, userId);
    successResponse(res, 200, null, "Product deleted successfully");
  } catch (error) {
    console.error("Delete product error:", error);
    errorResponse(res, 400, error.message || "Failed to delete product");
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
