import { Icon } from "@iconify/react";
import ReactECharts from "echarts-for-react";
import { useUsers } from "./useHook";
import { useAuth } from "../../../hooks/useAuth";
import { Pagination } from "../../../components/Pagination";
import { BulkDeleteBar } from "../../../components/BulkDeleteBar";
import { getImageUrl } from "../../../utils/images";
import { ROLES } from "../../../constants/roles";
import { getInitials, getRoleBadge, getStatusBadge } from "../../../utils";
import ImageUpload from "../../../components/ImageUpload";
import { uploadUserAvatarAdmin } from "../../../api/usersApi/users";
import { CustomSelect } from "../../../components/CustomSelect";

export const Users = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    create: hasPermission("users.create"),
    delete: hasPermission("users.delete"),
    view: hasPermission("users.view"),
    update: hasPermission("users.update"),
    lock: hasPermission("users.lock"),
  };
  const {
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
    formik,
  } = useUsers();

  const isValidAvatarUrl = (url) => {
    return !!url;
  };

  // Render header section
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Quản Lý Người Dùng</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý tài khoản, thay đổi vai trò hệ thống, khóa/mở khóa, cập nhật email/SDT hoặc reset mật khẩu của thành viên.</p>
      </div>
      {permissions.create && (
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#026E5F] hover:bg-[#025a4e] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Icon icon="material-symbols:person-add-rounded" className="text-xl" />
          Thêm Người Dùng Mới
        </button>
      )}
    </div>
  );

  // Render KPI Metrics Cards
  const renderKPIs = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Tổng tài khoản hệ thống</p>
            <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{roleCounts.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:group-outline" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Khách Hàng (Customer)</p>
            <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{roleCounts.customer}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#026E5F]/10 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:person-outline-rounded" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Người Làm (Helper)</p>
            <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{roleCounts.helper}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:engineering-outline-rounded" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Vận Hành & Admin (Other)</p>
            <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{roleCounts.admin + roleCounts.operator}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 flex items-center justify-center text-2xl">
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
        {/* Role filter tab */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider shrink-0">Vai trò:</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
            {["All", "Admin", "Operator", "Helper", "Customer"].map((roleOption) => (
              <button
                key={roleOption}
                type="button"
                onClick={() => {
                  setSelectedRole(roleOption);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === roleOption
                    ? "bg-white dark:bg-slate-800 text-[#026E5F] dark:text-[#52c1b2] shadow-xs"
                    : "text-slate-555 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {roleOption === "All" ? "Tất Cả" : roleOption === "Admin" ? "QTV" : roleOption === "Operator" ? "VH" : roleOption === "Helper" ? "GV" : "Khách"}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter tab */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider shrink-0">Trạng thái:</label>
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
                    : "text-slate-555 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {statusOption === "All" ? "Tất Cả" : statusOption === "Active" ? "Hoạt Động" : statusOption === "Inactive" ? "Tạm Khóa" : "Bị Khóa"}
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
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải danh sách người dùng...</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-dissatisfied-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy tài khoản nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Hãy kiểm tra bộ lọc hoặc tạo tài khoản người dùng mới.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-4xl">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-700 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-5 w-12 text-center">
                  {permissions.delete && (
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === users.length && users.length > 0}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < users.length;
                        }
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  )}
                </th>
                <th className="py-3 px-5">Thành Viên</th>
                <th className="py-3 px-5">Vai Trò</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Số Điện Thoại</th>
                <th className="py-3 px-5">Nguồn Đăng Nhập</th>
                <th className="py-3 px-5">Trạng Thái</th>
                <th className="py-3 px-5">Ngày Tham Gia</th>
                <th className="py-3 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                  <td className="py-3 px-5 text-center">
                    {permissions.delete && (
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleToggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600"
                      />
                    )}
                  </td>
                  {/* User Profile column */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      {user.avatar && isValidAvatarUrl(user.avatar) ? (
                        <img src={getImageUrl(user.avatar)} alt={user.full_name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#026E5F]/10 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] font-bold text-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          {getInitials(user.full_name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{user.full_name}</h4>
                      </div>
                    </div>
                  </td>

                  {/* Role column */}
                  <td className="py-3 px-5">{getRoleBadge(user.role_id)}</td>

                  {/* Email column */}
                  <td className="py-3 px-5">
                    <span className="font-semibold text-slate-600 dark:text-slate-350">{user.email}</span>
                  </td>

                  {/* Phone column */}
                  <td className="py-3 px-5">
                    <span className="font-medium text-slate-650 dark:text-slate-300">{user.phone || <span className="italic text-slate-400 dark:text-slate-600 text-xs">Chưa cung cấp</span>}</span>
                  </td>

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
                        Hệ thống
                      </span>
                    )}
                  </td>

                  {/* Status column */}
                  <td className="py-3 px-5">{getStatusBadge(user.status, "user")}</td>

                  {/* Created At column */}
                  <td className="py-3 px-5 text-xs text-slate-550 dark:text-slate-400 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString("vi-VN")}</td>

                  {/* Actions column */}
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {permissions.view && (
                        <button
                          onClick={() => openViewModal(user)}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Icon icon="material-symbols:visibility-outline-rounded" className="text-lg" />
                        </button>
                      )}

                      {permissions.update && (
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                        </button>
                      )}

                      {permissions.lock && (
                        <button
                          onClick={() => openStatusModal(user)}
                          className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-950/30 transition-all cursor-pointer"
                          title="Thay đổi trạng thái"
                        >
                          <Icon icon="material-symbols:shield-lock-outline-rounded" className="text-lg" />
                        </button>
                      )}

                      {permissions.delete && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-red-650 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-500 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} />
      </div>
    );
  };

  // 6. Dialog Modal renderer for Add / Edit / View Account
  const renderModal = () => {
    if (!isModalOpen) return null;

    const isViewMode = modalMode === "view";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-5/6">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  modalMode === "add" ? "bg-blue-100 text-blue-600" : modalMode === "edit" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Icon icon={modalMode === "add" ? "material-symbols:person-add-rounded" : modalMode === "edit" ? "material-symbols:edit-note" : "material-symbols:visibility-outline-rounded"} />
              </div>
              <h3 className="font-extrabold text-base">{modalMode === "add" ? "Thêm Người Dùng Mới" : modalMode === "edit" ? "Chỉnh Sửa Người Dùng" : "Chi Tiết Người Dùng"}</h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Avatar Preview (if avatar is set) */}
            {formik.values.avatar && isValidAvatarUrl(formik.values.avatar) && (
              <div className="flex justify-center pb-2">
                <img src={getImageUrl(formik.values.avatar)} alt={formik.values.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-[#026E5F] shadow-xs" />
              </div>
            )}

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
                disabled={isViewMode}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.full_name && formik.errors.full_name ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                } disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400`}
              />
              {formik.touched.full_name && formik.errors.full_name && <p className="text-red-500 text-xs mt-1">{String(formik.errors.full_name)}</p>}
            </div>

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email (Địa chỉ thư điện tử) *</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isViewMode}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.email && formik.errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                } disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400`}
              />
              {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{String(formik.errors.email)}</p>}
            </div>

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
                disabled={isViewMode}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.phone && formik.errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                } disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400`}
              />
              {formik.touched.phone && formik.errors.phone && <p className="text-red-500 text-xs mt-1">{String(formik.errors.phone)}</p>}
            </div>

            {/* Role Select (manual role changing) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Vai Trò Hệ Thống *</label>
              <CustomSelect
                value={formik.values.role_id}
                onChange={(val) => formik.setFieldValue("role_id", val)}
                disabled={isViewMode}
                options={[
                  { value: ROLES.CUSTOMER, label: "Khách hàng (Customer)" },
                  { value: ROLES.HELPER, label: "Người giúp việc (Helper)" },
                  { value: ROLES.OPERATOR, label: "Nhân viên vận hành (Operator)" },
                  { value: ROLES.ADMIN, label: "Quản trị viên (Admin)" },
                ]}
              />
              {formik.touched.role_id && formik.errors.role_id && <p className="text-red-500 text-xs mt-1">{String(formik.errors.role_id)}</p>}
            </div>

            {/* Password input */}
            {!isViewMode && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{modalMode === "add" ? "Mật Khẩu *" : "Mật Khẩu Mới (Để trống nếu giữ nguyên)"}</label>
                <input
                  type="password"
                  name="password"
                  placeholder={modalMode === "add" ? "Nhập mật khẩu cho tài khoản..." : "Nhập mật khẩu mới nếu muốn reset..."}
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

            {/* Status & Provider info for View Mode */}
            {isViewMode && currentUser && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Trạng Thái</label>
                  <div className="mt-1">{getStatusBadge(currentUser.status, "user")}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Nguồn Đăng Ký</label>
                  <span className="inline-block mt-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{currentUser.provider === "google" ? "Google OAuth" : "Hệ thống"}</span>
                </div>
              </div>
            )}

            {/* Created At for View Mode */}
            {isViewMode && currentUser && (
              <div>
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Ngày Tham Gia</label>
                <span className="inline-block mt-1 text-sm font-medium text-slate-750 dark:text-slate-250">
                  {new Date(currentUser.created_at).toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {/* Image Upload Component for Avatar */}
            {!isViewMode && (
              <ImageUpload
                label="Hình Ảnh Đại Diện"
                value={formik.values.avatar || ""}
                onChange={(val) => formik.setFieldValue("avatar", val)}
                onUpload={uploadUserAvatarAdmin}
                error={String(formik.errors.avatar || "")}
                touched={!!formik.touched.avatar}
                aspectRatio="square"
                placeholder="Nhập link avatar hoặc bấm chọn tệp để tải lên..."
              />
            )}

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
              >
                Hủy
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  Lưu lại
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 7. Dialog Modal renderer for Changing Account Status (Lock/Unlock)
  const renderStatusModal = () => {
    if (!isStatusModalOpen || !statusUser) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeStatusModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-amber-100 text-amber-600">
                <Icon icon="material-symbols:shield-lock-outline-rounded" />
              </div>
              <h3 className="font-extrabold text-base">Khóa / Mở Khóa Tài Khoản</h3>
            </div>
            <button type="button" onClick={closeStatusModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#026E5F]/10 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] font-bold text-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                {getInitials(statusUser.full_name)}
              </div>
              <div>
                <h4 className="font-bold text-slate-850 dark:text-slate-100">{statusUser.full_name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{statusUser.email}</p>
              </div>
            </div>

            {/* Select Status Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Chọn Trạng Thái Mới</label>
              <div className="grid grid-cols-3 gap-3">
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
        {/* Pie Chart: Provider Distribution */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Hình Thức Đăng Ký</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Phân bố nguồn đăng ký khách hàng hiện tại</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ReactECharts option={providerOption} style={{ height: "100%", width: "100%" }} />
          </div>
        </div>

        {/* Bar Chart: Status breakdown */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Trạng Thái Tài Khoản</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Thống kê hoạt động của khách hàng hiện tại</span>
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
      {renderHeader()}
      {renderKPIs()}
      {renderCharts()}
      {renderFilters()}
      {selectedUserIds.length > 0 && (
        <div className="my-2">
          <BulkDeleteBar
            selectedIds={selectedUserIds}
            totalCount={users.length}
            onToggleAll={handleToggleSelectAll}
            onDeleteSelected={handleBulkDeleteUsers}
            onClear={() => setSelectedUserIds([])}
            loading={loading}
          />
        </div>
      )}
      {renderTable()}
      {renderModal()}
      {renderStatusModal()}
    </div>
  );
};

export default Users;
