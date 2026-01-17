import {get, post} from "../utils/request.js";

const login = async ({email, password}) => {
    const response = await post('/auth/login', { email, password });
    if (response.data) {
        const token = response.data.accessToken;
        localStorage.setItem('accessToken', token);
    }
    return response;
}

const register = ({username, email, password, password_confirmation}) => {
    return post('/auth/register', {username, email, password, password_confirmation});
}

const logout = () => {
    return post('/auth/logout');
};

const checkSession = () => {
    return get('/users/me');
}

const authServices = {
    login,
    register,
    logout,
    checkSession,
}

export default authServices;