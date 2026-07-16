import axiosInstance from "../axios";

export interface User {
  id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "active" | "inactive" | "banned";
  provider: string;
  created_at: string;
  updated_at?: string;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role_id?: string | number;
  status?: string;
  search?: string;
}

export interface PaginatedUsersResponse {
  type: string;
  data: {
    current_page: number;
    data: User[];
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
  role_counts?: {
    admin: number;
    operator: number;
    helper: number;
    customer: number;
    total: number;
  };
}

export const getUsersAdmin = async (params: GetUsersParams): Promise<PaginatedUsersResponse> => {
  const response = await axiosInstance.get<PaginatedUsersResponse>("/admin/users", { params });
  return response.data;
};

export const createUserAdmin = async (data: any): Promise<{ message: string; data: User }> => {
  const response = await axiosInstance.post<{ message: string; data: User }>("/admin/users", data);
  return response.data;
};

export const updateUserAdmin = async (id: number, data: any): Promise<{ message: string; data: User }> => {
  const response = await axiosInstance.put<{ message: string; data: User }>(`/admin/users/${id}`, data);
  return response.data;
};

export const toggleUserStatusAdmin = async (id: number, data: { status: string; reason?: string }): Promise<{ message: string; data: User }> => {
  const response = await axiosInstance.patch<{ message: string; data: User }>(`/admin/users/${id}/status`, data);
  return response.data;
};

export const deleteUserAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/admin/users/${id}`);
  return response.data;
};

export const bulkDeleteUsersAdmin = async (ids: number[]): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>("/admin/users/bulk-delete", { ids });
  return response.data;
};

export const uploadUserAvatarAdmin = async (file: File): Promise<{ message: string; path: string; url: string }> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosInstance.post<{ message: string; path: string; url: string }>("/admin/users/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data" } });
  return response.data;
};
