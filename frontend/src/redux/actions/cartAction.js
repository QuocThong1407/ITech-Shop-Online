import { CartActionTypes } from '../constants/cart-action-types.js';
import cartService from '../../services/cartService.js';

// Set cart data
export const setCart = (cartData) => ({
    type: CartActionTypes.SET_CART,
    payload: cartData,
});

// Add item to cart
export const addToCart = (item) => ({
    type: CartActionTypes.ADD_TO_CART,
    payload: item,
});

// Update cart item
export const updateCartItem = (id, quantity) => ({
    type: CartActionTypes.UPDATE_CART_ITEM,
    payload: { id, quantity },
});

// Remove from cart
export const removeFromCart = (id) => ({
    type: CartActionTypes.REMOVE_FROM_CART,
    payload: id,
});

// Clear cart
export const clearCart = () => ({
    type: CartActionTypes.CLEAR_CART,
});

// Set loading state
export const setCartLoading = (loading) => ({
    type: CartActionTypes.SET_CART_LOADING,
    payload: loading,
});

// Set error state
export const setCartError = (error) => ({
    type: CartActionTypes.SET_CART_ERROR,
    payload: error,
});

// Async action to fetch cart
export const fetchCart = () => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const response = await cartService.getMyCart();
        dispatch(setCart(response.data));
    } catch (error) {
        dispatch(setCartError(error.message));
    }
};

// Async action to add item to cart
export const addItemToCart = (productVariantId, quantity) => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const response = await cartService.addToCart({ productVariantId, quantity });
        dispatch(addToCart(response.data));
        return response;
    } catch (error) {
        dispatch(setCartError(error.message));
        throw error;
    }
};

// Async action to update cart item
export const updateCartItemAsync = (itemId, quantity) => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        await cartService.updateCartItem(itemId, quantity);
        dispatch(updateCartItem(itemId, quantity));
    } catch (error) {
        dispatch(setCartError(error.message));
        throw error;
    }
};

// Async action to remove from cart
export const removeFromCartAsync = (itemId) => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        await cartService.deleteCartItem(itemId);
        dispatch(removeFromCart(itemId));
    } catch (error) {
        dispatch(setCartError(error.message));
        throw error;
    }
};

// Async action to clear cart
export const clearCartAsync = () => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        await cartService.clearCart();
        dispatch(clearCart());
    } catch (error) {
        dispatch(setCartError(error.message));
        throw error;
    }
};
