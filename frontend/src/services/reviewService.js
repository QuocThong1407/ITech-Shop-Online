import { get, post, put, del } from "../utils/request.js";

/**
 * Create a new review for a product
 * @param {Object} data - Review data
 * @param {number} data.rating - Rating (1-5)
 * @param {string} data.comment - Review comment
 * @param {string} data.orderItemId - Order item ID being reviewed
 * @param {string[]} [data.images] - Optional array of image URLs
 * @returns {Promise} Created review object
 */
const createReview = (data) => {
    return post('/reviews', data);
};

/**
 * Get all reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise} { reviews: [...], pagination: {...} }
 */
const getProductReviews = (productId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    return get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
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
 * Update a review
 * @param {string} id - Review ID
 * @param {Object} data - Review data to update
 * @param {number} [data.rating] - Rating (1-5)
 * @param {string} [data.comment] - Review comment
 * @param {string[]} [data.images] - Array of image URLs
 * @returns {Promise} Updated review object
 */
const updateReview = (id, data) => {
    return put(`/reviews/${id}`, data);
};

/**
 * Delete a review
 * @param {string} id - Review ID
 * @returns {Promise} Success message
 */
const deleteReview = (id) => {
    return del(`/reviews/${id}`);
};

/**
 * Get current user's reviews
 * @returns {Promise} Array of review objects
 */
const getMyReviews = () => {
    return get('/reviews/me');
};

const reviewService = {
    createReview,
    getProductReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getMyReviews,
};

export default reviewService;
