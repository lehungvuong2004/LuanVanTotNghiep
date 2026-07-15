import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import type { ActivityLog } from "../../../api/activityLogs";

import {
  getActivityLogsAdmin,
  deleteActivityLogAdmin,
  clearActivityLogsAdmin } from "../../../api/activityLogs";

export const useActivityLogsAdmin = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 15;

  const { showToast } = useToast();
  

  

  

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getActivityLogsAdmin({
          search: searchQuery || undefined,
          user_id: userIdFilter || undefined,
          page,
          limit: perPage });
        setLogs(res.data);
        setCurrentPage(res.current_page);
        setTotalPages(res.last_page);
        setTotalItems(res.total);
      } catch (err: any) {
        showToast(
          "error",
          "Lỗi tải dữ liệu",
          err.response?.data?.message || "Không thể tải danh sách lịch sử hoạt động"
        );
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, userIdFilter, showToast]
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLogs(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, userIdFilter, fetchLogs]);

  const handleDeleteLog = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi nhật ký này?")) return;
    setLoading(true);
    try {
      await deleteActivityLogAdmin(id);
      showToast("success", "Thành công", "Đã xóa bản ghi nhật ký!");
      fetchLogs(currentPage);
    } catch (err: any) {
      showToast("error", "Lỗi", err.response?.data?.message || "Không thể xóa bản ghi");
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử hoạt động của hệ thống? Hành động này không thể hoàn tác!")) {
      return;
    }
    setLoading(true);
    try {
      await clearActivityLogsAdmin();
      showToast("success", "Thành công", "Đã xóa toàn bộ nhật ký hệ thống!");
      fetchLogs(1);
    } catch (err: any) {
      showToast("error", "Lỗi", err.response?.data?.message || "Không thể xóa toàn bộ nhật ký");
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    searchQuery,
    setSearchQuery,
    userIdFilter,
    setUserIdFilter,
    currentPage,
    totalPages,
    totalItems,
    
    fetchLogs,
    handleDeleteLog,
    handleClearLogs };
};


