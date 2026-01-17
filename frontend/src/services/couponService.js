import { get, post, put } from "../utils/request.js";

/**
 * Create a new coupon (Admin only)
 * @param {Object} data - Coupon data
 * @param {string} data.promotionId - Associated promotion ID
 * @param {string} data.code - Coupon code
 * @param {number} data.discountPercentage - Discount percentage (0-100)
 * @param {number} data.maxUsage - Maximum usage count (>= 1)
 * @returns {Promise} Created coupon object
 */
const createCoupon = (data) => {
    return post('/coupons', data);
};

/**
 * Validate a coupon code
 * @param {string} code - Coupon code to validate
 * @param {number} orderAmount - Order amount to calculate discount
 * @returns {Promise} { valid: true/false, discount: number, finalAmount: number }
 */
const validateCoupon = (code, orderAmount) => {
    return post('/coupons/validate', { code, orderAmount });
};

/**
 * Get coupons by promotion ID (Admin only)
 * @param {string} promotionId - Promotion ID
 * @returns {Promise} Array of coupon objects
 */
const getCouponsByPromotion = (promotionId) => {
    return get(`/coupons/promotion/${promotionId}`);
};

/**
 * Update a coupon (Admin only)
 * @param {string} id - Coupon ID
 * @param {Object} data - Coupon data to update
 * @param {string} [data.code] - Coupon code
 * @param {number} [data.discountPercentage] - Discount percentage (0-100)
 * @param {number} [data.maxUsage] - Maximum usage count (>= 1)
 * @returns {Promise} Updated coupon object
 */
const updateCoupon = (id, data) => {
    return put(`/coupons/${id}`, data);
};

const couponService = {
    createCoupon,
    validateCoupon,
    getCouponsByPromotion,
    updateCoupon,
};

export default couponService;
