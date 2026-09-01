import axiosInstance from "./axios";
export interface ChatbotKnowledge {
  id: number;
  keyword: string | null;
  question: string;
  content: string;
  created_by?: number | null;
  creator?: {
    id: number;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GetKnowledgesParams {
  page?: number;
  query?: string;
}

// Gửi câu hỏi đối thoại với Chatbot AI
export const queryChatbot = async (message: string) => {
  const response = await axiosInstance.post("/chatbot/query", { message });
  return response.data;
};

// Admin lấy danh sách dữ liệu tri thức của chatbot
export const getChatbotKnowledgesAdminApi = async (params?: GetKnowledgesParams) => {
  const response = await axiosInstance.get("/admin/chatbot-knowledges", { params });
  return response.data;
};

// Admin tạo mới bản ghi tri thức cho chatbot
export const createChatbotKnowledgeAdminApi = async (data: { keyword?: string; question: string; content: string }) => {
  const response = await axiosInstance.post("/admin/chatbot-knowledges", data);
  return response.data;
};

// Admin cập nhật thông tin bản ghi tri thức chatbot theo ID
export const updateChatbotKnowledgeAdminApi = async (id: number, data: { keyword?: string; question: string; content: string }) => {
  const response = await axiosInstance.put(`/admin/chatbot-knowledges/${id}`, data);
  return response.data;
};

// Admin xóa bản ghi tri thức chatbot theo ID
export const deleteChatbotKnowledgeAdminApi = async (id: number) => {
  const response = await axiosInstance.delete(`/admin/chatbot-knowledges/${id}`);
  return response.data;
};

// Admin tải lên file import dữ liệu tri thức hàng loạt
export const importChatbotKnowledgeAdminApi = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/admin/chatbot-knowledges/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Admin đồng bộ hóa dữ liệu tri thức của chatbot
export const syncChatbotKnowledgeAdminApi = async () => {
  const response = await axiosInstance.post("/admin/chatbot-knowledges/sync");
  return response.data;
};
