import { useState, useEffect } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { sendNotification, broadcastNotification } from "../../../api/notifications";
import { getUsersAdmin } from "../../../api/users";
import type { User } from "../../../api/users";
import { useTranslation } from "react-i18next";

export type TargetType = "all" | "customer" | "helper" | "operator" | "specific";

export const useNotificationsForm = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("system");
  const [targetType, setTargetType] = useState<TargetType>("all");

  // Selection of specific users
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
 
const fetchUsers = async (search: string) => {
    setFetchingUsers(true);
    try {
      const response = await getUsersAdmin({
        search,
        limit: 12,
        status: "active",
      });
      setUsersList(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setFetchingUsers(false);
    }
  };
  // Fetch users when specific is selected
  useEffect(() => {
    if (targetType === "specific") {
      fetchUsers(searchQuery);
    }
  }, [targetType, searchQuery]);
 
  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("system");
    setTargetType("all");
    setSelectedUserIds([]);
    setSearchQuery("");
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("error", t("Lỗi nhập liệu"), t("Vui lòng nhập tiêu đề thông báo."));
      return;
    }

    if (!message.trim()) {
      showToast("error", t("Lỗi nhập liệu"), t("Vui lòng nhập nội dung thông báo."));
      return;
    }

    setLoading(true);
    try {
      if (targetType === "specific") {
        if (selectedUserIds.length === 0) {
          showToast("error", t("Lỗi nhập liệu"), t("Vui lòng chọn ít nhất một người dùng từ danh sách bên dưới."));
          setLoading(false);
          return;
        }

        const res = await sendNotification({
          user_ids: selectedUserIds,
          title: title.trim(),
          message: message.trim(),
          type,
        });
        showToast("success", t("Thành công"), res.message || t("Đã gửi thông báo thành công!"));
      } else {
        // Broadcast
        const res = await broadcastNotification({
          role: targetType,
          title: title.trim(),
          message: message.trim(),
          type,
        });
        showToast("success", t("Thành công"), res.message || t("Đã gửi thông báo hệ thống thành công!"));
      }

      resetForm();
    } catch (error: any) {
      console.error("Send notification error:", error);
      const errMsg = error?.response?.data?.message || t("Gửi thông báo thất bại. Vui lòng kiểm tra lại.");
      showToast("error", t("Lỗi hệ thống"), errMsg);
    } finally {
      setLoading(false);
    }
  };
  const targetOptions = [
    { id: "all", label: t("Tất cả người dùng") },
    { id: "customer", label: t("Khách hàng") },
    { id: "helper", label: t("Người giúp việc") },
    { id: "operator", label: t("Nhân viên vận hành") },
    { id: "specific", label: t("Chọn người dùng cụ thể") },
  ];
  return {
    title,
    setTitle,
    message,
    setMessage,
    type,
    setType,
    targetType,
    setTargetType,
    selectedUserIds,
    setSelectedUserIds,
    usersList,
    searchQuery,
    setSearchQuery,
    fetchingUsers,
    toggleUserSelection,
    loading,
    handleSend,
    targetOptions,
  };
};
