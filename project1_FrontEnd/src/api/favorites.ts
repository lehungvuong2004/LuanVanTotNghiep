import axiosInstance from "./axios";
import type { HelperProfile } from "./helpers";

export interface FavoriteItem {
  id: number;
  customer_id: number;
  helper_id: number;
  created_at: string;
  helper_profile?: HelperProfile;
}

export interface PaginatedFavoritesResponse {
  data: {
    current_page: number;
    data: FavoriteItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export const getFavorites = async (params?: { page?: number; limit?: number }): Promise<PaginatedFavoritesResponse> => {
  const response = await axiosInstance.get<PaginatedFavoritesResponse>("/providers/favorites", { params });
  return response.data;
};

export const addFavorite = async (helperId: number): Promise<{ message: string; data: FavoriteItem }> => {
  const response = await axiosInstance.post<{ message: string; data: FavoriteItem }>(`/providers/favorites/${helperId}`);
  return response.data;
};

export const removeFavorite = async (helperId: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/providers/favorites/${helperId}`);
  return response.data;
};

export const checkFavorite = async (helperId: number): Promise<{ data: { is_favorite: boolean } }> => {
  const response = await axiosInstance.get<{ data: { is_favorite: boolean } }>(`/providers/favorites/${helperId}/check`);
  return response.data;
};
