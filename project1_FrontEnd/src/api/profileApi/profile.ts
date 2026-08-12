import axiosInstance from "../axios";

export interface UserProfile {
  id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: "active" | "inactive" | "banned" | string;
  provider?: "local" | "google" | string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerProfile {
  id: number;
  user_id: number;
  gender?: "male" | "female" | "other" | string;
  birthday?: string;
  note?: string;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: number;
  customer_id: number;
  address: string;
  district?: string;
  city?: string;
  is_default: number;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  current_password?: string;
}

export interface UpdateCustomerProfileRequest {
  gender?: "male" | "female" | "other" | string;
  birthday?: string;
  note?: string;
}

export interface CustomerAddressRequest {
  address: string;
  district?: string;
  city?: string;
  is_default?: boolean;
}
export interface HelperProfile {
  id: number;
  user_id: number;
  bio?: string;
  experience_year?: number;
  gender?: "male" | "female" | "other" | string;
  birthday?: string;
  address?: string;
  status?: string;
  skills?: any[];
  workingAreas?: any[];
  verifications?: any[];
}

export interface UpdateHelperProfileRequest {
  bio?: string;
  experience_year?: number;
  gender?: "male" | "female" | "other" | string;
  birthday?: string;
  address?: string;
}

// 1. Lấy thông tin cá nhân của chính mình
export const getProfileApi = async (): Promise<{ data: UserProfile }> => {
  const response = await axiosInstance.get<{ data: UserProfile }>("/profile");
  return response.data;
};

// 2. Cập nhật thông tin cá nhân (đổi tên, sđt, ảnh đại diện, đổi mật khẩu)
export const updateProfileApi = async (data: UpdateProfileRequest): Promise<{ message: string; data: UserProfile }> => {
  const response = await axiosInstance.put<{ message: string; data: UserProfile }>("/profile", data);
  return response.data;
};

// 3. Lấy profile mở rộng của Customer (gender, birthday, note)
export const getCustomerProfileApi = async (): Promise<{ data: CustomerProfile }> => {
  const response = await axiosInstance.get<{ data: CustomerProfile }>("/customer/profile");
  return response.data;
};

// 4. Cập nhật profile mở rộng của Customer
export const updateCustomerProfileApi = async (data: UpdateCustomerProfileRequest): Promise<{ message: string; data: CustomerProfile }> => {
  const response = await axiosInstance.put<{ message: string; data: CustomerProfile }>("/customer/profile", data);
  return response.data;
};

// 5. Danh sách địa chỉ của Customer
export const getCustomerAddressesApi = async (): Promise<{ data: CustomerAddress[] }> => {
  const response = await axiosInstance.get<{ data: CustomerAddress[] }>("/customer/addresses");
  return response.data;
};

// 6. Thêm địa chỉ mới
export const addCustomerAddressApi = async (data: CustomerAddressRequest): Promise<{ message: string; data: CustomerAddress }> => {
  const response = await axiosInstance.post<{ message: string; data: CustomerAddress }>("/customer/addresses", data);
  return response.data;
};

// 7. Cập nhật địa chỉ theo ID
export const updateCustomerAddressApi = async (id: number, data: Partial<CustomerAddressRequest>): Promise<{ message: string; data: CustomerAddress }> => {
  const response = await axiosInstance.put<{ message: string; data: CustomerAddress }>(`/customer/addresses/${id}`, data);
  return response.data;
};

// 8. Xóa địa chỉ theo ID
export const deleteCustomerAddressApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/customer/addresses/${id}`);
  return response.data;
};

// 9. Đặt địa chỉ mặc định
export const setDefaultCustomerAddressApi = async (id: number): Promise<{ message: string; data: CustomerAddress }> => {
  const response = await axiosInstance.patch<{ message: string; data: CustomerAddress }>(`/customer/addresses/${id}/default`);
  return response.data;
};

// 10. Tải ảnh đại diện lên
export const uploadAvatarApi = async (file: File): Promise<{ message: string; url: string; data: UserProfile }> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await axiosInstance.post<{ message: string; url: string; data: UserProfile }>("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Lấy thông tin hồ sơ của helper
export const getHelperProfileApi = async (): Promise<{ data: HelperProfile | null }> => {
  const response = await axiosInstance.get<{ data: HelperProfile | null }>("/providers/helper/profile");
  return response.data;
};

// Cập nhật thông tin hồ sơ của helper
export const updateHelperProfileApi = async (data: UpdateHelperProfileRequest): Promise<{ message: string; data: HelperProfile }> => {
  try {
    const response = await axiosInstance.put<{ message: string; data: HelperProfile }>("/providers/helper/profile", data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.response?.data?.message?.includes("chưa có hồ sơ")) {
      const response = await axiosInstance.post<{ message: string; data: HelperProfile }>("/providers/helper/profile", data);
      return response.data;
    }
    throw error;
  }
};

// Lấy danh sách kỹ năng của helper
export const getHelperSkillsApi = async (): Promise<{ data: any[] }> => {
  const response = await axiosInstance.get<{ data: any[] }>("/providers/helper/skills");
  return response.data;
};

// Thêm kỹ năng cho helper
export const addHelperSkillApi = async (serviceId: number): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.post<{ message: string; data: any }>("/providers/helper/skills", { service_id: serviceId });
  return response.data;
};

// Xóa kỹ năng của helper
export const removeHelperSkillApi = async (serviceId: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/providers/helper/skills/${serviceId}`);
  return response.data;
};

// Lấy danh sách khu vực làm việc của helper
export const getHelperWorkingAreasApi = async (): Promise<{ data: any[] }> => {
  const response = await axiosInstance.get<{ data: any[] }>("/providers/helper/working-areas");
  return response.data;
};

// Thêm khu vực làm việc cho helper
export const addHelperWorkingAreaApi = async (data: { district: string; city: string }): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.post<{ message: string; data: any }>("/providers/helper/working-areas", data);
  return response.data;
};

// Xóa khu vực làm việc của helper
export const removeHelperWorkingAreaApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/providers/helper/working-areas/${id}`);
  return response.data;
};

// Gửi yêu cầu xác minh
export const submitHelperVerificationApi = async (): Promise<{ message: string; data: any }> => {
  const response = await axiosInstance.post<{ message: string; data: any }>("/providers/helper/verification");
  return response.data;
};

// Lấy trạng thái xác minh
export const getHelperVerificationStatusApi = async (): Promise<{ data: any[] }> => {
  const response = await axiosInstance.get<{ data: any[] }>("/providers/helper/verification");
  return response.data;
};

export const upgradeToHelperApi = async (): Promise<any> => {
  const response = await axiosInstance.post<any>("/profile/upgrade");
  return response.data;
};
