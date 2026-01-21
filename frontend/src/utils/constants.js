// API Configuration and constants
export const API_CONFIG = {
    DOMAIN: import.meta.env.VITE_API_DOMAIN,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        COMPLETE_PROFILE: '/auth/complete-profile',
    },
    USERS: {
        ME: '/users/me',
        ALL: '/users',
        STATS: '/users/stats',
        BY_ID: (id) => `/users/${id}`,
    },
    PRODUCTS: {
        ALL: '/products',
        BY_ID: (id) => `/products/${id}`,
    },
    CATEGORIES: {
        ALL: '/categories',
        STATS: '/categories/stats',
        BY_ID: (id) => `/categories/${id}`,
    },
    CART: {
        ME: '/cart/me',
        ITEMS: '/cart/items',
        ITEM_BY_ID: (id) => `/cart/items/${id}`,
        CLEAR: '/cart/clear',
    },
    ORDERS: {
        ALL: '/orders',
        ME: '/orders/me',
        BY_ID: (id) => `/orders/${id}`,
        STATUS: (id) => `/orders/${id}/status`,
        RETURN_REQUEST: (id) => `/orders/${id}/return/request`,
        CANCEL_REQUEST: (id) => `/orders/${id}/cancel/request`,
    },
    ADDRESSES: {
        ALL: '/addresses',
        BY_ID: (id) => `/addresses/${id}`,
        DEFAULT: (id) => `/addresses/${id}/default`,
    },
    REVIEWS: {
        ALL: '/reviews',
        BY_ID: (id) => `/reviews/${id}`,
        BY_PRODUCT: (id) => `/reviews/product/${id}`,
        BY_VARIANT: (id) => `/reviews/variant/${id}`,
    },
    PROMOTIONS: {
        ALL: '/promotions',
        STATS: '/promotions/stats',
        BY_ID: (id) => `/promotions/${id}`,
        STATUS: (id) => `/promotions/${id}/status`,
        APPLY: (id) => `/promotions/${id}/apply`,
        APPLY_CATEGORIES: (id) => `/promotions/${id}/apply-categories`,
    },
    COUPONS: {
        ALL: '/coupons',
        BY_ID: (id) => `/coupons/${id}`,
        VALIDATE: '/coupons/validate',
        BY_PROMOTION: (id) => `/coupons/promotion/${id}`,
    },
    VARIANTS: {
        ALL: '/variants',
        BY_ID: (id) => `/variants/${id}`,
        BY_PRODUCT: (id) => `/variants/product/${id}`,
    },
    RETURNS: {
        ALL: '/returns',
        ME: '/returns/me',
        BY_ID: (id) => `/returns/${id}`,
        STATUS: (id) => `/returns/${id}/status`,
    },
    CANCELLATIONS: {
        ALL: '/cancellations',
        ME: '/cancellations/me',
        BY_ID: (id) => `/cancellations/${id}`,
        STATUS: (id) => `/cancellations/${id}/status`,
    },
    MEMBERSHIPS: {
        ME: '/memberships/me',
        ALL: '/memberships',
        BY_CUSTOMER: (id) => `/memberships/customer/${id}`,
    },
};

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

// Order statuses
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
};

// Payment methods
export const PAYMENT_METHOD = {
    COD: 'COD',
    VNPAY: 'VNPAY',
    STRIPE: 'STRIPE',
};

// User roles
export const USER_ROLE = {
    ADMIN: 'ADMIN',
    SELLER: 'SELLER',
    CUSTOMER: 'CUSTOMER',
};

// Return/Cancellation statuses
export const REQUEST_STATUS = {
    REQUESTED: 'REQUESTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
};

// Promotion statuses
export const PROMOTION_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
};

// Membership tiers
export const MEMBERSHIP_STATUS = {
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD',
};

export default {
    API_CONFIG,
    API_ENDPOINTS,
    HTTP_STATUS,
    ORDER_STATUS,
    PAYMENT_METHOD,
    USER_ROLE,
    REQUEST_STATUS,
    PROMOTION_STATUS,
    MEMBERSHIP_STATUS,
};
