import { get, del, put, post } from "../utils/request.js";

/**
 * Get all categories with optional filters
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.search] - Search string
 * @returns {Promise} { categories: [...], pagination: {...} }
 */
const getAllCategories = (params = {}) => {
    const { page, limit, search } = params;
    const searchParams = new URLSearchParams();

    if (page !== undefined) searchParams.append('page', page);
    if (limit !== undefined) searchParams.append('limit', limit);
    if (search) searchParams.append('search', search);

    const queryString = searchParams.toString();
    const url = queryString ? `/categories?${queryString}` : '/categories';
    return get(url);
};

/**
 * Get category statistics
 * @returns {Promise} { total, topCategories: [...], allCategories: [...] }
 */
const getCategoryStats = async () => {
    return await get('/categories/stats');
};

/**
 * Get a specific category by ID
 * @param {string} id - Category ID
 * @returns {Promise} Category object
 */
const getCategoryById = async (id) => {
    return await get(`/categories/${id}`);
};

/**
 * Delete a category (Admin only)
 * @param {string} id - Category ID
 * @param {boolean} [force=false] - Force delete even if category has products
 * @returns {Promise} Success message
 */
const deleteCategory = async (id, force = false) => {
    const query = force ? `?force=true` : '';
    return await del(`/categories/${id}${query}`);
};

/**
 * Create a new category (Admin only)
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} data.description - Category description
 * @returns {Promise} Created category object
 */
const createCategory = async (data) => {
    return await post(`/categories`, data);
};

/**
 * Update an existing category (Admin only)
 * @param {string} id - Category ID
 * @param {Object} data - Category data to update
 * @param {string} [data.name] - Category name
 * @param {string} [data.description] - Category description
 * @returns {Promise} Updated category object
 */
const updateCategory = async (id, data) => {
    return await put(`/categories/${id}`, data);
};

const categoryService = {
    getAllCategories,
    getCategoryStats,
    getCategoryById,
    deleteCategory,
    updateCategory,
    createCategory
};

export default categoryService;