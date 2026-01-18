import { get, post, put, del } from "../utils/request.js";

/**
 * Create a new product variant (Seller only)
 * @param {Object} data - Variant data
 * @param {string} data.productId - Product ID
 * @param {number} data.quantity - Stock quantity
 * @param {Object} data.variantAttributes - Variant attributes (e.g., { color: 'Red', size: 'L' })
 * @param {string[]} [data.images] - Array of image URLs
 * @param {number} [data.priceAdjustment=0] - Price adjustment from base price
 * @returns {Promise} Created variant object
 */
const createVariant = (data) => {
    return post('/variants', data);
};

/**
 * Get a specific variant by ID
 * @param {string} id - Variant ID
 * @returns {Promise} Variant object
 */
const getVariantById = (id) => {
    return get(`/variants/${id}`);
};

/**
 * Update a product variant (Seller only)
 * @param {string} id - Variant ID
 * @param {Object} data - Variant data to update
 * @param {number} [data.quantity] - Stock quantity
 * @param {Object} [data.variantAttributes] - Variant attributes
 * @param {string[]} [data.images] - Array of image URLs
 * @param {number} [data.priceAdjustment] - Price adjustment
 * @returns {Promise} Updated variant object
 */
const updateVariant = (id, data) => {
    return put(`/variants/${id}`, data);
};

/**
 * Delete a product variant (Seller only)
 * @param {string} id - Variant ID
 * @returns {Promise} Success message
 */
const deleteVariant = (id) => {
    return del(`/variants/${id}`);
};

/**
 * Get all variants for a product
 * @param {string} productId - Product ID
 * @returns {Promise} Array of variant objects
 */
const getVariantsByProduct = (productId) => {
    return get(`/variants/product/${productId}`);
};

const variantService = {
    createVariant,
    getVariantById,
    updateVariant,
    deleteVariant,
    getVariantsByProduct,
};

export default variantService;
