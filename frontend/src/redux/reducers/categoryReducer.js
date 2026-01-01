import { CategoryActionTypes } from "../constants/category-action-types"

const initialState = {
    categories: []
}

export const categoryReducer = (state = initialState, {type, payload}) => {
    switch(type) {
        case CategoryActionTypes.SET_CATEGORIES:
            return {
                ...state,
                categories: payload
            }
        default:
            return state
    }
}