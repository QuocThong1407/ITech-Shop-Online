import {combineReducers} from "redux";
import { categoryReducer } from "./categoryReducer";
import { productReducer } from "./productReducer";
import authReducer from "./authReducer.js";

const allReducers = combineReducers({
    authReducer,
    allCategories: categoryReducer,
    allProducts: productReducer
});

export default allReducers;