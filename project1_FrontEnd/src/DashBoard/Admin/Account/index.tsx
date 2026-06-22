import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify/react";
import ReactECharts from "echarts-for-react";
import { useAccount } from "./useHook";
import { Pagination } from "../../../components/Pagination";
import { Toast } from "../../../components/Toast";

export const Account = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
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
    roleOption,
    statusOption,
  } = useAccount();

  // 1. Validation Schemas for Formik
  const addValidationSchema = Yup.object().shape({
    role_id: Yup.number().required("Vui lòng chọn vai trò"),
    full_name: Yup.string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự")
      .required("Vui lòng nhập họ tên"),
    email: Yup.string()
      .email("Định dạng email không hợp lệ")
      .required("Vui lòng nhập email"),
    phone: Yup.string()
      .matches(/^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)")
      .nullable(),
    password: Yup.string()
      .min(6, "Mật khẩu phải chứa ít nhất 6 ký tự")
      .matches(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ in hoa")
      .matches(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
      .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
      .required("Vui lòng nhập mật khẩu"),
    status: Yup.string().oneOf(["active", "inactive", "banned"]).required(),
  });

  const editValidationSchema = Yup.object().shape({
    role_id: Yup.number().required("Vui lòng chọn vai trò"),
    full_name: Yup.string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự")
      .required("Vui lòng nhập họ tên"),
    phone: Yup.string()
      .matches(/^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ")
      .nullable(),
    avatar: Yup.string().url("Định dạng URL ảnh không hợp lệ").nullable(),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      role_id: currentUser?.role_id || 4,
      full_name: currentUser?.full_name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      password: "",
      status: currentUser?.status || "active",
      avatar: currentUser?.avatar || "",
    },
    validationSchema: modalMode === "add" ? addValidationSchema : editValidationSchema,
    onSubmit: (values) => {
      if (modalMode === "edit") {
        // Only send fields allowed for edit
        handleSaveUser({
          role_id: values.role_id,
          full_name: values.full_name,
          phone: values.phone || null,
          avatar: values.avatar || null,
        });
      } else {
        handleSaveUser({
          role_id: values.role_id,
          full_name: values.full_name,
          email: values.email,
          phone: values.phone || null,
          password: values.password,
          status: values.status,
          avatar: values.avatar || null,
        });
      }
    },
  });

  // Helper functions for UI
  const getRoleBadge = (roleId: number) => {
    switch (roleId) {
      case 1:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 flex items-center gap-1 w-fit">
            <Icon icon="material-symbols:admin-panel-settings-outline-rounded" />
            Admin
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-1 w-fit">
            <Icon icon="material-symbols:support-agent-rounded" />
            Operator
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1 w-fit">
            <Icon icon="material-symbols:construction-rounded" />
            Helper
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1 w-fit">
            <Icon icon="material-symbols:person-outline-rounded" />
            Customer
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Hoạt động
          </span>
        );
      case "inactive":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Tạm khóa
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Bị khóa
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/") ||
      url.startsWith("data:image/")
    );
  };

  // Render header section
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Quản Lý Tài Khoản Người Dùng</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản lý quyền hạn, thông tin cá nhân và trạng thái hoạt động của các tài khoản hệ thống Gia Đình Việt.
        </p>
      </div>
      <button
        onClick={openAddModal}
        className="flex items-center justify-center gap-2 bg-[#026E5F] hover:bg-[#025a4e] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
      >
        <Icon icon="material-symbols:person-add-rounded" className="text-xl" />
        Thêm Tài Khoản Mới
      </button>
    </div>
  );

  // Render KPI Metrics Cards
  const renderKPIs = () => {
    const adminCount = users.filter((u) => u.role_id === 1).length;
    const operatorCount = users.filter((u) => u.role_id === 2).length;
    const helperCount = users.filter((u) => u.role_id === 3).length;
    const customerCount = users.filter((u) => u.role_id === 4).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng tài khoản</p>
            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{totalItems}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:group-outline" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Khách hàng</p>
            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{customerCount} / trang</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:person-outline-rounded" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Người giúp việc</p>
            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{helperCount} / trang</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:construction-rounded" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quản trị & Vận hành</p>
            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{adminCount + operatorCount} / trang</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:admin-panel-settings-outline-rounded" />
          </div>
        </div>
      </div>
    );
  };

  // Render Filters Toolbar
  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md w-full">
        <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        <input
          type="text"
          placeholder="Tìm kiếm theo họ tên, email, điện thoại..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
        {/* Role Filter dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider shrink-0">Vai trò:</label>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="1">Quản trị viên (Admin)</option>
            <option value="2">Nhân viên vận hành (Operator)</option>
            <option value="3">Người giúp việc (Helper)</option>
            <option value="4">Khách hàng (Customer)</option>
          </select>
        </div>

        {/* Status filter tab */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider shrink-0">Trạng thái:</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
            {["All", "Active", "Inactive", "Banned"].map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => {
                  setSelectedStatus(statusOption);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === statusOption
                    ? "bg-white dark:bg-slate-800 text-blue-650 dark:text-blue-400 shadow-xs"
                    : "text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {statusOption === "All"
                  ? "Tất Cả"
                  : statusOption === "Active"
                  ? "Hoạt Động"
                  : statusOption === "Inactive"
                  ? "Tạm Khóa"
                  : "Bị Khóa"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Table of Users
  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải danh sách tài khoản...</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-dissatisfied-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy người dùng nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Hãy kiểm tra bộ lọc hoặc tạo một tài khoản mới.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-4xl">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-700 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-5">Người Dùng</th>
                <th className="py-3 px-5">Số Điện Thoại</th>
                <th className="py-3 px-5">Vai Trò</th>
                <th className="py-3 px-5">Nguồn Đăng Nhập</th>
                <th className="py-3 px-5">Trạng Thái</th>
                <th className="py-3 px-5">Ngày Tham Gia</th>
                <th className="py-3 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                  {/* User Profile column */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      {user.avatar && isValidAvatarUrl(user.avatar) ? (
                        <img
                          src={user.avatar}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#026E5F]/10 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] font-bold text-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          {getInitials(user.full_name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{user.full_name}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone column */}
                  <td className="py-3 px-5">
                    <span className="font-medium text-slate-650 dark:text-slate-300">
                      {user.phone || <span className="italic text-slate-400 dark:text-slate-600 text-xs">Chưa cung cấp</span>}
                    </span>
                  </td>

                  {/* Role column */}
                  <td className="py-3 px-5">{getRoleBadge(user.role_id)}</td>

                  {/* Provider column */}
                  <td className="py-3 px-5">
                    {user.provider === "google" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 dark:text-rose-400">
                        <Icon icon="logos:google-icon" className="text-xs" />
                        Google OAuth
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Icon icon="material-symbols:lock-open-outline" />
                        Hệ thống (Local)
                      </span>
                    )}
                  </td>

                  {/* Status column */}
                  <td className="py-3 px-5">{getStatusBadge(user.status)}</td>

                  {/* Created At column */}
                  <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(user.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>

                  {/* Actions column */}
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                        title="Sửa thông tin"
                      >
                        <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                      </button>

                      <button
                        onClick={() => openStatusModal(user)}
                        className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-950/30 transition-all cursor-pointer"
                        title="Thay đổi trạng thái"
                      >
                        <Icon icon="material-symbols:shield-lock-outline-rounded" className="text-lg" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-650 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-500 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                        title="Xóa tài khoản"
                      >
                        <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    );
  };

  // 6. Dialog Modal renderer for Add / Edit Account
  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-5/6">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${modalMode === "add" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"}`}>
                <Icon icon={modalMode === "add" ? "material-symbols:person-add-rounded" : "material-symbols:edit-note"} />
              </div>
              <h3 className="font-extrabold text-base">{modalMode === "add" ? "Thêm Tài Khoản Mới" : "Chỉnh Sửa Tài Khoản"}</h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Role select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vai Trò Người Dùng *</label>
              <select
                name="role_id"
                value={formik.values.role_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer font-semibold text-slate-700 dark:text-slate-350"
              >
                <option value={4}>Khách hàng (Customer)</option>
                <option value={3}>Người giúp việc (Helper)</option>
                <option value={2}>Nhân viên vận hành (Operator)</option>
                <option value={1}>Quản trị viên (Admin)</option>
              </select>
              {formik.touched.role_id && formik.errors.role_id && <p className="text-red-500 text-xs mt-1">{String(formik.errors.role_id)}</p>}
            </div>

            {/* Full Name input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ và Tên *</label>
              <input
                type="text"
                name="full_name"
                placeholder="VD: Nguyễn Văn A"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.full_name && formik.errors.full_name ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.full_name && formik.errors.full_name && <p className="text-red-500 text-xs mt-1">{String(formik.errors.full_name)}</p>}
            </div>

            {/* Email input (Add mode only) */}
            {modalMode === "add" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email (Địa chỉ thư điện tử) *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                    formik.touched.email && formik.errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  }`}
                />
                {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{String(formik.errors.email)}</p>}
              </div>
            )}

            {/* Phone input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Điện Thoại</label>
              <input
                type="text"
                name="phone"
                placeholder="VD: 0912345678"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.phone && formik.errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.phone && formik.errors.phone && <p className="text-red-500 text-xs mt-1">{String(formik.errors.phone)}</p>}
            </div>

            {/* Password input (Add mode only) */}
            {modalMode === "add" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mật Khẩu *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập ít nhất 6 ký tự, gồm chữ hoa, thường & số"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                    formik.touched.password && formik.errors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  }`}
                />
                {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xs mt-1">{String(formik.errors.password)}</p>}
              </div>
            )}

            {/* Avatar URL input (Edit mode only) */}
            {modalMode === "edit" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link Ảnh Đại Diện (Avatar URL)</label>
                <input
                  type="url"
                  name="avatar"
                  placeholder="https://example.com/avatar.jpg"
                  value={formik.values.avatar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                    formik.touched.avatar && formik.errors.avatar ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  }`}
                />
                {formik.touched.avatar && formik.errors.avatar && <p className="text-red-500 text-xs mt-1">{String(formik.errors.avatar)}</p>}
              </div>
            )}

            {/* Status selection cards (Add mode only) */}
            {modalMode === "add" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng Thái Mặc Định</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => formik.setFieldValue("status", "active")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none ${
                      formik.values.status === "active"
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-650 dark:text-slate-400"
                    }`}
                  >
                    <Icon icon="material-symbols:check-circle-outline-rounded" className="text-xl shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold">Kích hoạt</p>
                      <p className="text-xs font-normal opacity-75 mt-0.5">Sử dụng ngay</p>
                    </div>
                  </div>

                  <div
                    onClick={() => formik.setFieldValue("status", "inactive")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none ${
                      formik.values.status === "inactive"
                        ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-655 dark:text-slate-400"
                    }`}
                  >
                    <Icon icon="material-symbols:block-rounded" className="text-xl shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold">Khóa tạm thời</p>
                      <p className="text-xs font-normal opacity-75 mt-0.5">Tạm dừng truy cập</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#026E5F] hover:bg-[#025a4e] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                Lưu Lại
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 7. Render Status update / block dialog modal
  const renderStatusModal = () => {
    if (!isStatusModalOpen || !statusUser) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeStatusModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                <Icon icon="material-symbols:shield-lock-outline-rounded" />
              </div>
              <h3 className="font-extrabold text-base">Cập Nhật Trạng Thái</h3>
            </div>
            <button type="button" onClick={closeStatusModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tài khoản</p>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-0.5">{statusUser.full_name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{statusUser.email}</p>
            </div>

            {/* Status Card selection options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Trạng thái mới</label>
              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => setNewStatus("active")}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                    newStatus === "active"
                      ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-655 dark:text-slate-400"
                  }`}
                >
                  <Icon icon="material-symbols:check-circle-outline-rounded" className="text-lg" />
                  <span className="text-xxs font-bold mt-1">Hoạt động</span>
                </div>

                <div
                  onClick={() => setNewStatus("inactive")}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                    newStatus === "inactive"
                      ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-655 dark:text-slate-400"
                  }`}
                >
                  <Icon icon="material-symbols:block-rounded" className="text-lg" />
                  <span className="text-xxs font-bold mt-1">Tạm khóa</span>
                </div>

                <div
                  onClick={() => setNewStatus("banned")}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                    newStatus === "banned"
                      ? "border-rose-500 bg-rose-50/30 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-655 dark:text-slate-400"
                  }`}
                >
                  <Icon icon="material-symbols:gpp-bad-outline-rounded" className="text-lg" />
                  <span className="text-xxs font-bold mt-1">Khóa vĩnh viễn</span>
                </div>
              </div>
            </div>

            {/* Reason textbox */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Lý do khóa / thay đổi</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Nhập lý do tại đây (ví dụ: vi phạm chính sách của hệ thống)..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all resize-none text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 mt-4">
              <button
                type="button"
                onClick={closeStatusModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="flex items-center justify-center gap-2 bg-[#026E5F] hover:bg-[#025a4e] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md active:scale-98 transition-all cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 8. Render analysis charts using ECharts
  const renderCharts = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Role Distribution */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Cơ Cấu Vai Trò</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Phân bố quyền hạn trên trang hiện tại</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ReactECharts option={roleOption} style={{ height: "100%", width: "100%" }} />
          </div>
        </div>

        {/* Bar Chart: Status breakdown */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Trạng Thái Tài Khoản</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Thống kê hoạt động trên trang hiện tại</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ReactECharts option={statusOption} style={{ height: "100%", width: "100%" }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {renderHeader()}
      {renderKPIs()}
      {renderCharts()}
      {renderFilters()}
      {renderTable()}
      {renderModal()}
      {renderStatusModal()}
    </div>
  );
};
