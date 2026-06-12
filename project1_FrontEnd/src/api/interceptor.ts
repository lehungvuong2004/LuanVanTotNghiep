import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
  // Request interceptor: add access token to headers
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: handle errors globally
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status } = error.response;
        if (status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        }
      }
      return Promise.reject(error);
    }
  );
};
