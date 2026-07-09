import { apiGet, apiPost, apiPatch, apiDelete } from "./constantAPI";
import type { User } from "./users";

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


export const getHelpersAdmin = async (params: GetHelpersParams): Promise<PaginatedHelpersResponse> => {
  return apiGet<PaginatedHelpersResponse>("/providers/admin/helpers", params);
};

export const getHelperStatsAdmin = async (): Promise<{ data: HelperStats }> => {
  return apiGet<{ data: HelperStats }>("/providers/admin/helpers/stats");
};

export const getHelperDetailAdmin = async (id: number): Promise<{ data: HelperProfile }> => {
  return apiGet<{ data: HelperProfile }>(`/providers/admin/helpers/${id}`);
};

export const verifyHelperAdmin = async (id: number, data: { status: "approved" | "rejected"; note?: string }): Promise<{ message: string; data: any }> => {
  return apiPatch<{ message: string; data: any }>(`/providers/admin/helpers/${id}/verify`, data);
};

export const toggleHelperStatusAdmin = async (id: number, data: { status: "active" | "suspended"; reason?: string }): Promise<{ message: string; data: HelperProfile }> => {
  return apiPatch<{ message: string; data: HelperProfile }>(`/providers/admin/helpers/${id}/status`, data);
};

export const deleteHelperAdmin = async (id: number): Promise<{ message: string }> => {
  return apiDelete<{ message: string }>(`/providers/admin/helpers/${id}`);
};

export const bulkDeleteHelpersAdmin = async (ids: number[]): Promise<{ message: string }> => {
  return apiPost<{ message: string }>("/providers/admin/helpers/bulk-delete", { ids });
};

// ============================================================
//  PUBLIC — Tìm kiếm nhân viên (không cần đăng nhập)
// ============================================================


/**
 * Tìm kiếm danh sách helper công khai.
 * Endpoint: GET /providers/helpers
 */
export const getHelpersPublic = async (
  params?: PublicGetHelpersParams
): Promise<PublicPaginatedHelpersResponse> => {
  return apiGet<PublicPaginatedHelpersResponse>("/providers/helpers", params);
};

/**
 * Xem hồ sơ chi tiết của một helper công khai.
 * Endpoint: GET /providers/helpers/:id
 */
export const getHelperPublic = async (
  id: number
): Promise<{ data: HelperProfile }> => {
  return apiGet<{ data: HelperProfile }>(`/providers/helpers/${id}`);
};

/**
 * Lấy thống kê bảng điều khiển cho Helper.
 * Endpoint: GET /providers/helper/dashboard-stats
 */
export const getHelperDashboardStats = async (): Promise<any> => {
  return apiGet<any>("/providers/helper/dashboard-stats");
};
