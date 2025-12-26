const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

const request = async (path, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        ...options,
        headers: {
            Accept: 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(API_DOMAIN + path, defaultOptions);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errors has occurred');
    }

    try {
        const data = await response.json();
        return data;
    } catch (e) {
        return null;
    }
};

export const get = (path) => {
    return request(path, { method: 'GET' });
};

export const post = (path, data) => {
    const isFormData = data instanceof FormData;
    return request(path, {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
};

export const del = (path, data) => {
    if (data) {
        const isFormData = data instanceof FormData;
        return request(path, {
            method: 'DELETE',
            body: isFormData ? data : JSON.stringify(data),
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        });
    }

    return request(path, { method: 'DELETE' });
};

export const patch = (path, data) => {
    const isFormData = data instanceof FormData;
    return request(path, {
        method: 'PATCH',
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
};

export const put = (path, data) => {
    const isFormData = data instanceof FormData;
    return request(path, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
};