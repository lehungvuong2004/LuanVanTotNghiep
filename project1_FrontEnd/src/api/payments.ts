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
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    avatar?: string;
  } | null;
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
  job_post_id?: number | string;
  page?: number;
  limit?: number;
}): Promise<AdminPaymentsResponse> => {
  const response = await axiosInstance.get<AdminPaymentsResponse>("/payments/admin", {
    params });
  return response.data;
};

export interface PaymentStatsResponse {
  data: {
    total_revenue: number;
    this_month_revenue: number;
    last_month_revenue: number;
    change_percent: number;
  };
}

export const getPaymentStatsAdmin = async (): Promise<PaymentStatsResponse> => {
  const response = await axiosInstance.get<PaymentStatsResponse>("/payments/admin/stats");
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
    params });
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

// ──────────────────────────────────────────────────────────
//  Customer-facing APIs
// ──────────────────────────────────────────────────────────

export interface CreatePaymentPayload {
  booking_id?: number | null;
  job_post_id?: number | null;
  payment_method: string;
  amount: number;
}

export const createPaymentApi = async (
  payload: CreatePaymentPayload
): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.post<{ message: string; data: Payment }>(
    "/payments",
    payload
  );
  return response.data;
};

export const getMyPaymentApi = async (
  id: number
): Promise<{ data: Payment & { refunds?: Refund[] } }> => {
  const response = await axiosInstance.get<{ data: Payment & { refunds?: Refund[] } }>(
    `/payments/${id}`
  );
  return response.data;
};

export const getMyPaymentsApi = async (params?: {
  page?: number;
  limit?: number;
}): Promise<AdminPaymentsResponse> => {
  const response = await axiosInstance.get<AdminPaymentsResponse>("/payments", {
    params });
  return response.data;
};

export const simulatePaymentCallbackApi = async (
  id: number
): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.post<{ message: string; data: Payment }>(
    `/payments/${id}/callback`
  );
  return response.data;
};

export interface CreateRefundPayload {
  payment_id: number;
  amount: number;
  reason?: string;
}

export const requestRefundApi = async (
  payload: CreateRefundPayload
): Promise<{ message: string; data: Refund }> => {
  const response = await axiosInstance.post<{ message: string; data: Refund }>(
    "/payments/refunds",
    payload
  );
  return response.data;
};

export const getMyPaymentRefundsApi = async (
  paymentId: number
): Promise<{ data: Refund[] }> => {
  const response = await axiosInstance.get<{ data: Refund[] }>(
    `/payments/${paymentId}/refunds`
  );
  return response.data;
};

// ──────────────────────────────────────────────────────────
//  VNPay APIs
// ──────────────────────────────────────────────────────────

export interface CreateVnpayPayload {
  booking_id?: number | null;
  job_post_id?: number | null;
  amount: number;
  order_info?: string;
  locale?: "vn" | "en";
}

export interface CreateVnpayResponse {
  message: string;
  payment_id: number;
  payment_url: string;
}

export const createVnpayUrlApi = async (
  payload: CreateVnpayPayload
): Promise<CreateVnpayResponse> => {
  const response = await axiosInstance.post<CreateVnpayResponse>(
    "/payments/vnpay/create",
    payload
  );
  return response.data;
};

export const verifyVnpayReturnApi = async (
  queryParams: Record<string, string>
): Promise<any> => {
  const response = await axiosInstance.get("/payments/vnpay/return", {
    params: queryParams });
  return response.data;
};
