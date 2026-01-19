import { get, post, del, put } from '../utils/request';

/**
 * Get all variants of a specific product
 * Path: GET /variants/product/:productId
 */
const getVariantsByProductId = (productId) => {
    return get(`/variants/product/${productId}`);
};

/**
 * Create a new variant for a product
 * Path: POST /variants
 * Note: Body must include productId
 */
const createVariant = (productId, variantData) => {
    // API yêu cầu productId nằm trong body
    // Kiểm tra xem variantData là FormData hay Object thường để append cho đúng
    if (variantData instanceof FormData) {
        variantData.append('productId', productId);
    } else {
        variantData.productId = productId;
    }
    return post('/variants', variantData);
};

/**
 * Update an existing variant
 * Path: PUT /variants/:id
 */
const updateVariant = (variantId, variantData) => {
    return put(`/variants/${variantId}`, variantData);
};

/**
 * Delete a variant
 * Path: DELETE /variants/:id
 */
const deleteVariant = (variantId) => {
    return del(`/variants/${variantId}`);
};

const productVariantService = {
    getVariantsByProductId,
    createVariant,
    updateVariant,
    deleteVariant
};

export default productVariantService;