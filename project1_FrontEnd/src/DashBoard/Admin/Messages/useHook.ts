import { useState, useEffect } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { getAdminMessages, adminDeleteMessage, type AdminMessage } from "../../../api/messages";
import { useTranslation } from "react-i18next";

export const useAdminMessages = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMessages = async (currentPage: number, search: string) => {
    setLoading(true);
    try {
      const response = await getAdminMessages(currentPage, search);
      setMessages(response.data);
      setPage(response.current_page);
      setLastPage(response.last_page);
    } catch (error) {
      console.error("Failed to fetch admin messages:", error);
      showToast("error", t("Lỗi tải tin nhắn"), t("Không thể tải danh sách tin nhắn từ hệ thống."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounce = setTimeout(() => {
      fetchMessages(page, searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [page, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to page 1 on new search query
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("Bạn có chắc chắn muốn xóa vĩnh viễn tin nhắn này khỏi hệ thống không? Chức năng này không thể hoàn tác."))) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await adminDeleteMessage(id);
      showToast("success", t("Thành công"), res.message || t("Xóa tin nhắn thành công."));
      // Refresh
      fetchMessages(page, searchQuery);
    } catch (error: any) {
      console.error("Failed to delete message:", error);
      const errMsg = error?.response?.data?.message || t("Xóa tin nhắn thất bại. Vui lòng thử lại.");
      showToast("error", t("Lỗi hệ thống"), errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return {
    t,
    messages,
    page,
    setPage,
    lastPage,
    searchQuery,
    handleSearchChange,
    loading,
    deletingId,
    handleDelete,
    refresh: () => fetchMessages(page, searchQuery),
  };
};
