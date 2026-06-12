import axiosInstance from "./axios";
import { API_ENDPOINTS } from "./endpoints";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    data
  );
  return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    data
  );
  return response.data;
};
