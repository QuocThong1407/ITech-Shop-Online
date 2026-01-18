import { get, post, put } from "../utils/request.js";

/**
 * Create a cancellation request for an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Reason for cancellation
 * @returns {Promise} Created cancellation request
 */
const createCancellationRequest = (orderId, reason) => {
    return post('/cancellations', { orderId, reason });
};

/**
 * Get all cancellation requests (Admin/Seller)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.status] - Filter by status (REQUESTED/APPROVED/REJECTED)
 * @returns {Promise} { cancellations: [...], pagination: {...} }
 */
const getAllCancellations = (params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
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
 * Approve a cancellation request (Admin/Seller)
 * @param {string} id - Cancellation request ID
 * @returns {Promise} Updated cancellation request
 */
const approveCancellation = (id) => {
    return put(`/cancellations/${id}/approve`);
};

/**
 * Reject a cancellation request (Admin/Seller)
 * @param {string} id - Cancellation request ID
 * @param {string} reason - Reason for rejection
 * @returns {Promise} Updated cancellation request
 */
const rejectCancellation = (id, reason) => {
    return put(`/cancellations/${id}/reject`, { reason });
};

/**
 * Withdraw a cancellation request (Customer)
 * @param {string} orderId - Order ID
 * @returns {Promise} Success message
 */
const withdrawCancellationRequest = (orderId) => {
    return post(`/cancellations/${orderId}/withdraw`);
};

const cancellationService = {
    createCancellationRequest,
    getAllCancellations,
    getCancellationById,
    approveCancellation,
    rejectCancellation,
    withdrawCancellationRequest,
};

export default cancellationService;
