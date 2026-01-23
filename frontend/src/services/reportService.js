import { get } from "../utils/request.js";

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

/**
 * Get Revenue Report (JSON)
 * @param {Object} params { startDate, endDate, groupBy }
 */
const getRevenueReport = (params) => {
    const searchParams = new URLSearchParams(params);
    return get(`/reports/revenue?${searchParams.toString()}`);
};

/**
 * Export Revenue Report (Excel - Blob)
 */
const exportRevenueReport = async (params) => {
    const token = localStorage.getItem('accessToken');
    const query = new URLSearchParams({...params, format: 'excel'}).toString();

    const headers = {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(
            `${API_DOMAIN}/reports/revenue?${query}`,
            {
                method: 'GET',
                credentials: 'include',
                headers,
            }
        );

        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Export failed: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const jsonError = await response.json();
            throw new Error(jsonError.message || "Export failed");
        }

        const blob = await response.blob();
        return blob;

    } catch (error) {
        console.error("Export Service Error:", error);
        throw error;
    }
}

/**
 * Get Activity Report (JSON)
 * @param {Object} params { startDate, endDate }
 */
const getActivityReport = (params) => {
    const searchParams = new URLSearchParams(params);
    return get(`/reports/activity?${searchParams.toString()}`);
};

/**
 * Export Activity Report (Excel - Blob)
 */
const exportActivityReport = async (params) => {
    const token = localStorage.getItem('accessToken');
    const query = new URLSearchParams({...params, format: 'excel'}).toString();

    const headers = {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(
            `${API_DOMAIN}/reports/activity?${query}`,
            {
                method: 'GET',
                credentials: 'include',
                headers,
            }
        );

        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Export failed: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const jsonError = await response.json();
            throw new Error(jsonError.message || "Export failed");
        }

        const blob = await response.blob();
        return blob;

    } catch (error) {
        console.error("Export Service Error:", error);
        throw error;
    }
}

const reportService = {
    getRevenueReport,
    exportRevenueReport,
    getActivityReport,
    exportActivityReport
};

export default reportService;