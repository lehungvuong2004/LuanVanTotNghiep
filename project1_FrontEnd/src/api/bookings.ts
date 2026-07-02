import axiosInstance from "./axios";

export interface GetBookingsParams {
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  page?: number;
}

/**
 * Lấy danh sách lịch đặt của Khách hàng
 */
export const getCustomerBookingsApi = (params?: GetBookingsParams) => {
  return axiosInstance.get("/orders/bookings", { params });
};

/**
 * Lấy danh sách lịch đặt của Người giúp việc
 */
export const getHelperBookingsApi = (params?: GetBookingsParams) => {
  return axiosInstance.get("/orders/helper/bookings", { params });
};

/**
 * Khách hàng huỷ lịch đặt
 */
export const cancelBookingApi = (id: string | number, reason?: string) => {
  return axiosInstance.patch(`/orders/bookings/${id}/cancel`, { reason });
};

/**
 * Người giúp việc bắt đầu di chuyển (🚗)
 */
export const startMovingApi = (id: string | number) => {
  return axiosInstance.post(`/orders/helper/bookings/${id}/start-moving`);
};

/**
 * Người giúp việc check in (Đã đến nơi)
 */
export const checkinApi = (id: string | number) => {
  return axiosInstance.post(`/orders/helper/bookings/${id}/checkin`);
};

/**
 * Người giúp việc check out (Hoàn thành)
 */
export const checkoutApi = (id: string | number, data?: { note?: string }) => {
  return axiosInstance.post(`/orders/helper/bookings/${id}/checkout`, data);
};
