import {del, get, post, put} from "../utils/request.js";

const getAllUsers = ({page, limit, role, search}) => {
    const params = new URLSearchParams({
        page,
        limit,
        search,
    });

    if (role) params.append('role', role);

    return get(`/users?${params.toString()}`);
}

const getUserStatistics = () => {
    return get('/users/stats');
}

const getUserById = (id) => {
    return get(`/users/${id}`);
}

const createUser = (data) => {
    return post('/users', data);
}

const updateUser = (id, data) => {
    return put(`/users/${id}`, data);
}

const deleteUser = (id) => {
    return del(`/users/${id}`);
}

const userService = {
    getAllUsers,
    getUserStatistics,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}

export default userService;