import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchReverseGeocoding } from "./locationAPI";
import type { LocationState, ReverseGeocodeResponse } from "../../types/location";

const initialState: LocationState = {
  latitude: null,
  longitude: null,
  address: null,
  addressDetails: null,
  status: "idle",
  error: null,
};

export const reverseGeocode = createAsyncThunk("location/reverseGeocode", async ({ lat, lon }: { lat: number; lon: number }, { rejectWithValue }) => {
  try {
    const data = await fetchReverseGeocoding(lat, lon);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Không thể định vị địa chỉ");
  }
});

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation(state, action: PayloadAction<{ latitude: number; longitude: number }>) {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.status = "idle";
      state.error = null;
    },
    clearLocation(state) {
      state.latitude = null;
      state.longitude = null;
      state.address = null;
      state.addressDetails = null;
      state.status = "idle";
      state.error = null;
    },
    setLocationError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "failed";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reverseGeocode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(reverseGeocode.fulfilled, (state, action: PayloadAction<ReverseGeocodeResponse>) => {
        state.status = "succeeded";
        state.address = action.payload.display_name;
        state.addressDetails = action.payload.address;
      })
      .addCase(reverseGeocode.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Lỗi giải mã tọa độ";
      });
  },
});

export const { setLocation, clearLocation, setLocationError } = locationSlice.actions;
export default locationSlice.reducer;
