import { post, put } from '../utils/request';

const updatePaymentStatus = async (orderId) => {
    return await post(`/payments/update-status/${orderId}`);
};

const putPaymentStatus = async (paymentId, status) => {
    return await put(`/payments/${paymentId}/status`, { status });
}

const retryPayment = async (orderId) => {
    return await post(`/payments/retry/${orderId}`);
};

const confirmCODPayment = async (paymentId) => {
    return await post(`/payments/${paymentId}/confirm-cod`);
};

const paymentService = {
    updatePaymentStatus,
    putPaymentStatus,
    retryPayment,
    confirmCODPayment
};

export default paymentService;
