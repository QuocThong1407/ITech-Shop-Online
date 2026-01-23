import { post, get } from '../utils/request';

/**
 * Create a new payment for an order
 * @param {Object} data - Payment data
 * @param {string} data.orderId - Order ID
 * @param {string} data.method - Payment method (COD, VNPAY)
 * @param {string} [data.returnUrl] - Return URL for VNPay (required for VNPAY method)
 * @returns {Promise} Payment object with paymentUrl for VNPay
 */
const createPayment = async (data) => {
    return await post('/payments', data);
};

/**
 * Get payment information by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Payment object
 */
const getPaymentByOrderId = async (orderId) => {
    return await get(`/payments/${orderId}`);
};

/**
 * Create VNPay payment and get redirect URL
 * @param {string} orderId - Order ID
 * @param {string} returnUrl - URL to redirect after payment
 * @returns {Promise} { payment, paymentUrl }
 */
const createVNPayPayment = async (orderId, returnUrl) => {
    return await post('/payments', {
        orderId,
        method: 'VNPAY',
        returnUrl
    });
};

/**
 * Create COD payment
 * @param {string} orderId - Order ID
 * @returns {Promise} { payment, message }
 */
const createCODPayment = async (orderId) => {
    return await post('/payments', {
        orderId,
        method: 'COD'
    });
};

const paymentService = {
    createPayment,
    getPaymentByOrderId,
    createVNPayPayment,
    createCODPayment
};

export default paymentService;
