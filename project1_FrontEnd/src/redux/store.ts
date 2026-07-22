import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootRedux";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false }) });
