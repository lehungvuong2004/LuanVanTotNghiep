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
    params,
  });
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

export const getMyJobPostsApi = async (params?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }> => {
  const response = await axiosInstance.get<{ data: { data: JobPost[]; total: number; current_page: number; last_page: number } }>("/orders/my/job-posts", {
    params,
  });
  return response.data;
};
