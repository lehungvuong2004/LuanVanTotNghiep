import axiosInstance from "./axios";

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  summary: string | null;
  content: string;
  status: "draft" | "published";
  created_by: number | null;
  created_at: string;
  updated_at: string | null;
  creator?: {
    id: number;
    full_name: string;
    avatar: string | null;
  };
  author?: {
    id: number;
    full_name: string;
    avatar: string | null;
  };
}

export interface NewsListResponse {
  data: {
    current_page: number;
    data: NewsItem[];
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

export interface NewsDetailResponse {
  data: NewsItem;
}

export const getNewsList = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<NewsListResponse> => {
  const response = await axiosInstance.get<NewsListResponse>("/news", { params });
  return response.data;
};

export const getNewsDetail = async (slug: string): Promise<NewsDetailResponse> => {
  const response = await axiosInstance.get<NewsDetailResponse>(`/news/${slug}`);
  return response.data;
};

// Admin endpoints
export const getNewsAdmin = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<NewsListResponse> => {
  const response = await axiosInstance.get<NewsListResponse>("/admin/news", { params });
  return response.data;
};

export const createNewsAdmin = async (data: {
  title: string;
  thumbnail?: string | null;
  summary?: string | null;
  content: string;
  status: "draft" | "published";
}): Promise<{ message: string; data: NewsItem }> => {
  const response = await axiosInstance.post<{ message: string; data: NewsItem }>("/admin/news", data);
  return response.data;
};

export const updateNewsAdmin = async (id: number, data: {
  title?: string;
  thumbnail?: string | null;
  summary?: string | null;
  content?: string;
  status?: "draft" | "published";
}): Promise<{ message: string; data: NewsItem }> => {
  const response = await axiosInstance.put<{ message: string; data: NewsItem }>(`/admin/news/${id}`, data);
  return response.data;
};

export const toggleNewsStatusAdmin = async (id: number, status: "draft" | "published"): Promise<{ message: string; data: NewsItem }> => {
  const response = await axiosInstance.patch<{ message: string; data: NewsItem }>(`/admin/news/${id}/status`, { status });
  return response.data;
};

export const deleteNewsAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/admin/news/${id}`);
  return response.data;
};

export interface UploadNewsImageResponse {
  message: string;
  path: string;
  url: string;
}

export const uploadNewsImage = async (file: File): Promise<UploadNewsImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosInstance.post<UploadNewsImageResponse>("/admin/news/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data" } });
  return response.data;
};

