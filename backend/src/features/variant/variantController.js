// backend/src/features/variant/variantController.js
const variantService = require("./variantService");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelpers");

const createVariant = async (req, res) => {
  try {
    const { productId, quantity, variantAttributes, images, priceAdjustment } =
      req.body;

    if (!productId || quantity === undefined || !variantAttributes) {
      return errorResponse(
        res,
        400,
        "Product ID, quantity and variant attributes are required"
      );
    }

    if (quantity < 0) {
      return errorResponse(res, 400, "Quantity must be a positive number");
    }

    if (priceAdjustment !== undefined && typeof priceAdjustment !== "number") {
      return errorResponse(res, 400, "Price adjustment must be a number");
    }

    const userId = req.user.userId;
    const result = await variantService.createVariant({
      productId,
      quantity,
      variantAttributes,
      images,
      priceAdjustment,
      userId,
    });

    successResponse(res, 201, result, "Product variant created successfully");
  } catch (error) {
    console.error("Create variant error:", error);
    errorResponse(res, 400, error.message || "Failed to create variant");
  }
};

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.userId;

    if (updates.quantity !== undefined && updates.quantity < 0) {
      return errorResponse(res, 400, "Quantity must be a positive number");
    }

    if (
      updates.priceAdjustment !== undefined &&
      typeof updates.priceAdjustment !== "number"
    ) {
      return errorResponse(res, 400, "Price adjustment must be a number");
    }

    const result = await variantService.updateVariant(id, updates, userId);
    successResponse(res, 200, result, "Product variant updated successfully");
  } catch (error) {
    console.error("Update variant error:", error);
    errorResponse(res, 400, error.message || "Failed to update variant");
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await variantService.deleteVariant(id, userId);
    successResponse(res, 200, null, "Product variant deleted successfully");
  } catch (error) {
    console.error("Delete variant error:", error);
    errorResponse(res, 400, error.message || "Failed to delete variant");
  }
};

module.exports = {
  createVariant,
  updateVariant,
  deleteVariant,
};
