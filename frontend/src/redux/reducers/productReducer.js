import { ProductActionTypes } from "../constants/product-action-types"

const initialState = {
    products: []
}

export const productReducer = (state = initialState, {type, payload}) => {
    switch(type) {
        case ProductActionTypes.SET_PRODUCTS:
            return {
                ...state,
                products: payload
            }
        default:
            return state
    }
}