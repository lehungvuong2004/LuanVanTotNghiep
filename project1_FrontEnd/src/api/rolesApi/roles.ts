import axiosInstance from "../axios";
export interface Permission {
  id: number;
  name: string;
  module: string;
  description?: string;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export const getRolesAdmin = async (): Promise<Role[]> => {
  const response = await axiosInstance.get<Role[]>("/admin/roles");
  return response.data;
};

export const createRoleAdmin = async (data: { name: string; description?: string; permissions?: number[] }): Promise<Role> => {
  const response = await axiosInstance.post<Role>("/admin/roles", data);
  return response.data;
};

export const updateRoleAdmin = async (id: number, data: { name?: string; description?: string; permissions?: number[] }): Promise<Role> => {
  const response = await axiosInstance.put<Role>(`/admin/roles/${id}`, data);
  return response.data;
};

export const deleteRoleAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/admin/roles/${id}`);
  return response.data;
};

export const getPermissionsAdmin = async (): Promise<Permission[]> => {
  const response = await axiosInstance.get<Permission[]>("/admin/permissions");
  return response.data;
};
