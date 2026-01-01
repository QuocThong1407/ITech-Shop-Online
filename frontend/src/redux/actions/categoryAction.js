import { CategoryActionTypes } from '../constants/category-action-types'

export const setCategories = categories => {
    return {
        type: CategoryActionTypes.SET_CATEGORIES,
        payload: categories
    }
}