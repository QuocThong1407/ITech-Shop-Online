import { AuthActionTypes } from "../constants/auth-action-types.js";

// Try to restore user from localStorage on initialization
const storedUser = localStorage.getItem('user');
const parsedUser = storedUser ? JSON.parse(storedUser) : {};
const storedToken = localStorage.getItem('accessToken');

const initialState = {
    isAuthenticated: !!storedToken && !!storedUser,
    user: parsedUser
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case AuthActionTypes.LOGIN_SUCCESS:
            // Store user in localStorage for persistence
            // localStorage.setItem('user', JSON.stringify(action.payload));
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
            };
        case AuthActionTypes.LOGOUT:
            // Clear localStorage on logout
            // localStorage.removeItem('accessToken');
            // localStorage.removeItem('user');
            return {
                isAuthenticated: false,
                user: {},
            };
        default:
            return state;
    }
};

export default authReducer;