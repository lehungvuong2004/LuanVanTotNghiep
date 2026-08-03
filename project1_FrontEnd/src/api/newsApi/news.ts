import axiosInstance from "../axios";
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

export interface GetNewsListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface GetNewsAdminParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateNewsAdminRequest {
  title: string;
  thumbnail?: string | null;
  summary?: string | null;
  content: string;
  status: "draft" | "published";
}

export interface UpdateNewsAdminRequest {
  title?: string;
  thumbnail?: string | null;
  summary?: string | null;
  content?: string;
  status?: "draft" | "published";
}

export interface NewsAdminMutateResponse {
  message: string;
  data: NewsItem;
}

export interface DeleteNewsAdminResponse {
  message: string;
}

export interface UploadNewsImageResponse {
  message: string;
  path: string;
  url: string;
}

// Lấy danh sách tin tức công khai hiển thị trên trang chủ hoặc trang tin tức.
export const getNewsList = async (params?: GetNewsListParams): Promise<NewsListResponse> => {
  const response = await axiosInstance.get<NewsListResponse>("/news", { params });
  return response.data;
};

// Lấy thông tin chi tiết một bài viết tin tức dựa trên slug.
export const getNewsDetail = async (slug: string): Promise<NewsDetailResponse> => {
  const response = await axiosInstance.get<NewsDetailResponse>(`/news/${slug}`);
  return response.data;
};

//  Quản trị viên (Admin/Operator) lấy danh sách tin tức (hỗ trợ phân trang, tìm kiếm và lọc trạng thái).
export const getNewsAdmin = async (params?: GetNewsAdminParams): Promise<NewsListResponse> => {
  const response = await axiosInstance.get<NewsListResponse>("/admin/news", { params });
  return response.data;
};

// Quản trị viên (Admin/Operator) tạo mới bài viết tin tức.
export const createNewsAdmin = async (data: CreateNewsAdminRequest): Promise<NewsAdminMutateResponse> => {
  const response = await axiosInstance.post<NewsAdminMutateResponse>("/admin/news", data);
  return response.data;
};

// Quản trị viên (Admin/Operator) cập nhật nội dung bài viết tin tức theo ID.
export const updateNewsAdmin = async (id: number, data: UpdateNewsAdminRequest): Promise<NewsAdminMutateResponse> => {
  const response = await axiosInstance.put<NewsAdminMutateResponse>(`/admin/news/${id}`, data);
  return response.data;
};

// Quản trị viên (Admin/Operator) thay đổi nhanh trạng thái ẩn/hiện (nháp/xuất bản) của tin tức.
export const toggleNewsStatusAdmin = async (id: number, status: "draft" | "published"): Promise<NewsAdminMutateResponse> => {
  const response = await axiosInstance.patch<NewsAdminMutateResponse>(`/admin/news/${id}/status`, { status });
  return response.data;
};

// Quản trị viên (Admin/Operator) xóa tin tức vĩnh viễn khỏi hệ thống.
export const deleteNewsAdmin = async (id: number): Promise<DeleteNewsAdminResponse> => {
  const response = await axiosInstance.delete<DeleteNewsAdminResponse>(`/admin/news/${id}`);
  return response.data;
};

// Quản trị viên (Admin/Operator) tải ảnh bìa/ảnh minh họa cho bài viết tin tức.
export const uploadNewsImage = async (file: File): Promise<UploadNewsImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosInstance.post<UploadNewsImageResponse>("/admin/news/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
