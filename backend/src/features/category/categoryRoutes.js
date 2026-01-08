// backend/src/features/category/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("./categoryController");
const { authenticate, checkRole } = require("../../middleware/index");

// public
router.get("/", categoryController.getAllCategories); // GET /api/categories
router.get("/stats", categoryController.getCategoryStats); // GET /api/categories/stats
router.get("/:id", categoryController.getCategoryById); // GET /api/categories/:id

// admin only
router.use(authenticate, checkRole("ADMIN"));

router.post("/", categoryController.createCategory); // POST /api/categories
router.put("/:id", categoryController.updateCategory); // PUT /api/categories/:id
router.delete("/:id", categoryController.deleteCategory); // DELETE /api/categories/:id

module.exports = router;
