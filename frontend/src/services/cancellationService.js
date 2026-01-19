import { get, post, patch } from "../utils/request.js";

/**
 * Create a cancellation request for an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Reason for cancellation
 * @returns {Promise} Created cancellation request
 */
const createCancellationRequest = (orderId, reason) => {
    return post(`/orders/${orderId}/cancel/request`, { reason });
};

/**
 * Get my cancellation requests (Customer)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (REQUESTED/APPROVED/REJECTED/COMPLETED)
 * @returns {Promise} { cancellations: [...], pagination: {...} }
 */
const getMyCancellations = (params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
    return get(`/cancellations/me?${searchParams.toString()}`);
};

/**
 * Get all cancellation requests (Admin/Seller)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (REQUESTED/APPROVED/REJECTED/COMPLETED)
 * @param {string} [params.search] - Search query
 * @returns {Promise} { cancellations: [...], pagination: {...} }
 */
const getAllCancellations = (params = {}) => {
    const { page = 1, limit = 10, status, search } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
    if (search) searchParams.append('search', search);
    return get(`/cancellations?${searchParams.toString()}`);
};

/**
 * Get a specific cancellation request by ID
 * @param {string} id - Cancellation request ID
 * @returns {Promise} Cancellation request object
 */
const getCancellationById = (id) => {
    return get(`/cancellations/${id}`);
};

/**
 * Update cancellation status (Admin/Seller)
 * @param {string} id - Cancellation request ID
 * @param {string} status - New status (APPROVED/REJECTED/COMPLETED)
 * @returns {Promise} Updated cancellation request
 */
const updateCancellationStatus = (id, status) => {
    return patch(`/cancellations/${id}/status`, { status });
};

const cancellationService = {
    createCancellationRequest,
    getMyCancellations,
    getAllCancellations,
    getCancellationById,
    updateCancellationStatus,
};

export default cancellationService;
