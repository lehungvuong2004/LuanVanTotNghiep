import { combineReducers } from "@reduxjs/toolkit";
import locationReducer from "../features/location/locationSlice";
import authReducer from "./authSlice";
import favoritesReducer from "./favoritesSlice";

const rootReducer = combineReducers({
  location: locationReducer,
  auth: authReducer,
  favorites: favoritesReducer,
});

export default rootReducer;
