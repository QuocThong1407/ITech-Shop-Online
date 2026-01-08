// backend/src/features/address/addressRoutes.js
const express = require("express");
const router = express.Router();
const addressController = require("./addressController");
const { authenticate, checkRole } = require("../../middleware/index");

// customer routes (cần authenticate)
router.use(authenticate);

router.get("/", addressController.getMyAddresses); // GET /api/addresses
router.get("/:id", addressController.getAddressById); // GET /api/addresses/:id
router.post("/", addressController.createAddress); // POST /api/addresses
router.put("/:id", addressController.updateAddress); // PUT /api/addresses/:id
router.delete("/:id", addressController.deleteAddress); // DELETE /api/addresses/:id

// admin routes (cần ADMIN role)
router.get("/admin/all", checkRole("ADMIN"), addressController.getAllAddresses); // GET /api/addresses/admin/all
router.get(
  "/admin/stats",
  checkRole("ADMIN"),
  addressController.getAddressStats
); // GET /api/addresses/admin/stats

module.exports = router;
