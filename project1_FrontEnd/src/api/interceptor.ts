import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import i18n from "../i18n";

export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
  // Request interceptor: add access token to headers & set current language
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const currentLanguage = localStorage.getItem("language") || "vn";
      if (config.headers) {
        config.headers["Accept-Language"] = currentLanguage === "vn" ? "vi" : currentLanguage;
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: handle errors & messages globally with i18n translations
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response && response.data && typeof response.data === "object" && "message" in response.data) {
        if (typeof response.data.message === "string") {
          const msg = response.data.message;
          if (i18n.exists(msg)) {
            response.data.message = i18n.t(msg);
          }
        }
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status } = error.response;
        if (status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        }
        
        const resData = error.response.data as any;
        if (resData && typeof resData === "object" && "message" in resData) {
          if (typeof resData.message === "string") {
            const msg = resData.message;
            if (i18n.exists(msg)) {
              resData.message = i18n.t(msg);
            }
          }
        }
      }
      return Promise.reject(error);
    }
  );
};
