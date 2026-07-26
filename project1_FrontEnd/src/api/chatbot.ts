import axiosInstance from "./axios";

export const queryChatbot = async (message: string) => {
  const response = await axiosInstance.post("/chatbot/query", { message });
  return response.data;
};

// Admin Chatbot RAG Knowledge Management APIs
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

export const getChatbotKnowledgesAdminApi = async (params?: GetKnowledgesParams) => {
  const response = await axiosInstance.get("/admin/chatbot-knowledges", { params });
  return response.data;
};

export const createChatbotKnowledgeAdminApi = async (data: { keyword?: string; question: string; content: string }) => {
  const response = await axiosInstance.post("/admin/chatbot-knowledges", data);
  return response.data;
};

export const updateChatbotKnowledgeAdminApi = async (id: number, data: { keyword?: string; question: string; content: string }) => {
  const response = await axiosInstance.put(`/admin/chatbot-knowledges/${id}`, data);
  return response.data;
};

export const deleteChatbotKnowledgeAdminApi = async (id: number) => {
  const response = await axiosInstance.delete(`/admin/chatbot-knowledges/${id}`);
  return response.data;
};

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

export const syncChatbotKnowledgeAdminApi = async () => {
  const response = await axiosInstance.post("/admin/chatbot-knowledges/sync");
  return response.data;
};
