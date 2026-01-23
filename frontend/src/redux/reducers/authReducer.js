import { AuthActionTypes } from "../constants/auth-action-types.js";

// Don't restore from localStorage for security - will check session via API on app load
const initialState = {
    isAuthenticated: false,
    user: {}
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case AuthActionTypes.LOGIN_SUCCESS:
            // Store user in memory only, not localStorage
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
            };
        case AuthActionTypes.LOGOUT:
            // Clear all stored data on logout
            // Token cookie is cleared by server
            sessionStorage.clear();
            return {
                isAuthenticated: false,
                user: {},
            };
        default:
            return state;
    }
};

export default authReducer;