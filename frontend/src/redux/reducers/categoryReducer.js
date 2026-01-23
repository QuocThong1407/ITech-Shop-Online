import { CategoryActionTypes } from "../constants/category-action-types"

const initialState = {
    allCategories: [],
    topCategories: []
}

export const categoryReducer = (state = initialState, {type, payload}) => {
    switch(type) {
        case CategoryActionTypes.SET_CATEGORIES:
            return {
                ...state,
                allCategories: payload.allCategories || payload.categories,
                topCategories: payload.topCategories
            }
        default:
            return state
    }
}