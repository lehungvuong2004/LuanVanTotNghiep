import axiosInstance from "../axios";

export interface Banner {
  id: number;
  title: string;
  image: string;
  link: string | null;
  status: "active" | "inactive";
  created_by: number | null;
  created_at?: string;
  updated_at?: string;
  creator?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface AdminBannersResponse {
  data: {
    current_page: number;
    data: Banner[];
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

export interface PublicBannersResponse {
  data: Banner[];
}

export const getBannersPublic = async (): Promise<PublicBannersResponse> => {
  const response = await axiosInstance.get<PublicBannersResponse>("/banners");
  return response.data;
};

export const getBannersAdmin = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminBannersResponse> => {
  const response = await axiosInstance.get<AdminBannersResponse>("/admin/banners", {
    params,
  });
  return response.data;
};

export const createBannerAdmin = async (data: {
  title: string;
  image: string;
  link?: string | null;
  status?: "active" | "inactive";
}): Promise<{ message: string; data: Banner }> => {
  const response = await axiosInstance.post<{ message: string; data: Banner }>(
    "/admin/banners",
    data
  );
  return response.data;
};

export const updateBannerAdmin = async (
  id: number,
  data: {
    title?: string;
    image?: string;
    link?: string | null;
    status?: "active" | "inactive";
  }
): Promise<{ message: string; data: Banner }> => {
  const response = await axiosInstance.put<{ message: string; data: Banner }>(
    `/admin/banners/${id}`,
    data
  );
  return response.data;
};

export const toggleBannerStatusAdmin = async (
  id: number,
  status: "active" | "inactive"
): Promise<{ message: string; data: Banner }> => {
  const response = await axiosInstance.patch<{ message: string; data: Banner }>(
    `/admin/banners/${id}/status`,
    { status }
  );
  return response.data;
};

export const deleteBannerAdmin = async (
  id: number
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/admin/banners/${id}`
  );
  return response.data;
};

export const uploadBannerImage = async (file: File): Promise<{ message: string; url: string; path: string }> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosInstance.post<{ message: string; url: string; path: string }>(
    "/admin/banners/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
