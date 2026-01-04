import { ProductActionTypes } from '../constants/product-action-types'

export const setProducts = products => {
    return {
        type: ProductActionTypes.SET_PRODUCTS,
        payload: products
    }
}