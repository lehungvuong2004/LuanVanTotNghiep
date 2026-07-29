import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("access_token");
const userString = localStorage.getItem("user");

const getUserFromStorage = () => {
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

const initialState = {
  token,
  user: getUserFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.access_token;
      state.user = action.payload.user;
    },
    logoutSuccess(state) {
      state.token = null;
      state.user = null;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUser } = authSlice.actions;
export default authSlice.reducer;
