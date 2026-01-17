import { get, post, put, del, patch } from "../utils/request.js";

/**
 * Get all promotions with optional filters
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (ACTIVE/INACTIVE/EXPIRED)
 * @param {string} [params.search] - Search string
 * @returns {Promise} { promotions: [...], pagination: {...} }
 */
const getAllPromotions = (params = {}) => {
    const { page = 1, limit = 10, status, search } = params;
    const searchParams = new URLSearchParams();

    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
    if (search) searchParams.append('search', search);

    const queryString = searchParams.toString();
    return get(`/promotions?${queryString}`);
};

/**
 * Get a specific promotion by ID
 * @param {string} id - Promotion ID
 * @returns {Promise} Promotion object with related products/categories
 */
const getPromotionById = (id) => {
    return get(`/promotions/${id}`);
};

/**
 * Create a new promotion (Admin only)
 * @param {Object} data - Promotion data
 * @param {string} data.name - Promotion name
 * @param {string} data.description - Promotion description
 * @param {string} data.startDate - Start date (ISO timestamp)
 * @param {string} data.endDate - End date (ISO timestamp, must be after startDate)
 * @returns {Promise} Created promotion object
 */
const createPromotion = (data) => {
    return post('/promotions', data);
};

/**
 * Update an existing promotion (Admin only)
 * @param {string} id - Promotion ID
 * @param {Object} data - Promotion data to update
 * @returns {Promise} Updated promotion object
 */
const updatePromotion = (id, data) => {
    return put(`/promotions/${id}`, data);
};

/**
 * Update promotion status (Admin only)
 * @param {string} id - Promotion ID
 * @param {string} status - New status (ACTIVE/INACTIVE/EXPIRED)
 * @returns {Promise} Updated promotion object
 */
const updatePromotionStatus = (id, status) => {
    return patch(`/promotions/${id}/status`, { status });
};

/**
 * Delete a promotion (Admin only)
 * @param {string} id - Promotion ID
 * @returns {Promise} Success message
 */
const deletePromotion = (id) => {
    return del(`/promotions/${id}`);
};

/**
 * Apply promotion to specific products (Admin only)
 * @param {string} id - Promotion ID
 * @param {string[]} productIds - Array of product IDs
 * @returns {Promise} Success message
 */
const applyToProducts = (id, productIds) => {
    return post(`/promotions/${id}/apply`, { productIds });
};

/**
 * Apply promotion to specific categories (Admin only)
 * @param {string} id - Promotion ID
 * @param {string[]} categoryIds - Array of category IDs
 * @returns {Promise} Success message
 */
const applyToCategories = (id, categoryIds) => {
    return post(`/promotions/${id}/apply-categories`, { categoryIds });
};

const promotionService = {
    getAllPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    updatePromotionStatus,
    deletePromotion,
    applyToProducts,
    applyToCategories,
};

export default promotionService;
