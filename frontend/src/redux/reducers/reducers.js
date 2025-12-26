import {combineReducers} from "redux";
import authReducer from "./authReducer.js";

const allReducers = combineReducers({
    auth: authReducer,
})

export default allReducers;