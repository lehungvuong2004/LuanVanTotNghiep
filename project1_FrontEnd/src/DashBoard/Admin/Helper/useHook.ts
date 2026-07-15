import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getHelpersAdmin, getHelperDetailAdmin, verifyHelperAdmin, toggleHelperStatusAdmin, deleteHelperAdmin, bulkDeleteHelpersAdmin } from "../../../api/helpers";
import type { HelperProfile } from "../../../api/helpers";
import { getRootFontSizePx } from "../../../utils";

export const useHelperManagement = () => {
  const [helpers, setHelpers] = useState<HelperProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Selected Helper for detailed modal or verification actions
  const [selectedHelper, setSelectedHelper] = useState<HelperProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"approved" | "rejected">("approved");
  const [verifyNote, setVerifyNote] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "suspended">("active");
  const [statusReason, setStatusReason] = useState("");

  // Checkbox Selection
  const [selectedHelperIds, setSelectedHelperIds] = useState<number[]>([]);

  // Toast notification state
  const { showToast } = useToast();

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

  useEffect(() => {
    let active = true;
    const executeFetch = async () => {
      await Promise.resolve();
      if (active) {
        fetchHelpers();
      }
    };
    executeFetch();
    return () => {
      active = false;
    };
  }, [fetchHelpers]);

  // Reset checkboxes on page/filter change
  useEffect(() => {
    setSelectedHelperIds([]);
  }, [currentPage, selectedStatus, searchQuery]);

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
      showToast("success", "Thành công", `Đã ${verifyStatus === "approved" ? "duyệt" : "từ chối"} hồ sơ người giúp việc thành công`);
      closeVerifyModal();
      fetchHelpers();
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
      showToast("success", "Thành công", `Đã cập nhật trạng thái hoạt động thành ${newStatus === "active" ? "Hoạt động" : "Tạm ngưng"}`);
      closeStatusModal();
      fetchHelpers();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật", error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHelper = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người giúp việc và tài khoản này không?")) return;
    setLoading(true);
    try {
      await deleteHelperAdmin(id);
      showToast("success", "Thành công", "Đã xóa thành công người giúp việc và tài khoản liên kết");
      fetchHelpers();
    } catch (error: any) {
      showToast("error", "Lỗi xóa tài khoản", error.response?.data?.message || "Không thể xóa người giúp việc");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectHelper = useCallback((helperId: number) => {
    setSelectedHelperIds((prev) => (prev.includes(helperId) ? prev.filter((id) => id !== helperId) : [...prev, helperId]));
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedHelperIds.length === helpers.length) {
      setSelectedHelperIds([]);
    } else {
      setSelectedHelperIds(helpers.map((h) => h.id));
    }
  }, [helpers, selectedHelperIds]);

  const handleBulkDeleteHelpers = async () => {
    if (selectedHelperIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedHelperIds.length} người giúp việc và tài khoản liên kết đã chọn không?`)) return;

    setLoading(true);
    try {
      await bulkDeleteHelpersAdmin(selectedHelperIds);
      showToast("success", "Thành công", `Đã xóa thành công ${selectedHelperIds.length} người giúp việc và tài khoản liên kết`);
      setSelectedHelperIds([]);
      fetchHelpers();
    } catch (error: any) {
      showToast("error", "Lỗi xóa tài khoản", error.response?.data?.message || "Không thể xóa các đối tác đã chọn");
    } finally {
      setLoading(false);
    }
  };

  

  const rem = getRootFontSizePx();

  // Chart options: Profile Status and Rating Distribution
  const statusOption = useMemo(() => {
    const activeCount = helpers.filter((h) => h.status === "active").length;
    const pendingCount = helpers.filter((h) => h.status === "pending").length;
    const suspendedCount = helpers.filter((h) => h.status === "suspended").length;
    const rejectedCount = helpers.filter((h) => h.status === "rejected").length;

    const data = [
      { name: "Đã duyệt (Active)", value: activeCount, color: "#10b981" },
      { name: "Chờ duyệt (Pending)", value: pendingCount, color: "#f59e0b" },
      { name: "Tạm ngưng (Suspended)", value: suspendedCount, color: "#64748b" },
      { name: "Từ chối (Rejected)", value: rejectedCount, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: "0",
        left: "center",
        itemWidth: 0.5 * rem,
        itemHeight: 0.5 * rem,
        textStyle: { color: "#64748b", fontSize: 0.75 * rem },
      },
      series: [
        {
          name: "Trạng thái hồ sơ",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0.375 * rem,
            borderColor: "#fff",
            borderWidth: 0.125 * rem,
          },
          label: { show: false, position: "center" },
          emphasis: {
            label: {
              show: true,
              fontSize: 0.9 * rem,
              fontWeight: "bold",
              formatter: "{b}\n{c} người",
            },
          },
          labelLine: { show: false },
          data: data.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color },
          })),
        },
      ],
    };
  }, [helpers, rem]);

  const ratingOption = useMemo(() => {
    const star5 = helpers.filter((h) => Number(h.rating_avg || 0) >= 4.5).length;
    const star4 = helpers.filter((h) => Number(h.rating_avg || 0) >= 3.5 && Number(h.rating_avg || 0) < 4.5).length;
    const star3 = helpers.filter((h) => Number(h.rating_avg || 0) >= 2.5 && Number(h.rating_avg || 0) < 3.5).length;
    const starUnder3 = helpers.filter((h) => Number(h.rating_avg || 0) < 2.5).length;

    const data = [
      { name: "Xuất sắc", value: star5, color: "#10b981" },
      { name: "Khá tốt", value: star4, color: "#3b82f6" },
      { name: "Trung bình", value: star3, color: "#f59e0b" },
      { name: "Yếu", value: starUnder3, color: "#ef4444" },
    ];

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b", fontSize: 0.7 * rem },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#64748b", fontSize: 0.75 * rem },
        splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      },
      series: [
        {
          name: "Số người giúp việc",
          type: "bar",
          barWidth: "40%",
          data: data.map((item) => ({
            value: item.value,
            itemStyle: { color: item.color },
          })),
          itemStyle: {
            borderRadius: [0.25 * rem, 0.25 * rem, 0, 0],
          },
        },
      ],
    };
  }, [helpers, rem]);

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
    handleDeleteHelper,
    selectedHelperIds,
    setSelectedHelperIds,
    handleToggleSelectHelper,
    handleToggleSelectAll,
    handleBulkDeleteHelpers,

    statusOption,
    ratingOption,
  };
};

