// backend/src/features/variant/variantRoutes.js
const express = require("express");
const router = express.Router();
const variantController = require("./variantController");
const { authenticate, checkRole } = require("../../middleware/index");

router.use(authenticate, checkRole("SELLER"));

router.get("/product/:productId", variantController.getVariantsByProductId); // GET /api/variants/product/:productId
router.post("/", variantController.createVariant); // POST /api/variants
router.put("/:id", variantController.updateVariant); // PUT /api/variants/:id
router.delete("/:id", variantController.deleteVariant); // DELETE /api/variants/:id

module.exports = router;
