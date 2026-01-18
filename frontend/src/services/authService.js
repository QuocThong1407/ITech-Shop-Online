import { get, post, patch } from "../utils/request.js";

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} User data + access token
 */
const login = async ({ email, password }) => {
    const response = await post('/auth/login', { email, password });
    if (response.data) {
        const token = response.data.accessToken;
        localStorage.setItem('accessToken', token);
    }
    return response;
};

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email address
 * @param {string} data.password - Password
 * @returns {Promise} User data + auto-login
 */
const register = ({ username, email, password }) => {
    return post('/auth/register', { username, email, password });
};

/**
 * Logout current user
 * @returns {Promise} Success message
 */
const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return post('/auth/logout');
};

/**
 * Check current session and get user data
 * @returns {Promise} Current user object
 */
const checkSession = () => {
    return get('/users/me');
};

/**
 * Request password reset email
 * @param {string} email - User email address
 * @returns {Promise} Email sent confirmation
 */
const forgotPassword = (email) => {
    return post('/auth/forgot-password', { email });
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise} Success message
 */
const resetPassword = (token, newPassword) => {
    return post('/auth/reset-password', { token, newPassword });
};

/**
 * Update current user profile
 * @param {Object} data - User data to update
 * @param {string} [data.username] - New username
 * @returns {Promise} Updated user object
 */
const updateMe = (data) => {
    return patch('/users/me', data);
};

const authServices = {
    login,
    register,
    logout,
    checkSession,
    forgotPassword,
    resetPassword,
    updateMe,
};

export default authServices;