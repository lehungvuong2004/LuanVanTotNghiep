import axiosInstance from "./axios";
import type { User } from "./usersApi/users";

export interface HelperSkill {
  id: number;
  helper_id: number;
  service_id: number;
  service?: {
    id: number;
    name: string;
    description?: string;
    base_price: number;
    price_type: string;
  };
}

export interface HelperWorkingArea {
  id: number;
  helper_id: number;
  district: string;
  city: string;
}

export interface HelperVerification {
  id: number;
  helper_id: number;
  admin_id?: number;
  status: "pending" | "approved" | "rejected";
  note?: string;
  created_at: string;
}

export interface HelperProfile {
  id: number;
  user_id: number;
  bio?: string;
  experience_year: number;
  gender?: string;
  birthday?: string;
  address?: string;
  status: "pending" | "active" | "suspended" | "rejected";
  rating_avg: number;
  total_reviews: number;
  skills?: HelperSkill[];
  workingAreas?: HelperWorkingArea[];
  verifications?: HelperVerification[];
  user?: User; // Joined user record
}

export interface GetHelpersParams {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
  search?: string;
}

export interface PaginatedHelpersResponse {
  data: {
    current_page: number;
    data: HelperProfile[];
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
}

export interface HelperStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  rejected: number;
  pending_verifications: number;
}
export interface PublicGetHelpersParams {
  city?: string;
  district?: string;
  service_id?: number | string;
  gender?: string;
  rating_min?: number;
  limit?: number;
  page?: number;
}

export interface PublicPaginatedHelpersResponse {
  data: {
    current_page: number;
    data: HelperProfile[];
    from: number;
    last_page: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface BulkAvailabilityResponse {
  message: string;
  data: {
    created: number;
    ignored: number;
    deleted: number;
  };
}

export interface HelperAvailability {
  id: number;
  helper_id: number;
  available_date: string;
  start_time: string;
  status: "available" | "booked";
}

export interface BulkAvailabilityParams {
  action: "create" | "delete";
  slots: { available_date: string; start_time: string }[];
}

export const getHelpersAdmin = async (params: GetHelpersParams): Promise<PaginatedHelpersResponse> => {
  const response = await axiosInstance.get<PaginatedHelpersResponse>("/providers/admin/helpers", { params });
  return response.data;
};

export const getHelperStatsAdmin = async (): Promise<{ data: HelperStats }> => {
  const response = await axiosInstance.get<{ data: HelperStats }>("/providers/admin/helpers/stats");
  return response.data;
};

export const getHelperDetailAdmin = async (id: number): Promise<{ data: HelperProfile }> => {
  const response = await axiosInstance.get<{ data: HelperProfile }>(`/providers/admin/helpers/${id}`);
  return response.data;
};

export const verifyHelperAdmin = async (id: number, data: { status: "approved" | "rejected"; note?: string }): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.patch<{ message: string; data: any }>(`/providers/admin/helpers/${id}/verify`, data);
  return response.data;
};

export const toggleHelperStatusAdmin = async (id: number, data: { status: "active" | "suspended"; reason?: string }): Promise<{ message: string; data: HelperProfile }> => {
  const response = await axiosInstance.patch<{ message: string; data: HelperProfile }>(`/providers/admin/helpers/${id}/status`, data);
  return response.data;
};

export const deleteHelperAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/providers/admin/helpers/${id}`);
  return response.data;
};

export const bulkDeleteHelpersAdmin = async (ids: number[]): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>("/providers/admin/helpers/bulk-delete", { ids });
  return response.data;
};

// ============================================================
//  PUBLIC — Tìm kiếm nhân viên (không cần đăng nhập)
// ============================================================

/**
 * Tìm kiếm danh sách helper công khai.
 * Endpoint: GET /providers/helpers
 */
export const getHelpersPublic = async (params?: PublicGetHelpersParams): Promise<PublicPaginatedHelpersResponse> => {
  const response = await axiosInstance.get<PublicPaginatedHelpersResponse>("/providers/helpers", { params });
  return response.data;
};

/**
 * Xem hồ sơ chi tiết của một helper công khai.
 * Endpoint: GET /providers/helpers/:id
 */
export const getHelperPublic = async (id: number): Promise<{ data: HelperProfile }> => {
  const response = await axiosInstance.get<{ data: HelperProfile }>(`/providers/helpers/${id}`);
  return response.data;
};

/**
 * Lấy thống kê bảng điều khiển cho Helper.
 * Endpoint: GET /providers/helper/dashboard-stats
 */
export const getHelperDashboardStats = async (): Promise<any> => {
  const response = await axiosInstance.get<any>("/providers/helper/dashboard-stats");
  return response.data;
};

export const getMyAvailability = async (): Promise<{ data: HelperAvailability[] }> => {
  const response = await axiosInstance.get<{ data: HelperAvailability[] }>("/providers/helper/availability");
  return response.data;
};

export const addMyAvailability = async (data: { available_date: string; start_time: string }): Promise<{ message: string; data: HelperAvailability }> => {
  const response = await axiosInstance.post<{ message: string; data: HelperAvailability }>("/providers/helper/availability", data);
  return response.data;
};

export const removeMyAvailability = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/providers/helper/availability/${id}`);
  return response.data;
};

export const clearAllMyAvailability = async (): Promise<{ message: string; data?: { deleted_count: number } }> => {
  const response = await axiosInstance.delete<{ message: string; data?: { deleted_count: number } }>("/providers/helper/availability");
  return response.data;
};

export const bulkMyAvailability = async (data: BulkAvailabilityParams): Promise<BulkAvailabilityResponse> => {
  const response = await axiosInstance.post<BulkAvailabilityResponse>("/providers/helper/availability/bulk", data);
  return response.data;
};

export interface DistrictData {
  id: number;
  city_id: number;
  name: string;
}

export interface CityData {
  id: number;
  name: string;
  districts?: DistrictData[];
}

export const getRegionsPublic = async (): Promise<{ data: CityData[] }> => {
  const response = await axiosInstance.get<{ data: CityData[] }>("/providers/regions");
  return response.data;
};

