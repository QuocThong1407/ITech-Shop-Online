import { del, get, post, put, patch } from "../utils/request.js";

/**
 * Get all users with optional filters (Admin only)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.role] - Filter by role (CUSTOMER/SELLER/ADMIN)
 * @param {string} [params.search] - Search string
 * @returns {Promise} { users: [...], pagination: {...} }
 */
const getAllUsers = ({ page = 1, limit = 10, role, search }) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    if (role) params.append('role', role);

    return get(`/users?${params.toString()}`);
};

/**
 * Get user statistics (Admin only)
 * @returns {Promise} { total, customers, sellers, admins }
 */
const getUserStatistics = () => {
    return get('/users/stats');
};

/**
 * Get a specific user by ID (Admin only)
 * @param {string} id - User ID
 * @returns {Promise} User object
 */
const getUserById = (id) => {
    return get(`/users/${id}`);
};

/**
 * Create a new user (Admin only)
 * @param {Object} data - User data
 * @param {string} data.username - Username
 * @param {string} data.email - Email address
 * @param {string} data.password - Password
 * @param {string} data.role - Role (CUSTOMER/SELLER/ADMIN)
 * @returns {Promise} Created user object
 */
const createUser = (data) => {
    return post('/users', data);
};

/**
 * Update a user by ID (Admin only)
 * @param {string} id - User ID
 * @param {Object} data - User data to update
 * @param {string} [data.username] - Username
 * @param {string} [data.email] - Email address
 * @param {string} [data.role] - Role (CUSTOMER/SELLER/ADMIN)
 * @returns {Promise} Updated user object
 */
const updateUser = (id, data) => {
    return put(`/users/${id}`, data);
};

/**
 * Delete a user by ID (Admin only)
 * Cannot delete own account
 * @param {string} id - User ID
 * @returns {Promise} Success message
 */
const deleteUser = (id) => {
    return del(`/users/${id}`);
};

/**
 * Get current user profile
 * @returns {Promise} Current user object
 */
const getCurrentUser = () => {
    return get('/users/me');
};

/**
 * Update current user profile
 * @param {Object} data - User data to update
 * @param {string} [data.username] - New username
 * @returns {Promise} Updated user object
 */
const updateCurrentUser = (data) => {
    return patch('/users/me', data);
};

/**
 * Get current user info (alias for getCurrentUser, used by AccountInfo)
 * @returns {Promise} Current user object
 */
const getUserInfo = () => {
    return get('/users/me');
};

/**
 * Update current user info (alias for updateCurrentUser, used by AccountInfo)
 * @param {Object} data - User data to update
 * @param {string} [data.username] - New username
 * @param {string} [data.email] - New email (if supported)
 * @returns {Promise} Updated user object
 */
const updateUserInfo = (data) => {
    return patch('/users/me', data);
};

/**
 * Get current user's profile picture
 * @returns {Promise} { image: string } Profile picture URL
 */
const getPfp = () => {
    return get('/users/me/pfp');
};

/**
 * Upload/update current user's profile picture
 * @param {FormData} formData - Form data containing the image file
 * @returns {Promise} { image: string } Updated profile picture URL
 */
const uploadPfp = (formData) => {
    return post('/users/me/pfp', formData);
};

const userService = {
    getAllUsers,
    getUserStatistics,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    updateCurrentUser,
    getUserInfo,
    updateUserInfo,
    getPfp,
    uploadPfp,
};

export default userService;