import axiosInstance from "./axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "system" | "booking" | "payment" | "promotion" | "report" | "recruitment";

export interface Notification {
  id: number;
  user_id: number;
  title: string | null;
  message: string | null;
  type: NotificationType | null;
  is_read: 0 | 1;
  created_at: string;
}

export interface NotificationPaginator {
  current_page: number;
  data: Notification[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
}

export interface NotificationsResponse {
  unread_count: number;
  data: NotificationPaginator;
}

// ─── API Calls ─────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách thông báo của user đang đăng nhập.
 */
export const getNotifications = async (is_read?: 0 | 1, limit?: number, page?: number): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get<NotificationsResponse>("/notifications", {
    params: { is_read, limit, page },
  });
  return response.data;
};

/**
 * Đánh dấu 1 thông báo là đã đọc.
 */
export const markNotificationRead = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Đánh dấu TẤT CẢ thông báo là đã đọc.
 */
export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>("/notifications/read-all");
  return response.data;
};

/**
 * Xoá 1 thông báo.
 */
export const deleteNotification = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/notifications/${id}`);
  return response.data;
};
