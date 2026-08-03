import axiosInstance from "./axios";

export interface GetBookingsParams {
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  page?: number;
}

export interface CreateBookingData {
  helper_id?: number | null;
  address_id: number;
  booking_date: string;
  start_time: string;
  note?: string;
  services: Array<{
    service_id: number;
    price: number;
    duration_hours: number;
    quantity?: number;
  }>;
}

export interface AdminGetBookingsParams {
  ids?: string;
  status?: string;
  customer_id?: number | string;
  helper_id?: number | string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  page?: number;
}
// lịch sử đặt lịch
// Lấy danh sách lịch đặt của Khách hàng
export const getCustomerBookingsApi = (params?: GetBookingsParams) => {
  return axiosInstance.get("/orders/bookings", { params });
};

// Lấy danh sách lịch đặt của Người giúp việc
export const getHelperBookingsApi = (params?: GetBookingsParams) => {
  return axiosInstance.get("/orders/helper/bookings", { params });
};

// Khách hàng huỷ lịch đặt
export const cancelBookingApi = (id: string | number, reason?: string) => {
  return axiosInstance.patch(`/orders/bookings/${id}/cancel`, { reason });
};

// Người giúp việc bắt đầu di chuyển
export const startMovingApi = (id: string | number) => {
  return axiosInstance.post(`/orders/helper/bookings/${id}/start-moving`);
};

// Người giúp việc check in (Đã đến nơi)
export const checkinApi = (id: string | number) => {
  return axiosInstance.post(`/orders/helper/bookings/${id}/checkin`);
};

// Người giúp việc check out (Hoàn thành)
export const checkoutApi = (id: string | number, data?: { note?: string }) => {
  return axiosInstance.post(`/orders/helper/bookings/${id}/checkout`, data);
};

// Tạo lịch đặt mới (Khách hàng)
export const createBookingApi = (data: CreateBookingData) => {
  return axiosInstance.post("/orders/bookings", data);
};

// Admin/Operator lấy danh sách bookings
export const getBookingsAdminApi = (params?: AdminGetBookingsParams) => {
  return axiosInstance.get("/orders/admin/bookings", { params });
};

// Admin/Operator lấy chi tiết booking
export const getBookingDetailAdminApi = (id: number | string) => {
  return axiosInstance.get(`/orders/admin/bookings/${id}`);
};

// Admin cập nhật trạng thái booking manually
export const updateBookingStatusAdminApi = (id: number | string, data: { new_status: string; note?: string }) => {
  return axiosInstance.patch(`/orders/admin/bookings/${id}/status`, data);
};
