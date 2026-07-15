import axiosInstance from "./axios";

export interface Contact {
  id: number;
  full_name: string;
  phone?: string | null;
  email: string;
  message: string;
  status: "pending" | "processed";
  processed_by?: number | null;
  processed_at?: string | null;
  created_at: string;
  processed_by_user?: {
    id: number;
    full_name: string;
    email: string;
  } | null;
}

export interface GetContactsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedContactsResponse {
  data: {
    current_page: number;
    data: Contact[];
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface CreateContactParams {
  full_name: string;
  phone?: string;
  email: string;
  message: string;
}

// PUBLIC — Submit contact form
export const createContactApi = async (data: CreateContactParams): Promise<{ message: string; data: Contact }> => {
  const response = await axiosInstance.post<{ message: string; data: Contact }>("/contacts", data);
  return response.data;
};

// ADMIN / OPERATOR — List contacts
export const getContactsAdminApi = async (params?: GetContactsParams): Promise<PaginatedContactsResponse> => {
  const response = await axiosInstance.get<PaginatedContactsResponse>("/admin/contacts", { params });
  return response.data;
};

// ADMIN / OPERATOR — Process contact
export const processContactAdminApi = async (id: number): Promise<{ message: string; data: Contact }> => {
  const response = await axiosInstance.patch<{ message: string; data: Contact }>(`/admin/contacts/${id}/process`);
  return response.data;
};

// ADMIN / OPERATOR — Delete contact
export const deleteContactAdminApi = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/admin/contacts/${id}`);
  return response.data;
};
