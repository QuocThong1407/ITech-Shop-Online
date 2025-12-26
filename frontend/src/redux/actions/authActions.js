import {AuthActionTypes} from "../constants/auth-action-types.js";

export const logout = () => {
    return {
        type: AuthActionTypes.LOGOUT
    }
}

