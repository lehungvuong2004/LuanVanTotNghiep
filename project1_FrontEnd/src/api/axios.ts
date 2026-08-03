import axios from "axios";
import { setupInterceptors } from "./interceptor";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

setupInterceptors(axiosInstance);

export default axiosInstance;
