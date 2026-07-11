import { combineReducers } from "@reduxjs/toolkit";
import locationReducer from "../features/location/locationSlice";

const rootReducer = combineReducers({
  location: locationReducer,
});

export default rootReducer;
