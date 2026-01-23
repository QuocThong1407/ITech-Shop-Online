import { get, post, put, del } from "../utils/request.js";

/**
 * Get all reviews with optional filters
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {number} [params.rating] - Filter by rating
 * @param {string} [params.productId] - Filter by product ID
 * @returns {Promise} { reviews: [...], pagination: {...} }
 */
const getAllReviews = (params = {}) => {
    const { page = 1, limit = 10, rating, productId } = params;
    let query = `?page=${page}&limit=${limit}`;
    if (rating) query += `&rating=${rating}`;
    if (productId) query += `&productId=${productId}`;
    return get(`/reviews${query}`);
};

/**
 * Get a specific review by ID
 * @param {string} id - Review ID
 * @returns {Promise} Review object
 */
const getReviewById = (id) => {
    return get(`/reviews/${id}`);
};

/**
 * Get all reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {number} [params.rating] - Filter by rating
 * @returns {Promise} { reviews: [...], pagination: {...} }
 */
const getProductReviews = (productId, params = {}) => {
    const { page = 1, limit = 10, rating } = params;
    let query = `?page=${page}&limit=${limit}`;
    if (rating) query += `&rating=${rating}`;
    return get(`/reviews/product/${productId}${query}`);
};

/**
 * Get all reviews for a variant
 * @param {string} variantId - Variant ID
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {number} [params.rating] - Filter by rating
 * @returns {Promise} { reviews: [...], pagination: {...} }
 */
const getVariantReviews = (variantId, params = {}) => {
    const { page = 1, limit = 10, rating } = params;
    let query = `?page=${page}&limit=${limit}`;
    if (rating) query += `&rating=${rating}`;
    return get(`/reviews/variant/${variantId}${query}`);
};

/**
 * Create a new review for a product (uses FormData for file upload)
 * @param {Object} data - Review data
 * @param {number} data.rating - Rating (1-5)
 * @param {string} [data.comment] - Review comment
 * @param {string} data.orderItemId - Order item ID being reviewed
 * @param {File[]} [data.images] - Optional array of image files (max 5)
 * @returns {Promise} Created review object
 */
const createReview = (data) => {
    const formData = new FormData();
    formData.append('orderItemId', data.orderItemId);
    formData.append('rating', data.rating);
    if (data.comment) {
        formData.append('comment', data.comment);
    }
    if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
            formData.append('images', file);
        });
    }
    return post('/reviews', formData);
};

/**
 * Update a review (uses FormData for file upload)
 * @param {string} id - Review ID
 * @param {Object} data - Review data to update
 * @param {number} [data.rating] - Rating (1-5)
 * @param {string} [data.comment] - Review comment
 * @param {File[]} [data.images] - Array of new image files to upload (max 5)
 * @param {string[]} [data.existingImages] - Array of existing image URLs to keep
 * @returns {Promise} Updated review object
 */
const updateReview = (id, data) => {
    const formData = new FormData();
    if (data.rating !== undefined) {
        formData.append('rating', data.rating);
    }
    if (data.comment !== undefined) {
        formData.append('comment', data.comment);
    }
    // Append new image files for upload
    if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
            formData.append('images', file);
        });
    }
    // Append existing image URLs to keep
    if (data.existingImages && data.existingImages.length > 0) {
        data.existingImages.forEach((url) => {
            formData.append('existingImages', url);
        });
    }
    return put(`/reviews/${id}`, formData);
};

/**
 * Admin: Delete a review
 * @param {string} id - Review ID
 * @returns {Promise} Success message
 */
const adminDeleteReview = (id) => {
    return del(`/reviews/admin/${id}`);
};

const reviewService = {
    getAllReviews,
    getReviewById,
    getProductReviews,
    getVariantReviews,
    createReview,
    updateReview,
    adminDeleteReview,
};

export default reviewService;
