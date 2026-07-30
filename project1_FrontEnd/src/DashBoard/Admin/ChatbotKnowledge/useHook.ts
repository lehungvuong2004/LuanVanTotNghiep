import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../hooks/useAuth";
import { getChatbotKnowledgesAdminApi } from "../../../api/chatbot";
import type { ChatbotKnowledge } from "../../../api/chatbot";

export const useChatbotKnowledge = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const permissions = {
    view: hasPermission("chatbot_knowledge.view"),
    create: hasPermission("chatbot_knowledge.create"),
    update: hasPermission("chatbot_knowledge.update"),
    delete: hasPermission("chatbot_knowledge.delete"),
  };

  const [knowledges, setKnowledges] = useState<ChatbotKnowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchKnowledges = useCallback(async () => {
    if (!permissions.view) return;
    setLoading(true);
    try {
      const response = await getChatbotKnowledgesAdminApi({
        page: currentPage,
        query: searchQuery || undefined,
      });

      if (response && response.data) {
        setKnowledges(response.data.data || []);
        setTotalItems(response.data.total || 0);
      }
    } catch (error: any) {
      // console.error("Error fetching chatbot knowledges:", error);
      showToast("error", "Lỗi nạp dữ liệu", "Không thể tải danh sách tri thức từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, permissions.view, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKnowledges();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchKnowledges]);

  return {
    permissions,
    knowledges,
    loading,
    syncing,
    setSyncing,
    importing,
    setImporting,
    submitting,
    setSubmitting,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    fetchKnowledges,
  };
};
