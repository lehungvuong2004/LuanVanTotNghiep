import axiosInstance from "./axios";

export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  status: "active" | "inactive";
  services_count?: number;
}

export interface Service {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  base_price: number | string;
  price_type: "hourly" | "fixed" | "daily";
  status: "active" | "inactive";
  category?: ServiceCategory;
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

// Service API endpoints
export const getServicesAdmin = async (params?: {
  category_id?: number | string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminServicesResponse> => {
  const response = await axiosInstance.get<AdminServicesResponse>("/providers/admin/services", {
    params,
  });
  return response.data;
};

export const createServiceAdmin = async (data: {
  category_id: number;
  name: string;
  description?: string | null;
  base_price: number;
  price_type: "hourly" | "fixed" | "daily";
  status?: "active" | "inactive";
}): Promise<{ message: string; data: Service }> => {
  const response = await axiosInstance.post<{ message: string; data: Service }>(
    "/providers/admin/services",
    data
  );
  return response.data;
};

export const updateServiceAdmin = async (
  id: number,
  data: {
    category_id?: number;
    name?: string;
    description?: string | null;
    base_price?: number;
    price_type?: "hourly" | "fixed" | "daily";
    status?: "active" | "inactive";
  }
): Promise<{ message: string; data: Service }> => {
  const response = await axiosInstance.put<{ message: string; data: Service }>(
    `/providers/admin/services/${id}`,
    data
  );
  return response.data;
};

export const deleteServiceAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/providers/admin/services/${id}`
  );
  return response.data;
};

// Category API endpoints
export const getCategoriesAdmin = async (params?: {
  status?: string;
}): Promise<AdminCategoriesResponse> => {
  const response = await axiosInstance.get<AdminCategoriesResponse>("/providers/admin/service-categories", {
    params,
  });
  return response.data;
};


export const createCategoryAdmin = async (data: {
  name: string;
  description?: string | null;
  icon?: string | null;
  type?: "booking" | "job" | "both";
  status?: "active" | "inactive";
}): Promise<{ message: string; data: ServiceCategory }> => {
  const response = await axiosInstance.post<{ message: string; data: ServiceCategory }>(
    "/providers/admin/service-categories",
    data
  );
  return response.data;
};

export const updateCategoryAdmin = async (
  id: number,
  data: {
    name?: string;
    description?: string | null;
    icon?: string | null;
    type?: "booking" | "job" | "both";
    status?: "active" | "inactive";
  }
): Promise<{ message: string; data: ServiceCategory }> => {
  const response = await axiosInstance.put<{ message: string; data: ServiceCategory }>(
    `/providers/admin/service-categories/${id}`,
    data
  );
  return response.data;
};

export const deleteCategoryAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/providers/admin/service-categories/${id}`
  );
  return response.data;
};

// Public Category & Service API endpoints
export const getCategoriesApi = async (params?: {
  type?: string;
}): Promise<{ data: ServiceCategory[] }> => {
  const response = await axiosInstance.get<{ data: ServiceCategory[] }>("/providers/service-categories", {
    params,
  });
  return response.data;
};

export const getServicesApi = async (params?: {
  category_id?: number | string;
  price_type?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  page?: number;
}): Promise<{ data: { data: Service[]; total: number; current_page: number; last_page: number } }> => {
  const response = await axiosInstance.get<{ data: { data: Service[]; total: number; current_page: number; last_page: number } }>("/providers/services", {
    params,
  });
  return response.data;
};

