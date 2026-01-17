// backend/src/features/product/productController.js
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
    const {
      name,
      description,
      price,
      stockQuantity,
      categoryId,
      variantTypes,
      variantOptions,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      stockQuantity === undefined ||
      !categoryId
    ) {
      return errorResponse(
        res,
        400,
        "Name, description, price, stock quantity and category ID are required"
      );
    }

    if (price < 0) {
      return errorResponse(res, 400, "Price must be a positive number");
    }

    if (stockQuantity < 0) {
      return errorResponse(
        res,
        400,
        "Stock quantity must be a positive number"
      );
    }

    const createdBy = req.user.userId;
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

    if (updates.price !== undefined && updates.price < 0) {
      return errorResponse(res, 400, "Price must be a positive number");
    }

    if (updates.stockQuantity !== undefined && updates.stockQuantity < 0) {
      return errorResponse(
        res,
        400,
        "Stock quantity must be a positive number"
      );
    }

    const result = await productService.updateProduct(
      id,
      updates,
      userId,
      req.files
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
