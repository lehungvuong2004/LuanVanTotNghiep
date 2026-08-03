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

export interface GetHelperReviewsPublicParams {
  page?: number;
  limit?: number;
  rating?: number;
}

export interface CreateReviewCustomerPayload {
  helper_id: number;
  rating: number;
  comment?: string | null;
  booking_id?: number | null;
  job_post_id?: number | null;
}

export interface UpdateReviewAdminPayload {
  rating?: number;
  comment?: string | null;
}

export interface CreateReviewAdminPayload {
  customer_id: number;
  helper_id: number;
  rating: number;
  comment?: string | null;
  booking_id?: number | null;
  job_post_id?: number | null;
}

export interface UpdateReviewCustomerPayload {
  rating?: number;
  comment?: string | null;
}

// Tìm kiếm danh sách đánh giá công khai của một người giúp việc
export const getHelperReviewsPublic = async (helperId: number, params?: GetHelperReviewsPublicParams): Promise<HelperReviewsResponse> => {
  const response = await axiosInstance.get<HelperReviewsResponse>(`/orders/reviews/helper/${helperId}`, { params });
  return response.data;
};

// Khách hàng gửi đánh giá cho người giúp việc
export const createReviewCustomer = async (data: CreateReviewCustomerPayload): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.post<{ message: string; data: Review }>("/orders/reviews", data);
  return response.data;
};

// Admin lấy danh sách tất cả các đánh giá
export const getReviewsAdmin = async (params: GetReviewsParams): Promise<PaginatedReviewsResponse> => {
  const response = await axiosInstance.get<PaginatedReviewsResponse>("/orders/admin/reviews", { params });
  return response.data;
};

// Admin cập nhật thông tin một đánh giá
export const updateReviewAdmin = async (id: number, data: UpdateReviewAdminPayload): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.put<{ message: string; data: Review }>(`/orders/admin/reviews/${id}`, data);
  return response.data;
};

// Admin xóa một đánh giá
export const deleteReviewAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/admin/reviews/${id}`);
  return response.data;
};

// Admin tạo bổ sung đánh giá mới
export const createReviewAdmin = async (data: CreateReviewAdminPayload): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.post<{ message: string; data: Review }>("/orders/admin/reviews", data);
  return response.data;
};

// Khách hàng tự chỉnh sửa đánh giá của mình
export const updateReviewCustomer = async (id: number, data: UpdateReviewCustomerPayload): Promise<{ message: string; data: Review }> => {
  const response = await axiosInstance.put<{ message: string; data: Review }>(`/orders/reviews/${id}`, data);
  return response.data;
};

// Khách hàng tự xóa đánh giá của mình
export const deleteReviewCustomer = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/reviews/${id}`);
  return response.data;
};
