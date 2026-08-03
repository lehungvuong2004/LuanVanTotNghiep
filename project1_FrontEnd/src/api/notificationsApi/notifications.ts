import axiosInstance from "../axios";

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

export interface GetNotificationsParams {
  is_read?: 0 | 1;
  limit?: number;
  page?: number;
}

export interface SendNotificationRequest {
  user_ids: number[];
  title: string;
  message: string;
  type?: string;
}

export interface BroadcastNotificationRequest {
  role: "customer" | "helper" | "operator" | "admin" | "all";
  title: string;
  message: string;
  type?: string;
}

export interface NotificationMutateResponse {
  message: string;
}

// Lấy danh sách thông báo của user đang đăng nhập. ( Hỗ trợ lọc trạng thái đã đọc/chưa đọc và phân trang.)
export const getNotifications = async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
  const response = await axiosInstance.get<NotificationsResponse>("/notifications", {
    params,
  });
  return response.data;
};

// Đánh dấu một thông báo cụ thể là đã đọc.
export const markNotificationRead = async (id: number): Promise<NotificationMutateResponse> => {
  const response = await axiosInstance.patch<NotificationMutateResponse>(`/notifications/${id}/read`);
  return response.data;
};

// Đánh dấu tất cả thông báo của user hiện tại là đã đọc.
export const markAllNotificationsRead = async (): Promise<NotificationMutateResponse> => {
  const response = await axiosInstance.patch<NotificationMutateResponse>("/notifications/read-all");
  return response.data;
};

// Xóa một thông báo cụ thể khỏi danh sách của user.
export const deleteNotification = async (id: number): Promise<NotificationMutateResponse> => {
  const response = await axiosInstance.delete<NotificationMutateResponse>(`/notifications/${id}`);
  return response.data;
};

// Admin/Operator gửi thông báo trực tiếp đến danh sách ID người dùng cụ thể.
export const sendNotification = async (data: SendNotificationRequest): Promise<NotificationMutateResponse> => {
  const response = await axiosInstance.post<NotificationMutateResponse>("/admin/notifications/send", data);
  return response.data;
};

// Admin/Operator gửi thông báo quảng bá (broadcast) tới toàn bộ người dùng thuộc một vai trò nhất định (Customer, Helper, Admin...).
export const broadcastNotification = async (data: BroadcastNotificationRequest): Promise<NotificationMutateResponse> => {
  const response = await axiosInstance.post<NotificationMutateResponse>("/admin/notifications/broadcast", data);
  return response.data;
};
