import {AuthActionTypes} from "../constants/auth-action-types.js";

export const setLoginSuccess = (user) => {
    return {
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: user
    };
}

export const setLogout = () => {
    return {
        type: AuthActionTypes.LOGOUT
    }
}

