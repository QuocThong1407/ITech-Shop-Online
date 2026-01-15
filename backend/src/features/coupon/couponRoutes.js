// backend/src/features/coupon/couponRoutes.js
const express = require("express");
const router = express.Router();
const couponController = require("./couponController");
const { authenticate, checkRole } = require("../../middleware/index");

// Customer route - validate coupon
router.post("/validate", authenticate, couponController.validateCoupon); // POST /api/coupons/validate

// Admin routes
router.post(
  "/",
  authenticate,
  checkRole("ADMIN"),
  couponController.createCoupon
); // POST /api/coupons

router.get(
  "/promotion/:id",
  authenticate,
  checkRole("ADMIN"),
  couponController.getCouponsByPromotion
); // GET /api/coupons/promotion/:id

router.put(
  "/:id",
  authenticate,
  checkRole("ADMIN"),
  couponController.updateCoupon
); // PUT /api/coupons/:id

module.exports = router;
