import axiosInstance from "../axios";

export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const { data } = await axiosInstance.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: object): Promise<T> {
  const { data } = await axiosInstance.post<T>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: object): Promise<T> {
  const { data } = await axiosInstance.patch<T>(url, body);
  return data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await axiosInstance.delete<T>(url);
  console.log("delete result", data);
  return data;
}