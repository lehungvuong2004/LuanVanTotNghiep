import axiosInstance from "./axios";

export interface Payment {
  id: number;
  booking_id: number | null;
  job_post_id: number | null;
  payment_method: string | null;
  transaction_code: string | null;
  amount: number | string | null;
  gross_amount: number | string | null;
  commission_rate: number | null;
  commission_amount: number | string | null;
  earned_amount: number | string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  paid_at: string | null;
  released_at: string | null;
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

export interface PaymentStatsResponse {
  data: {
    total_revenue: number;
    total_sales: number;
    this_month_revenue: number;
    last_month_revenue: number;
    change_percent: number;
  };
}

export interface CreatePaymentPayload {
  booking_id?: number | null;
  job_post_id?: number | null;
  payment_method: string;
  amount: number;
}

export interface CreateRefundPayload {
  payment_id: number;
  amount: number;
  reason?: string;
}

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

export interface GetPaymentsAdminParams {
  status?: string;
  payment_method?: string;
  booking_id?: number | string;
  job_post_id?: number | string;
  page?: number;
  limit?: number;
}

export interface GetRefundsAdminParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetMyPaymentsParams {
  page?: number;
  limit?: number;
}

// Admin lấy danh sách các giao dịch thanh toán
export const getPaymentsAdmin = async (params?: GetPaymentsAdminParams): Promise<AdminPaymentsResponse> => {
  const response = await axiosInstance.get<AdminPaymentsResponse>("/payments/admin", {
    params,
  });
  return response.data;
};

// Admin lấy thông số thống kê doanh thu thanh toán
export const getPaymentStatsAdmin = async (): Promise<PaymentStatsResponse> => {
  const response = await axiosInstance.get<PaymentStatsResponse>("/payments/admin/stats");
  return response.data;
};

// Admin cập nhật thủ công trạng thái giao dịch thanh toán
export const updatePaymentStatusAdmin = async (id: number, status: "pending" | "completed" | "failed" | "refunded"): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.patch<{ message: string; data: Payment }>(`/payments/admin/${id}/status`, { status });
  return response.data;
};

// Admin lấy danh sách yêu cầu hoàn tiền
export const getRefundsAdmin = async (params?: GetRefundsAdminParams): Promise<AdminRefundsResponse> => {
  const response = await axiosInstance.get<AdminRefundsResponse>("/payments/admin/refunds", {
    params,
  });
  return response.data;
};

// Admin xử lý phê duyệt/từ chối yêu cầu hoàn tiền
export const processRefundAdmin = async (id: number, status: "approved" | "rejected" | "completed"): Promise<{ message: string; data: Refund }> => {
  const response = await axiosInstance.patch<{ message: string; data: Refund }>(`/payments/admin/refunds/${id}/process`, { status });
  return response.data;
};

// Khởi tạo một giao dịch thanh toán mới (phương thức thủ công/tiền mặt)
export const createPaymentApi = async (payload: CreatePaymentPayload): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.post<{ message: string; data: Payment }>("/payments", payload);
  return response.data;
};

// Lấy thông tin chi tiết một giao dịch thanh toán của tôi
export const getMyPaymentApi = async (id: number): Promise<{ data: Payment & { refunds?: Refund[] } }> => {
  const response = await axiosInstance.get<{ data: Payment & { refunds?: Refund[] } }>(`/payments/${id}`);
  return response.data;
};

// Lấy danh sách lịch sử giao dịch thanh toán của tôi
export const getMyPaymentsApi = async (params?: GetMyPaymentsParams): Promise<AdminPaymentsResponse> => {
  const response = await axiosInstance.get<AdminPaymentsResponse>("/payments", {
    params,
  });
  return response.data;
};

// Mô phỏng callback phản hồi thanh toán (dùng cho môi trường thử nghiệm)
export const simulatePaymentCallbackApi = async (id: number): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.post<{ message: string; data: Payment }>(`/payments/${id}/callback`);
  return response.data;
};

// Xác nhận đã nhận tiền mặt từ khách hàng (cho người giúp việc/admin nhận tiền mặt)
export const confirmCashReceiptApi = async (id: number): Promise<{ message: string; data: Payment }> => {
  const response = await axiosInstance.post<{ message: string; data: Payment }>(`/payments/${id}/confirm-cash`);
  return response.data;
};

// Gửi yêu cầu hoàn tiền cho một giao dịch thanh toán đã thanh toán
export const requestRefundApi = async (payload: CreateRefundPayload): Promise<{ message: string; data: Refund }> => {
  const response = await axiosInstance.post<{ message: string; data: Refund }>("/payments/refunds", payload);
  return response.data;
};

// Lấy danh sách các yêu cầu hoàn tiền liên quan đến giao dịch thanh toán cụ thể
export const getMyPaymentRefundsApi = async (paymentId: number): Promise<{ data: Refund[] }> => {
  const response = await axiosInstance.get<{ data: Refund[] }>(`/payments/${paymentId}/refunds`);
  return response.data;
};

// Tạo cổng liên kết thanh toán trực tuyến qua ví VNPay (trả về URL thanh toán)
export const createVnpayUrlApi = async (payload: CreateVnpayPayload): Promise<CreateVnpayResponse> => {
  const response = await axiosInstance.post<CreateVnpayResponse>("/payments/vnpay/create", payload);
  return response.data;
};

// Xác thực chữ ký và cập nhật trạng thái sau khi VNPay redirect về trang return URL
export const verifyVnpayReturnApi = async (queryParams: Record<string, string>): Promise<any> => {
  const response = await axiosInstance.get("/payments/vnpay/return", {
    params: queryParams,
  });
  return response.data;
};
