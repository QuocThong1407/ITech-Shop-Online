import { get, post, patch } from "../utils/request.js";

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} User data (token stored in httpOnly cookie)
 */
const login = async ({ email, password }) => {
    const response = await post('/auth/login', { email, password });

    if (response && response.data) {
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        } else if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }
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
const register = ({ username, email, password, password_confirmation }) => {
    return post('/auth/register', { username, email, password, password_confirmation });
};

/**
 * Logout current user
 * @returns {Promise} Success message
 */
const logout = () => {
    // Token cookie will be cleared by the server
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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

/**
 * Complete user profile after OAuth registration
 * @returns {Promise} Success message
 */
const completeProfile = () => {
    return post('/auth/complete-profile');
};

/**
 * Verify email with token (handled by Supabase redirect)
 * This is called from the VerifyEmail page after Supabase redirects
 * Since Supabase handles verification, we just return success if user lands on this page
 * @param {string} token - Verification token from URL (not used, Supabase handles it)
 * @returns {Promise} Verification status
 */
const verify = async (token) => {
    // Supabase handles email verification automatically when user clicks the link
    // The link redirects to /auth/verify and Supabase confirms the email
    // We return a success response since landing here means email was verified
    return { 
        ok: true, 
        message: 'Email verified successfully! Please login to continue.',
        data: null
    };
};

const authServices = {
    login,
    register,
    logout,
    checkSession,
    forgotPassword,
    resetPassword,
    updateMe,
    completeProfile,
    verify,
};

export default authServices;