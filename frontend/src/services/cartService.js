import { get, post, put, del } from "../utils/request.js";

/**
 * Get current user's cart
 * @returns {Promise} Cart object with items, totalItems, totalPrice
 */
const getMyCart = () => {
    return get("/cart/me");
};

/**
 * Add item to cart
 * @param {Object} data - Cart item data
 * @param {string} data.productVariantId - Product variant ID
 * @param {number} data.quantity - Quantity to add
 * @returns {Promise} Created cart item
 */
const addToCart = (data) => {
    return post("/cart/items", data);
};

/**
 * Update cart item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Updated cart item
 */
const updateCartItem = (itemId, quantity) => {
    return put(`/cart/items/${itemId}`, { quantity });
};

/**
 * Remove item from cart
 * @param {string} itemId - Cart item ID
 * @returns {Promise} Success response
 */
const deleteCartItem = (itemId) => {
    return del(`/cart/items/${itemId}`);
};

/**
 * Clear all items from cart
 * @returns {Promise} Success response
 */
const clearCart = () => {
    return del("/cart/clear");
};

const checkout = (customerId, cartItemIds, addressId, paymentMethod, discountInfo = {}) => {
    return post(`/carts/${customerId}/checkout`, {
        cartItemIds,
        addressId,
        paymentMethod,
        couponCode: discountInfo.couponCode,
        couponDiscount: discountInfo.couponDiscount,
        membershipDiscount: discountInfo.membershipDiscount,
        membershipTier: discountInfo.membershipTier,
    });
};

const cartService = {
    getMyCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
    checkout,
};

export default cartService;
