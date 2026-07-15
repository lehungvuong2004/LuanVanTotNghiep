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

// CUSTOMER / HELPER — Submit a report
export const createReportApi = async (data: CreateReportParams): Promise<{ message: string; data: Report }> => {
  const response = await axiosInstance.post<{ message: string; data: Report }>("/orders/reports", data);
  return response.data;
};

// ADMIN / OPERATOR — List all violation reports
export const getReportsAdminApi = async (params?: GetReportsParams): Promise<PaginatedReportsResponse> => {
  const response = await axiosInstance.get<PaginatedReportsResponse>("/orders/admin/reports", { params });
  return response.data;
};

// ADMIN / OPERATOR — Get single violation report details
export const getReportAdminShowApi = async (id: number): Promise<{ data: Report }> => {
  const response = await axiosInstance.get<{ data: Report }>(`/orders/admin/reports/${id}`);
  return response.data;
};

// ADMIN / OPERATOR — Process (resolve or dismiss) a report
export const processReportAdminApi = async (id: number, data: { status: "resolved" | "dismissed"; note?: string }): Promise<{ message: string; data: Report }> => {
  const response = await axiosInstance.patch<{ message: string; data: Report }>(`/orders/admin/reports/${id}/process`, data);
  return response.data;
};

// ADMIN / OPERATOR — Delete a report
export const deleteReportAdminApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/orders/admin/reports/${id}`);
  return response.data;
};

// ADMIN / OPERATOR — Bulk delete reports
export const bulkDeleteReportsAdminApi = async (ids: number[]): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>("/orders/admin/reports/bulk-delete", { data: { ids } });
  return response.data;
};
