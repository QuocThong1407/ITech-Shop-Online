import { get } from "../utils/request.js";

/**
 * Get current user's membership
 * @returns {Promise} { membership: {...} }
 */
const getMyMembership = () => {
    return get('/memberships/me');
};

/**
 * Get membership by customer ID (Admin only)
 * @param {string} customerId - Customer ID
 * @returns {Promise} Membership object
 */
const getMembershipByCustomerId = (customerId) => {
    return get(`/memberships/customer/${customerId}`);
};

/**
 * Get all memberships (Admin only)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise} { memberships: [...], pagination: {...} }
 */
const getAllMemberships = (params = {}) => {
    const { page = 1, limit = 10 } = params;
    return get(`/memberships?page=${page}&limit=${limit}`);
};

/**
 * Get top spent members (Admin only)
 * @param {number} limit - Number of members to retrieve
 * @returns {Promise} List of top spent members
 */
const getTopSpent = (limit = 10) => {
    return get(`/memberships/top-spent?limit=${limit}`);
};

const membershipService = {
    getMyMembership,
    getMembershipByCustomerId,
    getAllMemberships,
    getTopSpent
};

export default membershipService;
