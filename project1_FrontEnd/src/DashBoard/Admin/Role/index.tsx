import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../../hooks/useAuth";
import { ROLES } from "../../../constants/roles";
import { useRolesAdmin } from "./useHook";

export const Role = () => {
  const { hasPermission } = useAuth();
  const rolePermissions = {
    create: hasPermission("roles.create"),
    update: hasPermission("roles.update"),
    delete: hasPermission("roles.delete"),
  };
  const { roles, totalItems, permissions, loading, searchQuery, setSearchQuery, isModalOpen, modalMode, openAddModal, openEditModal, closeModal, formik, handleDelete, currentRole } = useRolesAdmin();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === roles.length ? [] : roles.map((r) => r.id)));
  };

  const handleBulkDelete = async () => {
    // Filter out core system roles
    const deletableIds = selectedIds.filter((id) => ![1, 2, 3, 4].includes(id));
    if (deletableIds.length === 0) {
      alert("Không thể xóa vai trò mặc định của hệ thống.");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${deletableIds.length} vai trò đã chọn?`)) {
      return;
    }
    for (const id of deletableIds) {
      await handleDelete(id, true);
    }
    setSelectedIds([]);
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Quản Lý Vai Trò & Phân Quyền</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Thiết lập các vai trò người dùng trong hệ thống (Khách hàng, Nhân viên, Đối tác, Admin).</p>
      </div>
      <div className="flex items-center gap-3">
        {selectedIds.length > 0 && rolePermissions.delete && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center justify-center gap-2 bg-red-650 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
            Xóa {selectedIds.length} đã chọn
          </button>
        )}
        {rolePermissions.create && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
            Thêm Vai Trò
          </button>
        )}
      </div>
    </div>
  );

  const renderStats = () => {
    const coreCount = roles.filter((r) => [1, 2, 3, 4].includes(r.id)).length;
    const customCount = roles.length - coreCount;

    const stats = [
      {
        icon: "material-symbols:shield-person-outline-rounded",
        label: "Tổng Số Vai Trò",
        value: totalItems,
        color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
      },
      {
        icon: "material-symbols:key-outline-rounded",
        label: "Vai Trò Mặc Định",
        value: coreCount,
        color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
      },
      {
        icon: "material-symbols:build-circle-outline-rounded",
        label: "Vai Trò Tùy Biến",
        value: customCount,
        color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${s.color}`}>
              <Icon icon={s.icon} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black mt-0.5 text-slate-800 dark:text-slate-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md w-full">
        <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        <input
          type="text"
          placeholder="Tìm kiếm vai trò..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading && roles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (roles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-4xl text-slate-400 mb-4">
            <Icon icon="material-symbols:shield-person-outline-rounded" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy vai trò nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hãy thêm vai trò mới đầu tiên.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === roles.length && roles.length > 0}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedIds.length > 0 && selectedIds.length < roles.length;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-700 cursor-pointer accent-cyan-700"
                  />
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vai Trò</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô Tả</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quyền Hạn</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phân Loại</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
              {roles.map((item) => {
                const isCore = [1, 2, 3, 4].includes(item.id);
                return (
                  <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${selectedIds.includes(item.id) ? "bg-red-50/20 dark:bg-red-950/10" : ""}`}>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        disabled={isCore}
                        className="w-4 h-4 rounded border-slate-300 text-cyan-700 cursor-pointer accent-cyan-700 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">#{item.id}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 font-mono uppercase text-xs">{item.name}</td>
                    <td className="px-5 py-4 text-slate-650 dark:text-slate-300">{item.description || <span className="text-slate-400 dark:text-slate-500 italic">Chưa cấu hình mô tả</span>}</td>
                    <td className="px-5 py-4">
                      {item.permissions && item.permissions.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30 whitespace-nowrap">
                          <Icon icon="material-symbols:vpn-key-outline-rounded" className="text-sm" />
                          {item.permissions.length} quyền
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-xs">Chưa có quyền</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isCore ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">Mặc định hệ thống</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">Tùy biến</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {rolePermissions.update && (
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                          </button>
                        )}
                        {rolePermissions.delete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isCore}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-650 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-405 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isCore ? "Không thể xóa vai trò hệ thống" : "Xóa"}
                          >
                            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!isModalOpen) return null;
    const isCore = currentRole && [1, 2, 3, 4].includes(currentRole.id);
    const isAdminRole = currentRole?.id === ROLES.ADMIN;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal} />
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${modalMode === "add" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"}`}>
                <Icon icon={modalMode === "add" ? "material-symbols:add" : "material-symbols:edit-note"} />
              </div>
              <h3 className="font-extrabold text-base">{modalMode === "add" ? "Thêm Vai Trò Mới" : "Chỉnh Sửa Vai Trò"}</h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên Vai Trò *</label>
              <input
                type="text"
                name="name"
                placeholder="OPERATOR..."
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!!isCore}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all disabled:bg-slate-100 dark:disabled:bg-slate-950/40 disabled:text-slate-450 ${
                  formik.touched.name && formik.errors.name ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {isCore && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                  <Icon icon="material-symbols:warning-amber-rounded" />
                  Không thể thay đổi tên của vai trò mặc định hệ thống.
                </p>
              )}
              {formik.touched.name && formik.errors.name && <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô Tả</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Mô tả quyền hạn của vai trò này..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Permissions */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Phân Quyền Chi Tiết</label>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10">
                {Object.entries(
                  permissions.reduce(
                    (acc, p) => {
                      if (!acc[p.module]) acc[p.module] = [];
                      acc[p.module].push(p);
                      return acc;
                    },
                    {} as Record<string, typeof permissions>,
                  ),
                ).map(([module, perms]) => (
                  <div key={module} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-750 pb-1">
                      <span className="text-xs font-bold text-cyan-900 dark:text-cyan-400 uppercase tracking-wider">Mô-đun {module}</span>
                      {!isAdminRole && (
                        <button
                          type="button"
                          onClick={() => {
                            const permIds = perms.map((p) => p.id);
                            const allChecked = permIds.every((id) => formik.values.permissions.includes(id));
                            if (allChecked) {
                              formik.setFieldValue(
                                "permissions",
                                formik.values.permissions.filter((id) => !permIds.includes(id)),
                              );
                            } else {
                              const uniqueIds = Array.from(new Set([...formik.values.permissions, ...permIds]));
                              formik.setFieldValue("permissions", uniqueIds);
                            }
                          }}
                          className="text-xxs font-medium text-slate-550 dark:text-slate-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {perms.map((p) => p.id).every((id) => formik.values.permissions.includes(id)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = isAdminRole ? true : formik.values.permissions.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all duration-150 ${isAdminRole ? "cursor-not-allowed opacity-75" : "cursor-pointer"} ${
                              isChecked
                                ? "bg-cyan-50/30 dark:bg-cyan-950/10 border-cyan-200 dark:border-cyan-800/40 text-cyan-900 dark:text-cyan-400"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isAdminRole}
                              onChange={() => {
                                if (isAdminRole) return;
                                if (isChecked) {
                                  formik.setFieldValue(
                                    "permissions",
                                    formik.values.permissions.filter((id) => id !== p.id),
                                  );
                                } else {
                                  formik.setFieldValue("permissions", [...formik.values.permissions, p.id]);
                                }
                              }}
                              className={`w-4 h-4 rounded border-slate-300 text-cyan-700 accent-cyan-700 mt-0.5 ${isAdminRole ? "cursor-not-allowed" : "cursor-pointer"}`}
                            />
                            <div>
                              <p className="text-xs font-bold font-mono">{p.name}</p>
                              {p.description && <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{p.description}</p>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Lưu Lại
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200">
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderTable()}
      {renderModal()}
    </div>
  );
};

export default Role;
