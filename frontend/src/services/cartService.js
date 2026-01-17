import { get, post, put, del } from "../utils/request.js";

/**
 * Get carts for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise} { carts: [...] }
 */
const getCarts = (customerId) => {
    return get(`/carts?customerId=${customerId}`);
};

/**
 * Get cart by ID
 * @param {string} cartId - Cart ID
 * @returns {Promise} Cart object with items
 */
const getCartById = (cartId) => {
    return get(`/carts/${cartId}`);
};

/**
 * Add item to cart
 * @param {string} cartId - Cart ID
 * @param {Object} data - Cart item data
 * @param {string} data.productVariantId - Product variant ID
 * @param {number} data.quantity - Quantity to add
 * @returns {Promise} Updated cart
 */
const addToCart = (cartId, data) => {
    return post(`/carts/${cartId}/items`, data);
};

/**
 * Update cart item quantity
 * @param {string} cartId - Cart ID
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Updated cart
 */
const updateCartItem = (cartId, itemId, quantity) => {
    return put(`/carts/${cartId}/items/${itemId}`, { quantity });
};

/**
 * Remove item from cart
 * @param {string} cartId - Cart ID
 * @param {string} itemId - Cart item ID
 * @returns {Promise} Updated cart
 */
const deleteCartItem = (cartId, itemId) => {
    return del(`/carts/${cartId}/items/${itemId}`);
};

/**
 * Clear all items from cart
 * @param {string} cartId - Cart ID
 * @returns {Promise} Empty cart
 */
const clearCart = (cartId) => {
    return del(`/carts/${cartId}/items`);
};

const cartService = {
    getCarts,
    getCartById,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
};

export default cartService;
