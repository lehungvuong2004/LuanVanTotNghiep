import { combineReducers } from "@reduxjs/toolkit";
import locationReducer from "../features/location/locationSlice";
import authReducer from "./authSlice";

const rootReducer = combineReducers({
  location: locationReducer,
  auth: authReducer
});

export default rootReducer;
