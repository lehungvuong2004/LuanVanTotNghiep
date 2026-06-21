import axiosInstance from "./axios";

export interface Payment {
  id: number;
  booking_id: number | null;
  job_post_id: number | null;
  payment_method: string | null;
  transaction_code: string | null;
  amount: number | string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  paid_at: string | null;
  created_at: string;
}

export interface Refund {
  id: number;
  payment_id: number;
  amount: number | string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  payment?: Payment;
}

export interface AdminPaymentsResponse {
  data: {
    current_page: number;
    data: Payment[];
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

export interface AdminRefundsResponse {
  data: {
    current_page: number;
    data: Refund[];
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

export const getPaymentsAdmin = async (params?: {
  status?: string;
  payment_method?: string;
  booking_id?: number | string;
  page?: number;
  limit?: number;
}): Promise<AdminPaymentsResponse> => {
  const response = await axiosInstance.get<AdminPaymentsResponse>("/payments/admin", {
    params,
  });
  return response.data;
};

export const updatePaymentStatusAdmin = async (
  id: number,
  status: "pending" | "completed" | "failed" | "refunded"
): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.patch<{ message: string; data: Payment }>(
    `/payments/admin/${id}/status`,
    { status }
  );
  return response.data;
};

export const getRefundsAdmin = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminRefundsResponse> => {
  const response = await axiosInstance.get<AdminRefundsResponse>("/payments/admin/refunds", {
    params,
  });
  return response.data;
};

export const processRefundAdmin = async (
  id: number,
  status: "approved" | "rejected" | "completed"
): Promise<{ message: string; data: Refund }> => {
  const response = await axiosInstance.patch<{ message: string; data: Refund }>(
    `/payments/admin/refunds/${id}/process`,
    { status }
  );
  return response.data;
};
