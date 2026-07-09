import axiosInstance from "./axios";

export interface ReviewCustomer {
  id: number;
  full_name: string;
  avatar?: string;
  email?: string;
}

export interface Review {
  id: number;
  booking_id?: number | null;
  job_post_id?: number | null;
  customer_id: number;
  helper_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
  customer?: ReviewCustomer | null;
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
  rating_stats?: Record<number, number>;
}

export interface HelperReviewsResponse {
  helper_id: number;
  rating_avg: number | null;
  total_reviews: number;
  rating_distribution: Record<number, number>;
  data: {
    current_page: number;
    data: Review[];
    last_page: number;
    total: number;
    per_page: number;
  };
}
//  PUBLIC — Reviews for a helper (enriched with customer info)
export const getHelperReviewsPublic = async (helperId: number, params?: { page?: number; limit?: number; rating?: number }): Promise<HelperReviewsResponse> => {
  const response = await axiosInstance.get<HelperReviewsResponse>(`/orders/reviews/helper/${helperId}`, { params });
  return response.data;
};

//  CUSTOMER — Submit a review
export const createReviewCustomer = async (data: {
  helper_id: number;
  rating: number;
  comment?: string | null;
  booking_id?: number | null;
  job_post_id?: number | null;
}): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.post<{ message: string; data: Review }>("/orders/reviews", data);
  return response.data;
};

//  ADMIN — Review management
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

export const createReviewAdmin = async (data: {
  customer_id: number;
  helper_id: number;
  rating: number;
  comment?: string | null;
  booking_id?: number | null;
  job_post_id?: number | null;
}): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.post<{ message: string; data: Review }>("/orders/admin/reviews", data);
  return response.data;
};

//  CUSTOMER — Edit & Delete reviews
export const updateReviewCustomer = async (id: number, data: { rating?: number; comment?: string | null }): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.put<{ message: string; data: Review }>(`/orders/reviews/${id}`, data);
  return response.data;
};

export const deleteReviewCustomer = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/reviews/${id}`);
  return response.data;
};
