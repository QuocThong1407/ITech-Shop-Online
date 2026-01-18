import { get, post, put } from "../utils/request.js";

/**
 * Create a return request for an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Reason for return
 * @returns {Promise} Created return request
 */
const createReturnRequest = (orderId, reason) => {
    return post('/returns', { orderId, reason });
};

/**
 * Get all return requests (Admin/Seller)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (REQUESTED/APPROVED/REJECTED)
 * @returns {Promise} { returns: [...], pagination: {...} }
 */
const getAllReturns = (params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
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
 * Approve a return request (Admin/Seller)
 * @param {string} id - Return request ID
 * @returns {Promise} Updated return request
 */
const approveReturn = (id) => {
    return put(`/returns/${id}/approve`);
};

/**
 * Reject a return request (Admin/Seller)
 * @param {string} id - Return request ID
 * @param {string} reason - Reason for rejection
 * @returns {Promise} Updated return request
 */
const rejectReturn = (id, reason) => {
    return put(`/returns/${id}/reject`, { reason });
};

/**
 * Withdraw a return request (Customer)
 * @param {string} orderId - Order ID
 * @returns {Promise} Success message
 */
const withdrawReturnRequest = (orderId) => {
    return post(`/returns/${orderId}/withdraw`);
};

const returnService = {
    createReturnRequest,
    getAllReturns,
    getReturnById,
    approveReturn,
    rejectReturn,
    withdrawReturnRequest,
};

export default returnService;
