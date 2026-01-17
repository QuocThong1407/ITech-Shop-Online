import { get, post, del, put } from '../utils/request';

const getAllProducts = (params = {}) => {
    const { skip, take, categoryId, search, sortBy, sortOrder, minPrice, maxPrice, minRating } = params;
    const searchParams = new URLSearchParams();

    if (skip !== undefined) searchParams.append('skip', skip);
    if (take !== undefined) searchParams.append('take', take);
    if (categoryId) searchParams.append('categoryId', categoryId);
    if (search) searchParams.append('search', search);
    if (sortBy) searchParams.append('sortBy', sortBy);
    if (sortOrder) searchParams.append('sortOrder', sortOrder);
    if (minPrice !== undefined) searchParams.append('minPrice', minPrice);
    if (maxPrice !== undefined) searchParams.append('maxPrice', maxPrice);
    if (minRating !== undefined) searchParams.append('minRating', minRating);

    const queryString = searchParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    return get(url);
};

const getProductById = async (productId) => {
    return await get(`/products/${productId}`);
};

const getProductsByCategoryId = (categoryId) => {
    return get(`/products/category/${categoryId}`);
};

const createProduct = (productData) => {
    return post('/products', productData);
};

const updateProduct = (productId, productData) => {
    return put(`/products/${productId}`, productData);
};

const deleteProduct = (productId) => {
    return del(`/products/${productId}`);
};

const getSellerProducts = () => {
    return get('/products/seller/me');
};

const getSellerProductsBySellerId = (sellerId) => {
    return get(`/products/seller/${sellerId}`);
};

const getProductReviews = (productId) => {
    return get(`/reviews?productId=${productId}`);
};

const productService = {
    getAllProducts,
    getProductById,
    getProductsByCategoryId,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    getSellerProductsBySellerId,
    getProductReviews,
};

export default productService;