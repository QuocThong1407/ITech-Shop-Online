// backend/src/features/product/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("./productController");
const { authenticate, checkRole } = require("../../middleware/index");

// public
router.get("/", productController.getAllProducts); // GET /api/products
router.get("/:id", productController.getProductById); // GET /api/products/:id

// seller only
router.use(authenticate, checkRole("SELLER"));

router.post("/", productController.createProduct); // POST /api/products
router.put("/:id", productController.updateProduct); // PUT /api/products/:id
router.delete("/:id", productController.deleteProduct); // DELETE /api/products/:id

module.exports = router;
