import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFormik } from "formik";
import { getUsersAdmin, createUserAdmin, updateUserAdmin, toggleUserStatusAdmin, deleteUserAdmin, bulkDeleteUsersAdmin, uploadUserAvatarAdmin } from "../../../api/usersApi/users";
import type { User } from "../../../api/usersApi/users";
import { getAddUserSchema, getEditUserSchema } from "../../../api/usersApi/validation";
import { getRootFontSizePx } from "../../../utils";
import { ROLES } from "../../../constants/roles";
import { SEMANTIC_COLORS } from "../../../constants/colors";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [uploadingImage, setUploadingImage] = useState(false);
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
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  // Status Toggle Modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUser, setStatusUser] = useState<User | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "banned">("active");
  const [statusReason, setStatusReason] = useState("");

  const { showToast } = useToast();

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "All" ? selectedStatus.toLowerCase() : undefined;
      const roleParam =
        selectedRole === "All" ? undefined : selectedRole === "Admin" ? ROLES.ADMIN : selectedRole === "Operator" ? ROLES.OPERATOR : selectedRole === "Helper" ? ROLES.HELPER : ROLES.CUSTOMER;

      const response = await getUsersAdmin({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
        role_id: roleParam,
        search: searchQuery || undefined,
      });

      setUsers(response.data.data);
      setTotalItems(response.data.total);
      if (response.role_counts) {
        setRoleCounts(response.role_counts);
      }
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, selectedRole, searchQuery, itemsPerPage, showToast]);

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

  // Reset checkboxes on page/filter/role change
  useEffect(() => {
    setSelectedUserIds([]);
  }, [currentPage, selectedStatus, selectedRole, searchQuery]);

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

  const openViewModal = (user: User) => {
    setModalMode("view");
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(undefined);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      const cleanedData = { ...userData };
      if (modalMode === "edit" && currentUser) {
        if (!cleanedData.password) {
          delete cleanedData.password;
        }
        await updateUserAdmin(currentUser.id, cleanedData);
        showToast("success", "Thành công", "Cập nhật thông tin tài khoản thành công");
      } else {
        await createUserAdmin(cleanedData);
        showToast("success", "Thành công", "Tạo tài khoản người dùng mới thành công");
      }
      closeModal();
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi lưu thông tin", error.response?.data?.message || "Không thể lưu thông tin tài khoản");
    }
  };

  const handleUploadAvatar = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const res = await uploadUserAvatarAdmin(file);
      showToast("success", "Thành công", "Tải ảnh đại diện lên thành công!");
      return (res.url && res.url.startsWith("http")) ? res.url : res.path;
    } catch (err: any) {
      console.error(err);
      showToast("error", "Lỗi tải ảnh", err.response?.data?.message || "Không thể tải ảnh lên server");
      return null;
    } finally {
      setUploadingImage(false);
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này không?")) return;
    try {
      await deleteUserAdmin(id);
      showToast("success", "Thành công", "Xóa tài khoản thành công");
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi xóa tài khoản", error.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  const handleToggleSelectUser = useCallback((userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedUserIds.length} tài khoản đã chọn không?`)) return;

    setLoading(true);
    try {
      await bulkDeleteUsersAdmin(selectedUserIds);
      showToast("success", "Thành công", `Đã xóa thành công ${selectedUserIds.length} tài khoản`);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (error: any) {
      showToast("error", "Lỗi xóa tài khoản", error.response?.data?.message || "Không thể xóa các tài khoản đã chọn");
    } finally {
      setLoading(false);
    }
  };

  const rem = getRootFontSizePx();

  const providerOption = useMemo(() => {
    const localCount = users.filter((u) => u.provider === "local").length;
    const googleCount = users.filter((u) => u.provider === "google").length;

    const data = [
      { name: "Đăng ký thường", value: localCount, color: SEMANTIC_COLORS.normal },
      { name: "Đăng ký Google", value: googleCount, color: SEMANTIC_COLORS.bad },
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
        formatter: (name: string) => {
          if (name === "Đăng ký thường") return `Đăng ký thường (${localCount})`;
          if (name === "Đăng ký Google") return `Đăng ký Google (${googleCount})`;
          return name;
        },
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
      { name: "Hoạt động", value: activeCount, color: SEMANTIC_COLORS.good },
      { name: "Tạm khóa", value: inactiveCount, color: SEMANTIC_COLORS.warning },
      { name: "Bị khóa", value: bannedCount, color: SEMANTIC_COLORS.bad },
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

  // 1. Validation Schemas for Formik (All Roles)
  const addValidationSchema = getAddUserSchema();
  const editValidationSchema = getEditUserSchema();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      full_name: currentUser?.full_name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      password: "",
      status: currentUser?.status || "active",
      avatar: currentUser?.avatar || "",
      role_id: currentUser?.role_id || ROLES.CUSTOMER,
    },
    validationSchema: modalMode === "add" ? addValidationSchema : editValidationSchema,
    onSubmit: (values) => {
      handleSaveUser(values);
    },
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedRole,
    setSelectedRole,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    users,
    loading,

    isModalOpen,
    modalMode,
    currentUser,
    openAddModal,
    openEditModal,
    openViewModal,
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
    uploadingImage,
    handleUploadAvatar,
    formik,
  };
};
