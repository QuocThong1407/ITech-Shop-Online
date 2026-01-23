import { get, post, patch } from "../utils/request.js";

/**
 * Create a return request for an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Reason for return
 * @returns {Promise} Created return request
 */
const createReturnRequest = (orderId, reason) => {
    return post(`/orders/${orderId}/return/request`, { reason });
};

/**
 * Get my return requests (Customer)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (REQUESTED/APPROVED/REJECTED/COMPLETED)
 * @returns {Promise} { returns: [...], pagination: {...} }
 */
const getMyReturns = (params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
    return get(`/returns/me?${searchParams.toString()}`);
};

/**
 * Get all return requests (Admin/Seller)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (REQUESTED/APPROVED/REJECTED/COMPLETED)
 * @param {string} [params.search] - Search query
 * @returns {Promise} { returns: [...], pagination: {...} }
 */
const getAllReturns = (params = {}) => {
    const { page = 1, limit = 10, status, search } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
    if (search) searchParams.append('search', search);
    return get(`/returns?${searchParams.toString()}`);
};

/**
 * Get a specific return request by ID
 * @param {string} id - Return request ID
 * @returns {Promise} Return request object
 */
const getReturnById = (id) => {
    return get(`/returns/${id}`);
};

/**
 * Update return status (Admin/Seller)
 * @param {string} id - Return request ID
 * @param {string} status - New status (APPROVED/REJECTED/COMPLETED)
 * @returns {Promise} Updated return request
 */
const updateReturnStatus = (id, status) => {
    return patch(`/returns/${id}/status`, { status });
};

const returnService = {
    createReturnRequest,
    getMyReturns,
    getAllReturns,
    getReturnById,
    updateReturnStatus,
};

export default returnService;
