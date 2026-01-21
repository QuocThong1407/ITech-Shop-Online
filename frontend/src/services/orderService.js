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

const getMyOrders = () => {
    return get('/orders/me');
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
 * @param {string} data.paymentMethod - Payment method (COD, STRIPE)
 * @param {string} [data.couponCode] - Optional coupon code
 * @param {Array} data.items - Array of cart item IDs to order
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
 * Cancel an order
 * @param {string} orderId - Order ID
 * @returns {Promise} Success message
 */
const cancelOrder = (orderId) => {
    return post(`/orders/${orderId}/cancel`);
};

/**
 * Create a direct order (Buy Now functionality)
 * @param {string} addressId - Delivery address ID
 * @param {string} productVariantId - Product variant ID
 * @param {number} quantity - Quantity to order
 * @param {string} paymentMethod - Payment method (COD, STRIPE)
 * @returns {Promise} Created order object (with stripeSessionUrl if STRIPE payment)
 */
const createDirectOrder = (addressId, productVariantId, quantity, paymentMethod) => {
    return post('/orders/direct', { 
        addressId, 
        productVariantId, 
        quantity, 
        paymentMethod 
    });
};

const orderService = {
    getAllOrders,
    getMyOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    createDirectOrder,
};

export default orderService;
