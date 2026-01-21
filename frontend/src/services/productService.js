import { get, post, del, put } from '../utils/request';

/**
 * Get all products with optional filters
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.categoryId] - Filter by category ID
 * @param {string} [params.search] - Search string
 * @param {number} [params.minPrice] - Minimum price filter
 * @param {number} [params.maxPrice] - Maximum price filter
 * @param {string} [params.sellerId] - Filter by seller ID
 * @returns {Promise} { products: [...], pagination: {...} }
 */
const getAllProducts = (params = {}) => {
    const { page, limit, categoryId, search, minPrice, maxPrice, sellerId } = params;
    const searchParams = new URLSearchParams();

    if (page !== undefined) searchParams.append('page', page);
    if (limit !== undefined) searchParams.append('limit', limit);
    if (categoryId) searchParams.append('categoryId', categoryId);
    if (search) searchParams.append('search', search);
    if (minPrice !== undefined) searchParams.append('minPrice', minPrice);
    if (maxPrice !== undefined) searchParams.append('maxPrice', maxPrice);
    if (sellerId) searchParams.append('sellerId', sellerId);

    const queryString = searchParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    return get(url);
};

/**
 * Get a specific product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} Product object with variants
 */
const getProductById = async (productId) => {
    return await get(`/products/${productId}`);
};

/**
 * Get products by category ID
 * @param {string} categoryId - Category ID
 * @returns {Promise} Array of products
 */
const getProductsByCategoryId = (categoryId) => {
    return getAllProducts({ categoryId });
};

/**
 * Create a new product (Seller only)
 * @param {FormData} productData - Product data
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price (>= 0)
 * @param {number} productData.stockQuantity - Stock quantity (>= 0)
 * @param {string} productData.categoryId - Category ID
 * @param {string[]} [productData.images] - Array of image URLs
 * @param {string[]} [productData.variantTypes] - Variant types
 * @param {Object} [productData.variantOptions] - Variant options
 * @returns {Promise} Created product object
 */
const createProduct = (productData) => {
    return post('/products', productData);
};

/**
 * Update an existing product (Seller only, owns product)
 * @param {string} productId - Product ID
 * @param {Object} productData - Product data to update
 * @returns {Promise} Updated product object
 */
const updateProduct = (productId, productData) => {
    return put(`/products/${productId}`, productData);
};

/**
 * Delete a product (Seller only, owns product)
 * Soft delete - sets is_deleted: true
 * @param {string} productId - Product ID
 * @returns {Promise} Success message
 */
const deleteProduct = (productId) => {
    return del(`/products/${productId}`);
};

/**
 * Get products by a specific seller ID
 * @param {string} sellerId - Seller ID
 * @returns {Promise} Array of products
 */
const getSellerProductsBySellerId = (sellerId) => {
    return getAllProducts({ sellerId });
};

/**
 * Get reviews for a specific product
 * @param {string} productId - Product ID
 * @returns {Promise} Array of reviews
 */
const getProductReviews = (productId) => {
    return get(`/reviews/product/${productId}`);
};

const productService = {
    getAllProducts,
    getProductById,
    getProductsByCategoryId,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProductsBySellerId,
    getProductReviews,
};

export default productService;