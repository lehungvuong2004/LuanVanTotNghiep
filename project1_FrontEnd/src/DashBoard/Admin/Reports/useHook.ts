import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import {
  getReportsAdminApi,
  processReportAdminApi,
  deleteReportAdminApi,
  bulkDeleteReportsAdminApi,
  type Report,
} from "../../../api/reports";
import { getUsersAdmin, type User } from "../../../api/usersApi/users";

export const useAdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Toast state
  const { showToast } = useToast();

  // Fetch users map for resolving user names and avatars
  const fetchUsersMap = useCallback(async () => {
    try {
      const response = await getUsersAdmin({ limit: 500 });
      const usersList = response.data?.data || [];
      const map: Record<number, User> = {};
      usersList.forEach((u) => {
        map[u.id] = u;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to load users map in Reports", error);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== "all" ? statusFilter : undefined;
      const response = await getReportsAdminApi({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
      });

      setReports(response.data?.data || []);
      setTotalPages(response.data?.last_page || 1);
      setTotalItems(response.data?.total || 0);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, itemsPerPage, showToast]);

  // Load users map once on mount
  useEffect(() => {
    fetchUsersMap();
  }, [fetchUsersMap]);

  // Fetch reports when current page or filter changes
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Selection helpers
  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === reports.length ? [] : reports.map((r) => r.id)));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleDeleteReport = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn báo cáo này không?")) return;
    try {
      await deleteReportAdminApi(id);
      showToast("success", "Xóa thành công", "Đã xóa vĩnh viễn báo cáo vi phạm.");
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      await fetchReports();
    } catch (error: any) {
      showToast("error", "Lỗi xóa báo cáo", error.response?.data?.message || "Không thể xóa báo cáo");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} báo cáo đã chọn?`)) return;

    setLoading(true);
    try {
      await bulkDeleteReportsAdminApi(selectedIds);
      showToast("success", "Xóa thành công", `Đã xóa vĩnh viễn ${selectedIds.length} báo cáo.`);
      setSelectedIds([]);
      await fetchReports();
    } catch (error: any) {
      showToast("error", "Lỗi xóa báo cáo", error.response?.data?.message || "Không thể xóa các báo cáo đã chọn");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReport = async (id: number, status: "resolved" | "dismissed", note?: string) => {
    try {
      await processReportAdminApi(id, { status, note });
      showToast("success", "Xử lý báo cáo thành công", `Đã đánh dấu báo cáo là ${status === "resolved" ? "đã giải quyết" : "đã bỏ qua"}.`);
      await fetchReports();
    } catch (error: any) {
      showToast("error", "Lỗi xử lý báo cáo", error.response?.data?.message || "Không thể xử lý báo cáo");
      throw error;
    }
  };

  return {
    reports,
    usersMap,
    loading,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handleProcessReport,
    refetchReports: fetchReports,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleDeleteReport,
    handleBulkDelete,
  };
};
