import {combineReducers} from "redux";
import { categoryReducer } from "./categoryReducer";
import { productReducer } from "./productReducer";
import { cartReducer } from "./cartReducer";
import authReducer from "./authReducer.js";

const allReducers = combineReducers({
    authReducer,
    categories: categoryReducer,
    allProducts: productReducer,
    cart: cartReducer,
});

export default allReducers;