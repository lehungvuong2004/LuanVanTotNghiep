import { useState, useEffect, useRef, useCallback } from "react";
import { getHelpersAdmin, getHelperDetailAdmin, verifyHelperAdmin, toggleHelperStatusAdmin, getHelperStatsAdmin } from "../../../api/helpers";
import type { HelperProfile, HelperStats } from "../../../api/helpers";

export const useHelperReview = () => {
  const [helpers, setHelpers] = useState<HelperProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Pending"); // Default to pending for operator review
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState<HelperStats | null>(null);

  // Selected Helper for detailed modal or verification actions
  const [selectedHelper, setSelectedHelper] = useState<HelperProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"approved" | "rejected">("approved");
  const [verifyNote, setVerifyNote] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "suspended">("active");
  const [statusReason, setStatusReason] = useState("");

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((type: "success" | "error" | "warning" | "info", title: string, message?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ type, title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getHelperStatsAdmin();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load helper stats:", error);
    }
  }, []);

  const fetchHelpers = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "All" ? selectedStatus.toLowerCase() : undefined;
      const response = await getHelpersAdmin({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
        search: searchQuery || undefined,
      });

      setHelpers(response.data.data);
      setTotalItems(response.data.total);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách người giúp việc");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, searchQuery, itemsPerPage, showToast]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchHelpers(), fetchStats()]);
  }, [fetchHelpers, fetchStats]);

  useEffect(() => {
    let active = true;
    const executeFetch = async () => {
      await Promise.resolve();
      if (active) {
        refreshAll();
      }
    };
    executeFetch();
    return () => {
      active = false;
    };
  }, [refreshAll]);

  const openDetailModal = async (id: number) => {
    setLoading(true);
    try {
      const response = await getHelperDetailAdmin(id);
      setSelectedHelper(response.data);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      showToast("error", "Lỗi tải chi tiết", error.response?.data?.message || "Không thể tải chi tiết người giúp việc");
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedHelper(null);
  };

  const openVerifyModal = (helper: HelperProfile, status: "approved" | "rejected") => {
    setSelectedHelper(helper);
    setVerifyStatus(status);
    setVerifyNote("");
    setIsVerifyModalOpen(true);
  };

  const closeVerifyModal = () => {
    setIsVerifyModalOpen(false);
    setSelectedHelper(null);
  };

  const handleVerifyHelper = async () => {
    if (!selectedHelper) return;
    setLoading(true);
    try {
      await verifyHelperAdmin(selectedHelper.id, {
        status: verifyStatus,
        note: verifyNote || undefined,
      });
      showToast(
        "success",
        "Thành công",
        `Đã ${verifyStatus === "approved" ? "phê duyệt" : "từ chối"} hồ sơ người giúp việc thành công`
      );
      closeVerifyModal();
      refreshAll();
    } catch (error: any) {
      showToast("error", "Lỗi xử lý", error.response?.data?.message || "Không thể phê duyệt/từ chối hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (helper: HelperProfile) => {
    setSelectedHelper(helper);
    setNewStatus(helper.status === "active" ? "active" : "suspended");
    setStatusReason("");
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedHelper(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedHelper) return;
    setLoading(true);
    try {
      await toggleHelperStatusAdmin(selectedHelper.id, {
        status: newStatus,
        reason: statusReason || undefined,
      });
      showToast(
        "success",
        "Thành công",
        `Đã cập nhật trạng thái hoạt động thành ${newStatus === "active" ? "Hoạt động" : "Tạm ngưng"}`
      );
      closeStatusModal();
      refreshAll();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật", error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return {
    helpers,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
    stats,
    selectedHelper,
    isDetailModalOpen,
    openDetailModal,
    closeDetailModal,
    isVerifyModalOpen,
    openVerifyModal,
    closeVerifyModal,
    verifyStatus,
    verifyNote,
    setVerifyNote,
    handleVerifyHelper,
    isStatusModalOpen,
    openStatusModal,
    closeStatusModal,
    newStatus,
    setNewStatus,
    statusReason,
    setStatusReason,
    handleSaveStatus,
    toast,
    setToast,
    refreshAll,
  };
};
