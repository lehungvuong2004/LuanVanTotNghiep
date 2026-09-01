import axiosInstance from "./axios";
export interface ActivityLogUser {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string;
  created_at: string;
  user?: ActivityLogUser;
}

export interface PaginatedActivityLogs {
  current_page: number;
  data: ActivityLog[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const getActivityLogsAdmin = async (params?: { search?: string; user_id?: number | string; page?: number; limit?: number }): Promise<PaginatedActivityLogs> => {
  const response = await axiosInstance.get<PaginatedActivityLogs>("/admin/activity-logs", { params });
  return response.data;
};

export const deleteActivityLogAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/admin/activity-logs/${id}`);
  return response.data;
};

export const clearActivityLogsAdmin = async (): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>("/admin/activity-logs-clear");
  return response.data;
};
