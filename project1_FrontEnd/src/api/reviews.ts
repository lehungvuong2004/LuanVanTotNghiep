import axiosInstance from "./axios";

export interface Review {
  id: number;
  booking_id?: number | null;
  job_post_id?: number | null;
  customer_id: number;
  helper_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  helper_id?: number;
  customer_id?: number;
  rating?: number;
  booking_id?: number;
}

export interface PaginatedReviewsResponse {
  data: {
    current_page: number;
    data: Review[];
    last_page: number;
    total: number;
    per_page: number;
  };
}

export const getReviewsAdmin = async (params: GetReviewsParams): Promise<PaginatedReviewsResponse> => {
  const response = await axiosInstance.get<PaginatedReviewsResponse>("/orders/admin/reviews", { params });
  return response.data;
};

export const updateReviewAdmin = async (id: number, data: { rating?: number; comment?: string | null }): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.put<{ message: string; data: Review }>(`/orders/admin/reviews/${id}`, data);
  return response.data;
};

export const deleteReviewAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/admin/reviews/${id}`);
  return response.data;
};
