import { useState, useEffect } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { useFormik } from "formik";
import { sendNotification, broadcastNotification } from "../../../api/notificationsApi/notifications";
import { notificationValidationSchema } from "../../../api/notificationsApi/validation";
import { getUsersAdmin } from "../../../api/usersApi/users";
import type { User } from "../../../api/usersApi/users";
import { useTranslation } from "react-i18next";

export type TargetType = "all" | "customer" | "helper" | "operator" | "specific";

export const useNotificationsForm = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

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
      // console.error("Failed to fetch users:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      message: "",
      type: "system",
      targetType: "all" as TargetType,
    },
    validationSchema: notificationValidationSchema,
    onSubmit: async (values) => {
      if (values.targetType === "specific" && selectedUserIds.length === 0) {
        showToast("error", t("Lỗi nhập liệu"), t("Vui lòng chọn nhất một người dùng từ danh sách bên dưới."));
        return;
      }

      setLoading(true);
      try {
        if (values.targetType === "specific") {
          const res = await sendNotification({
            user_ids: selectedUserIds,
            title: values.title.trim(),
            message: values.message.trim(),
            type: values.type,
          });
          showToast("success", t("Thành công"), res.message || t("Đã gửi thông báo thành công!"));
        } else {
          const res = await broadcastNotification({
            role: values.targetType,
            title: values.title.trim(),
            message: values.message.trim(),
            type: values.type,
          });
          showToast("success", t("Thành công"), res.message || t("Đã gửi thông báo hệ thống thành công!"));
        }

        formik.resetForm();
        setSelectedUserIds([]);
        setSearchQuery("");
      } catch (error: any) {
        // console.error("Send notification error:", error);
        const errMsg = error?.response?.data?.message || t("Gửi thông báo thất bại. Vui lòng kiểm tra lại.");
        showToast("error", t("Lỗi hệ thống"), errMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch users when specific is selected
  useEffect(() => {
    if (formik.values.targetType === "specific") {
      fetchUsers(searchQuery);
    }
  }, [formik.values.targetType, searchQuery]);

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const targetOptions = [
    { id: "all", label: t("Tất cả người dùng") },
    { id: "customer", label: t("Khách hàng") },
    { id: "helper", label: t("Người giúp việc") },
    { id: "operator", label: t("Nhân viên vận hành") },
    { id: "specific", label: t("Chọn người dùng cụ thể") },
  ];

  return {
    formik,
    selectedUserIds,
    setSelectedUserIds,
    usersList,
    searchQuery,
    setSearchQuery,
    fetchingUsers,
    toggleUserSelection,
    loading,
    targetOptions,
  };
};
