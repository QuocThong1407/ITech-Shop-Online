import { CartActionTypes } from '../constants/cart-action-types.js';

const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null,
};

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case CartActionTypes.SET_CART:
            return {
                ...state,
                items: action.payload.items || [],
                totalItems: action.payload.totalItems || 0,
                totalPrice: action.payload.totalPrice || 0,
                loading: false,
                error: null,
            };
        
        case CartActionTypes.ADD_TO_CART:
            return {
                ...state,
                items: [...state.items, action.payload],
                totalItems: state.totalItems + action.payload.quantity,
                loading: false,
            };
        
        case CartActionTypes.UPDATE_CART_ITEM:
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
                loading: false,
            };
        
        case CartActionTypes.REMOVE_FROM_CART:
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.payload),
                loading: false,
            };
        
        case CartActionTypes.CLEAR_CART:
            return {
                ...initialState,
            };
        
        case CartActionTypes.SET_CART_LOADING:
            return {
                ...state,
                loading: action.payload,
            };
        
        case CartActionTypes.SET_CART_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        
        default:
            return state;
    }
};

export default cartReducer;
