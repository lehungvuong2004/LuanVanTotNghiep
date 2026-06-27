import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getUsersAdmin, createUserAdmin, updateUserAdmin, toggleUserStatusAdmin, deleteUserAdmin, bulkDeleteUsersAdmin } from "../../../api/users";
import type { User } from "../../../api/users";
import { getRootFontSizePx } from "../../../utils";

export const useAccount = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Real Database Role Counts
  const [roleCounts, setRoleCounts] = useState({
    admin: 0,
    operator: 0,
    helper: 0,
    customer: 0,
    total: 0,
  });

  // Checkbox Selection
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // CRUD Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  // Status Toggle Modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUser, setStatusUser] = useState<User | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "banned">("active");
  const [statusReason, setStatusReason] = useState("");

  // Toast state
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

  // Fetch users (customers) from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "All" ? selectedStatus.toLowerCase() : undefined;

      const response = await getUsersAdmin({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
        role_id: 4, // Exclusively Customers
        search: searchQuery || undefined,
      });

      setUsers(response.data.data);
      setTotalItems(response.data.total);
      if (response.role_counts) {
        setRoleCounts(response.role_counts);
      }
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, searchQuery, itemsPerPage, showToast]);

  // Fetch users when page or filters change
  useEffect(() => {
    let active = true;
    const executeFetch = async () => {
      await Promise.resolve();
      if (active) {
        fetchUsers();
      }
    };
    executeFetch();
    return () => {
      active = false;
    };
  }, [fetchUsers]);

  // Reset checkboxes on page/filter change
  useEffect(() => {
    setSelectedUserIds([]);
  }, [currentPage, selectedStatus, searchQuery]);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentUser(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(undefined);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (modalMode === "edit" && currentUser) {
        await updateUserAdmin(currentUser.id, userData);
        showToast("success", "Thành công", "Cập nhật thông tin khách hàng thành công");
      } else {
        await createUserAdmin({ ...userData, role_id: 4 }); // Always Customer role
        showToast("success", "Thành công", "Tạo tài khoản khách hàng mới thành công");
      }
      closeModal();
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi lưu thông tin", error.response?.data?.message || "Không thể lưu thông tin tài khoản");
    }
  };

  const openStatusModal = (user: User) => {
    setStatusUser(user);
    setNewStatus(user.status);
    setStatusReason("");
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setStatusUser(undefined);
  };

  const handleSaveStatus = async () => {
    if (!statusUser) return;
    try {
      await toggleUserStatusAdmin(statusUser.id, {
        status: newStatus,
        reason: statusReason || undefined,
      });
      showToast("success", "Thành công", `Đã cập nhật trạng thái tài khoản thành ${newStatus === "active" ? "Hoạt động" : newStatus === "inactive" ? "Tạm khóa" : "Bị khóa"}`);
      closeStatusModal();
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật", error.response?.data?.message || "Không thể cập nhật trạng thái tài khoản");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn khách hàng này không?")) return;
    try {
      await deleteUserAdmin(id);
      showToast("success", "Thành công", "Xóa tài khoản khách hàng thành công");
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi xóa tài khoản", error.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  const handleToggleSelectUser = useCallback((userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  }, [users, selectedUserIds]);

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedUserIds.length} tài khoản khách hàng đã chọn không?`)) return;
    
    setLoading(true);
    try {
      await bulkDeleteUsersAdmin(selectedUserIds);
      showToast("success", "Thành công", `Đã xóa thành công ${selectedUserIds.length} tài khoản khách hàng`);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi xóa tài khoản", error.response?.data?.message || "Không thể xóa các tài khoản đã chọn");
    } finally {
      setLoading(false);
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const rem = getRootFontSizePx();

  const providerOption = useMemo(() => {
    const localCount = users.filter((u) => u.provider === "local").length;
    const googleCount = users.filter((u) => u.provider === "google").length;

    const data = [
      { name: "Đăng ký thường", value: localCount, color: "#3b82f6" },
      { name: "Đăng ký Google", value: googleCount, color: "#ef4444" },
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
          name: "Hình thức đăng ký",
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
              formatter: "{b}\n{c} tài khoản",
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
  }, [users, rem]);

  const statusOption = useMemo(() => {
    const activeCount = users.filter((u) => u.status === "active").length;
    const inactiveCount = users.filter((u) => u.status === "inactive").length;
    const bannedCount = users.filter((u) => u.status === "banned").length;

    const data = [
      { name: "Hoạt động", value: activeCount, color: "#10b981" },
      { name: "Tạm khóa", value: inactiveCount, color: "#f59e0b" },
      { name: "Bị khóa", value: bannedCount, color: "#ef4444" },
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
        axisLabel: { color: "#64748b", fontSize: 0.75 * rem },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#64748b", fontSize: 0.75 * rem },
        splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
      },
      series: [
        {
          name: "Số tài khoản",
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
  }, [users, rem]);

  return {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    users,
    loading,
    toast,
    setToast,
    isModalOpen,
    modalMode,
    currentUser,
    openAddModal,
    openEditModal,
    closeModal,
    handleSaveUser,
    isStatusModalOpen,
    statusUser,
    newStatus,
    setNewStatus,
    statusReason,
    setStatusReason,
    openStatusModal,
    closeStatusModal,
    handleSaveStatus,
    handleDeleteUser,
    providerOption,
    statusOption,
    roleCounts,
    selectedUserIds,
    setSelectedUserIds,
    handleToggleSelectUser,
    handleToggleSelectAll,
    handleBulkDeleteUsers,
  };
};
