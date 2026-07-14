import axiosInstance from "../axios";
import type { Service } from "../services";

export interface JobPost {
  id: number;
  customer_id: number;
  category_id: number | null;
  selected_helper_id: number | null;
  title: string;
  description: string | null;
  salary: number | string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  working_time: string | null;
  status: "open" | "closed" | "pending";
  expired_at: string | null;
  created_at: string;
  services?: Service[];
}

export interface CreateJobPostRequest {
  title: string;
  description?: string;
  category_id?: number;
  salary?: number;
  address?: string;
  district?: string;
  city?: string;
  working_time?: string;
  expired_at?: string;
  service_ids?: number[];
}

export const getJobPostsApi = async (params?: {
  city?: string;
  district?: string;
  category_id?: number | string;
  min_salary?: number;
  max_salary?: number;
  limit?: number;
  page?: number;
}): Promise<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }> => {
  const response = await axiosInstance.get<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }>("/orders/job-posts", {
    params });
  return response.data;
};

export const getJobPostDetailApi = async (id: number): Promise<{ data: JobPost }> => {
  const response = await axiosInstance.get<{ data: JobPost }>(`/orders/job-posts/${id}`);
  return response.data;
};

export const createJobPostApi = async (data: CreateJobPostRequest): Promise<{ message: string; data: JobPost }> => {
  const response = await axiosInstance.post<{ message: string; data: JobPost }>("/orders/job-posts", data);
  return response.data;
};

// xóa và cập nhật bài đăng
export const deleteJobPostApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/job-posts/${id}`);
  return response.data;
};

export const updateJobPostApi = async (
  id: number,
  data: CreateJobPostRequest
): Promise<{ message: string; data: JobPost }> => {
  const response = await axiosInstance.put<{ message: string; data: JobPost }>(`/orders/job-posts/${id}`, data);
  return response.data;
};

export const getMyJobPostsApi = async (params?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }> => {
  const response = await axiosInstance.get<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }>("/orders/my/job-posts", {
    params });
  return response.data;
};

// kiểm tra thông tin hoàn thiện trước khi đăng bài
export const applyJobPostApi = async (
  id: number,
  data?: { message?: string; proposed_price?: number }
): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.post<{ message: string; data: any }>(
    `/orders/helper/job-posts/${id}/apply`,
    data
  );
  return response.data;
};

export const getMyApplicationsApi = async (params?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: { data: any[]; total: number; current_page: number; last_page: number } }> => {
  const response = await axiosInstance.get<{ data: { data: any[]; total: number; current_page: number; last_page: number } }>(
    "/orders/helper/applications",
    { params }
  );
  return response.data;
};

// Customer: lấy danh sách ứng viên của một bài đăng
export const getApplicationsApi = async (jobPostId: number): Promise<{ data: any[] }> => {
  const response = await axiosInstance.get<{ data: any[] }>(`/orders/job-posts/${jobPostId}/applications`);
  return response.data;
};

// Customer: chấp nhận một helper
export const selectHelperApi = async (jobPostId: number, helperId: number): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.patch<{ message: string; data: any }>(`/orders/job-posts/${jobPostId}/select/${helperId}`);
  return response.data;
};

// Customer: từ chối một helper
export const rejectHelperApi = async (jobPostId: number, helperId: number): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.patch<{ message: string; data: any }>(`/orders/job-posts/${jobPostId}/reject/${helperId}`);
  return response.data;
};

// Public: lấy hồ sơ công khai helper (skills, experience, rating)
export const getHelperPublicProfileApi = async (id: number): Promise<{ data: any }> => {
  const response = await axiosInstance.get<{ data: any }>(`/providers/helpers/${id}`);
  return response.data;
};

// Helper: đồng ý hoặc từ chối lời mời của khách hàng (action: 'accept' | 'reject')
export const respondToSelectionApi = async (applicationId: number, action: "accept" | "reject"): Promise<{ message: string; booking_id?: number }> => {
  const response = await axiosInstance.patch<{ message: string; booking_id?: number }>(`/orders/helper/applications/${applicationId}/respond`, { action });
  return response.data;
};

// Helper: rút hồ sơ ứng tuyển
export const withdrawApplicationApi = async (applicationId: number): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(`/orders/helper/applications/${applicationId}/withdraw`);
  return response.data;
};

// Admin/Operator: lấy toàn bộ danh sách bài đăng
export const adminGetJobPostsApi = async (params?: {
  status?: string;
  city?: string;
  customer_id?: number | string;
  limit?: number;
  page?: number;
}): Promise<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }> => {
  const response = await axiosInstance.get<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }>("/orders/admin/job-posts", {
    params });
  return response.data;
};

// Admin/Operator: lấy chi tiết bài đăng
export const adminGetJobPostDetailApi = async (id: number): Promise<{ data: JobPost & { applications?: any[]; reviews?: any[]; reports?: any[] } }> => {
  const response = await axiosInstance.get<{ data: any }>(`/orders/admin/job-posts/${id}`);
  return response.data;
};

// Admin/Operator: cập nhật trạng thái bài đăng
export const adminUpdateJobPostStatusApi = async (
  id: number,
  status: "open" | "closed" | "pending" | "rejected",
  note?: string
): Promise<{ message: string; data: JobPost }> => {
  const response = await axiosInstance.patch<{ message: string; data: JobPost }>(`/orders/admin/job-posts/${id}/status`, {
    status,
    note });
  return response.data;
};

// Admin: xóa bài đăng (chỉ dành cho admin)
export const adminDeleteJobPostApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/admin/job-posts/${id}`);
  return response.data;
};
