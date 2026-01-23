import {del, get, post, put} from "../utils/request.js";

/**
 * Get all coupons (Admin only)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.promotionId] - ID of promotion
 * @param {string} [params.search] - Search string
 * @returns {Promise} { coupons: [...], pagination: {...} }
 */
const getAllCoupons = (params = {}) => {
    const { page = 1, limit = 10, promotionId, search } = params;
    const searchParams = new URLSearchParams();

    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (promotionId) searchParams.append('promotionId', promotionId);
    if (search) searchParams.append('search', search);

    const queryString = searchParams.toString();
    return get(`/coupons?${queryString}`);
}

/**
 * Get a specific coupon by ID
 * @param {string} couponId - Coupon ID
 * @returns {Promise} Coupon object
 */
const getCouponById = (couponId) => {
    return get(`/coupons/${couponId}`);
}

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

/**
 * Delete a coupon (Admin only)
 * @param {string} id - Coupon ID
 * @returns {Promise} Success message
 */
const deleteCoupon = (id) => {
    return del(`/coupons/${id}`);
}

const couponService = {
    getAllCoupons,
    getCouponById,
    createCoupon,
    validateCoupon,
    getCouponsByPromotion,
    updateCoupon,
    deleteCoupon
};

export default couponService;
