import axiosInstance from "./axios";

export interface Report {
  id: number;
  booking_id?: number | null;
  job_post_id?: number | null;
  report_by: number;
  reported_user_id?: number | null;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
  booking?: any;
  job_post?: any;
}

export interface GetReportsParams {
  page?: number;
  limit?: number;
  status?: string;
  report_by?: number;
  reported_user_id?: number;
  booking_id?: number;
}

export interface PaginatedReportsResponse {
  data: {
    current_page: number;
    data: Report[];
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface CreateReportParams {
  booking_id?: number | null;
  job_post_id?: number | null;
  reported_user_id?: number | null;
  reason: string;
}

export interface ProcessReportAdminParams {
  status: "resolved" | "dismissed";
  note?: string;
}

// Người dùng gửi báo cáo vi phạm
export const createReportApi = async (data: CreateReportParams): Promise<{ message: string; data: Report }> => {
  const response = await axiosInstance.post<{ message: string; data: Report }>("/orders/reports", data);
  return response.data;
};

// Admin lấy danh sách báo cáo vi phạm
export const getReportsAdminApi = async (params?: GetReportsParams): Promise<PaginatedReportsResponse> => {
  const response = await axiosInstance.get<PaginatedReportsResponse>("/orders/admin/reports", { params });
  return response.data;
};

// Admin xem chi tiết báo cáo vi phạm
export const getReportAdminShowApi = async (id: number): Promise<{ data: Report }> => {
  const response = await axiosInstance.get<{ data: Report }>(`/orders/admin/reports/${id}`);
  return response.data;
};

// Admin xử lý báo cáo vi phạm (phê duyệt hoặc hủy bỏ)
export const processReportAdminApi = async (id: number, data: ProcessReportAdminParams): Promise<{ message: string; data: Report }> => {
  const response = await axiosInstance.patch<{ message: string; data: Report }>(`/orders/admin/reports/${id}/process`, data);
  return response.data;
};

// Admin xóa báo cáo vi phạm
export const deleteReportAdminApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/admin/reports/${id}`);
  return response.data;
};

// Admin xóa hàng loạt báo cáo vi phạm
export const bulkDeleteReportsAdminApi = async (ids: number[]): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>("/orders/admin/reports/bulk-delete", { data: { ids } });
  return response.data;
};
