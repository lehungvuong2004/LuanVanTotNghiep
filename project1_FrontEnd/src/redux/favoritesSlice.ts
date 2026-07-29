import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getFavorites, addFavorite, removeFavorite } from "../api/favorites";
import type { FavoriteItem } from "../api/favorites";

interface FavoritesState {
  items: FavoriteItem[];
  favoriteIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  items: [],
  favoriteIds: [],
  loading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFavorites({ page: 1, limit: 100 });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch favorites");
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async ({ helperId, isCurrentlyFavorite }: { helperId: number; isCurrentlyFavorite: boolean }, { rejectWithValue }) => {
    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(helperId);
        return { helperId, removed: true };
      } else {
        const response = await addFavorite(helperId);
        return { helperId, removed: false, item: response.data };
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle favorite");
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
      state.favoriteIds = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<FavoriteItem[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.favoriteIds = action.payload.map((item) => item.helper_id);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { helperId, removed, item } = action.payload;
        if (removed) {
          state.favoriteIds = state.favoriteIds.filter((id) => id !== helperId);
          state.items = state.items.filter((i) => i.helper_id !== helperId);
        } else if (item) {
          state.favoriteIds.push(helperId);
          state.items.unshift(item);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
