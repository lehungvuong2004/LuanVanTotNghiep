import axiosInstance from "./axios";
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  message_type: string;
  attachment: string | null;
  is_read: 0 | 1;
  created_at: string;
  sender_deleted: 0 | 1;
  receiver_deleted: 0 | 1;
}

export interface ConversationPartner {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
  role: {
    id: number;
    name: string;
    description: string | null;
  } | null;
}

export interface Conversation {
  partner: ConversationPartner;
  last_message: Message;
  unread_count: number;
}

export interface AdminMessage extends Message {
  sender: ConversationPartner;
  receiver: ConversationPartner;
}

export interface PaginatedAdminMessages {
  current_page: number;
  data: AdminMessage[];
  last_page: number;
  total: number;
  per_page: number;
}

// Gửi tin nhắn đến một người dùng
export const sendMessage = async (data: { receiver_id: number; message: string; message_type?: string; attachment?: string | null }): Promise<{ message: string; data: Message }> => {
  const response = await axiosInstance.post<{ message: string; data: Message }>("/messages", data);
  return response.data;
};

// Lấy lịch sử chat với một người dùng cụ thể
export const getChatHistory = async (userId: number): Promise<{ data: Message[] }> => {
  const response = await axiosInstance.get<{ data: Message[] }>(`/messages/${userId}`);
  return response.data;
};

// Lấy danh sách các cuộc hội thoại của người dùng đang đăng nhập
export const getConversations = async (): Promise<{ data: Conversation[] }> => {
  const response = await axiosInstance.get<{ data: Conversation[] }>("/messages/conversations");
  return response.data;
};

// Đánh dấu đã đọc toàn bộ tin nhắn từ một đối tác
export const markChatAsRead = async (userId: number): Promise<{ message: string }> => {
  const response = await axiosInstance.put<{ message: string }>(`/messages/read/${userId}`);
  return response.data;
};

// Xóa tin nhắn cá nhân 
export const deleteMessage = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/messages/${id}`);
  return response.data;
};

// Lấy toàn bộ tin nhắn trong hệ thống
export const getAdminMessages = async (page: number = 1, search?: string): Promise<PaginatedAdminMessages> => {
  const params: any = { page };
  if (search) params.search = search;
  const response = await axiosInstance.get<PaginatedAdminMessages>("/admin/messages", { params });
  return response.data;
};

// Xóa vĩnh viễn tin nhắn khỏi hệ thống 
export const adminDeleteMessage = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/admin/messages/${id}`);
  return response.data;
};
