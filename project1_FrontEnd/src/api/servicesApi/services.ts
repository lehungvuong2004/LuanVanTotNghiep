import axiosInstance from "../axios";
export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  status: "active" | "inactive";
  services_count?: number;
  services?: Service[];
}

export interface Service {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  base_price: number | string;
  price_type: "hourly" | "fixed" | "daily";
  status: "active" | "inactive";
  image: string | null;
  category?: ServiceCategory;
  helpers_count?: number;
  total_reviews?: number;
  avg_rating?: number;
}
export interface AdminServicesResponse {
  data: {
    current_page: number;
    data: Service[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
  };
}

export interface AdminCategoriesResponse {
  data: ServiceCategory[];
}

export interface GetServicesAdminParams {
  category_id?: number | string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateServiceAdminRequest {
  category_id: number;
  name: string;
  description?: string | null;
  base_price: number;
  price_type: "hourly" | "fixed" | "daily";
  status?: "active" | "inactive";
  image?: string | null;
}

export interface ServiceMutateResponse {
  message: string;
  data: Service;
}

export interface UpdateServiceAdminRequest {
  category_id?: number;
  name?: string;
  description?: string | null;
  base_price?: number;
  price_type?: "hourly" | "fixed" | "daily";
  status?: "active" | "inactive";
  image?: string | null;
}

export interface ServiceDeleteResponse {
  message: string;
}

export interface UploadServiceImageResponse {
  message: string;
  data: {
    url: string;
    path: string;
  };
}

export interface GetCategoriesAdminParams {
  status?: string;
}

export interface CreateCategoryAdminRequest {
  name: string;
  description?: string | null;
  icon?: string | null;
  type?: "booking" | "job" | "both";
  status?: "active" | "inactive";
}

export interface CategoryMutateResponse {
  message: string;
  data: ServiceCategory;
}

export interface UpdateCategoryAdminRequest {
  name?: string;
  description?: string | null;
  icon?: string | null;
  type?: "booking" | "job" | "both";
  status?: "active" | "inactive";
}

export interface GetCategoriesParams {
  type?: string;
}

export interface CategoriesResponse {
  data: ServiceCategory[];
}

export interface GetServicesParams {
  category_id?: number | string;
  price_type?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  page?: number;
}

export interface ServicesListResponse {
  data: {
    data: Service[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

export interface RatingStats {
  total_reviews: number;
  avg_rating: number;
  rating_distribution: Record<number, number>;
}

export interface ServiceDetailResponse {
  data: Service;
  helpers_count: number;
  helpers: any[];
  rating_stats: RatingStats | null;
}

export interface GetServiceHelpersParams {
  city?: string;
  district?: string;
  rating_min?: number;
  limit?: number;
  page?: number;
}

export interface ServiceHelpersResponse {
  data: any;
}

// Lấy danh sách dịch vụ phía Admin (hỗ trợ lọc danh mục, trạng thái và phân trang).
export const getServicesAdmin = async (params?: GetServicesAdminParams): Promise<AdminServicesResponse> => {
  const response = await axiosInstance.get<AdminServicesResponse>("/providers/admin/services", { params });
  return response.data;
};

// Tạo mới một dịch vụ trong hệ thống.
export const createServiceAdmin = async (data: CreateServiceAdminRequest): Promise<ServiceMutateResponse> => {
  const response = await axiosInstance.post<ServiceMutateResponse>("/providers/admin/services", data);
  return response.data;
};

// Cập nhật thông tin chi tiết của một dịch vụ.
export const updateServiceAdmin = async (id: number, data: UpdateServiceAdminRequest): Promise<ServiceMutateResponse> => {
  const response = await axiosInstance.put<ServiceMutateResponse>(`/providers/admin/services/${id}`, data);
  return response.data;
};

// Xóa một dịch vụ theo ID.
export const deleteServiceAdmin = async (id: number): Promise<ServiceDeleteResponse> => {
  const response = await axiosInstance.delete<ServiceDeleteResponse>(`/providers/admin/services/${id}`);
  return response.data;
};

// Tải lên hình ảnh minh họa cho dịch vụ.
export const uploadServiceImageAdmin = async (file: File): Promise<UploadServiceImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("file", file);
  const response = await axiosInstance.post<UploadServiceImageResponse>("/providers/admin/services/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ─── ADMIN CATEGORY ENDPOINTS (Quản trị viên quản lý danh mục dịch vụ) ──────────

// Lấy danh sách danh mục dịch vụ phía Admin.
export const getCategoriesAdmin = async (params?: GetCategoriesAdminParams): Promise<AdminCategoriesResponse> => {
  const response = await axiosInstance.get<AdminCategoriesResponse>("/providers/admin/service-categories", { params });
  return response.data;
};

// Tạo mới một danh mục dịch vụ.
export const createCategoryAdmin = async (data: CreateCategoryAdminRequest): Promise<CategoryMutateResponse> => {
  const response = await axiosInstance.post<CategoryMutateResponse>("/providers/admin/service-categories", data);
  return response.data;
};

// Cập nhật thông tin danh mục dịch vụ theo ID.
export const updateCategoryAdmin = async (id: number, data: UpdateCategoryAdminRequest): Promise<CategoryMutateResponse> => {
  const response = await axiosInstance.put<CategoryMutateResponse>(`/providers/admin/service-categories/${id}`, data);
  return response.data;
};

// Xóa một danh mục dịch vụ theo ID.
export const deleteCategoryAdmin = async (id: number): Promise<ServiceDeleteResponse> => {
  const response = await axiosInstance.delete<ServiceDeleteResponse>(`/providers/admin/service-categories/${id}`);
  return response.data;
};

// Lấy danh sách danh mục dịch vụ công khai (cho trang chủ, thanh tìm kiếm).
export const getCategoriesApi = async (params?: GetCategoriesParams): Promise<CategoriesResponse> => {
  const response = await axiosInstance.get<CategoriesResponse>("/providers/service-categories", { params });
  return response.data;
};

// Lấy danh sách dịch vụ công khai với bộ lọc khoảng giá, phân trang và danh mục.
export const getServicesApi = async (params?: GetServicesParams): Promise<ServicesListResponse> => {
  const response = await axiosInstance.get<ServicesListResponse>("/providers/services", { params });
  return response.data;
};

// Lấy danh sách dịch vụ phong phú (kèm số lượng helper năng lực và điểm đánh giá trung bình).
// Dùng để render giao diện danh sách gói dịch vụ nổi bật ngoài trang chủ.
export const getServicesEnrichedApi = async (params?: GetServicesParams): Promise<ServicesListResponse> => {
  const response = await axiosInstance.get<ServicesListResponse>("/providers/services/enriched", { params });
  return response.data;
};

// Lấy thông tin chi tiết một dịch vụ cụ thể theo ID (kèm thông tin thống kê xếp hạng đánh giá và gợi ý helpers).
// Dùng khi user click vào xem chi tiết một gói dịch vụ để chuẩn bị đặt dịch vụ.
export const getServiceDetailApi = async (id: number): Promise<ServiceDetailResponse> => {
  const response = await axiosInstance.get<ServiceDetailResponse>(`/providers/services/${id}`);
  return response.data;
};

// Lấy danh sách những người giúp việc làm dịch vụ này (hỗ trợ lọc theo thành phố, quận huyện, đánh giá tối thiểu).
// Dùng để lọc tìm người giúp việc phù hợp khi khách hàng đặt lịch dịch vụ đó.
export const getServiceHelpersApi = async (id: number, params?: GetServiceHelpersParams): Promise<ServiceHelpersResponse> => {
  const response = await axiosInstance.get<ServiceHelpersResponse>(`/providers/services/${id}/helpers`, { params });
  return response.data;
};
