import {post} from "../utils/request.js";

const logout = () => {
    return post('/auth/logout');
};