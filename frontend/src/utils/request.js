const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

const request = async (path, options = {}) => {
    const headers = {
        Accept: 'application/json',
        ...options.headers,
    };

    // No need to manually add Authorization header
    // httpOnly cookie will be sent automatically with credentials: 'include'

    const defaultOptions = {
        credentials: 'include', // This sends cookies automatically
        ...options,
        headers: headers,
    };

    const response = await fetch(API_DOMAIN + path, defaultOptions);

    if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
            // Token expired or invalid - cookie will be cleared by server
            if (window.location.pathname !== '/login') {
                alert("Your login session has expired. Please log in again.");
                window.location.href = '/login';
            }
            return;
        }

        throw new Error(errorData.message || 'Errors has occurred');
    }

    try {
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e.message)
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