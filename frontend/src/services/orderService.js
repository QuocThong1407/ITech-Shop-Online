import {get, post, put, del, patch} from "../utils/request.js";

/**
 * Get all orders for the current user
 * @returns {Promise} { orders: [...] }
 */
const getAllOrders = (params = {}) => {
    const { page = 1, limit = 10, status, search } = params;
    const searchParams = new URLSearchParams();

    searchParams.append('page', page);
    searchParams.append('limit', limit);

    if (status) searchParams.append('status', status);
    if (search) searchParams.append('search', search);

    return get(`/orders?${searchParams.toString()}`);
};

const getMyOrders = (params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const searchParams = new URLSearchParams();
    searchParams.append('page', page);
    searchParams.append('limit', limit);
    if (status) searchParams.append('status', status);
    return get(`/orders/me?${searchParams.toString()}`);
}

/**
 * Get a specific order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} { order: {...} }
 */
const getOrderById = (orderId) => {
    return get(`/orders/${orderId}`);
};

/**
 * Create a new order
 * @param {Object} data - Order data
 * @param {string} data.addressId - Delivery address ID
 * @param {string} data.paymentMethod - Payment method (COD, VNPAY, STRIPE)
 * @param {string} [data.couponCode] - Optional coupon code
 * @returns {Promise} Created order object
 */
const createOrder = (data) => {
    return post('/orders', data);
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status (PENDING, SHIPPED, DELIVERED, CANCELLED)
 * @returns {Promise} Updated order object
 */
const updateOrderStatus = (orderId, status) => {
    return patch(`/orders/${orderId}/status`, { status });
};

/**
 * Delete an order
 * @param {string} orderId - Order ID
 * @returns {Promise} Success message
 */
const deleteOrder = (orderId) => {
    return del(`/orders/${orderId}`);
};

const orderService = {
    getAllOrders,
    getMyOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder,
};

export default orderService;
