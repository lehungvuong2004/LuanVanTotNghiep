import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../../hooks/useAuth";

import { useServiceCategoriesAdmin } from "./useHook";

const TYPE_LABELS= {
  both: { label: "Tất cả", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" },
  booking: { label: "Đặt lịch", color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" },
  job: { label: "Công việc", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" },
};

const SUGGESTED_ICONS = [
  { key: "material-symbols:cleaning-services-outline-rounded", label: "Dọn dẹp" },
  { key: "ic:outline-people", label: "Người già" },
  { key: "fa7-solid:children", label: "Chăm trẻ" },
  { key: "material-symbols:home-repair-service-outline-rounded", label: "Sửa chữa" },
  { key: "mdi:water", label: "Điện nước" },
  { key: "arcticons:picture-insect", label: "Côn trùng" },
  { key: "osmic:pet-14", label: "Thú cưng" },
  { key: "material-symbols:local-shipping-outline-rounded", label: "Vận chuyển" },
  { key: "material-symbols:menu-book-outline-rounded", label: "Gia sư" },
  { key: "material-symbols:yard-outline-rounded", label: "Làm vườn" },
  { key: "material-symbols:cooking-outline", label: "Nấu ăn" },
  { key: "material-symbols:electric-bolt-outline-rounded", label: "Sửa điện máy" },
  { key: "material-symbols:wash-outline", label: "Giặt là" },
  { key: "material-symbols:directions-car-outline", label: "Thuê xe" },
  { key: "material-symbols:health-and-safety-outline", label: "Y tế" },
  { key: "icon-park-outline:other", label: "Khác (Mặc định)" },
];

export const ServiceCategories = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    create: hasPermission("categories.create"),
    update: hasPermission("categories.update"),
    delete: hasPermission("categories.delete"),
  };
  const {
    categories,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    modalMode,

    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDelete,
  } = useServiceCategoriesAdmin();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === categories.length ? [] : categories.map((c) => c.id)));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} danh mục đã chọn?`)) {
      return;
    }
    for (const id of selectedIds) {
      await handleDelete(id, true);
    }
    setSelectedIds([]);
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Quản Lý Danh Mục Dịch Vụ</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý các danh mục phân loại dịch vụ trên nền tảng.</p>
      </div>
      <div className="flex items-center gap-3">
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
            Xóa {selectedIds.length} đã chọn
          </button>
        )}
        {permissions.create && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
            Thêm Danh Mục
          </button>
        )}
      </div>
    </div>
  );

  const renderStats = () => {
    const bookingCount = categories.filter((c) => c.type === "booking").length;
    const jobCount = categories.filter((c) => c.type === "job").length;
    const bothCount = categories.filter((c) => c.type === "both").length;

    const stats = [
      {
        icon: "material-symbols:category-outline-rounded",
        label: "Tổng Danh Mục",
        value: totalItems,
        color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
      },
      {
        icon: "material-symbols:calendar-today-outline",
        label: "Đặt Lịch",
        value: bookingCount,
        color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
      },
      {
        icon: "material-symbols:work-outline",
        label: "Công Việc",
        value: jobCount,
        color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      },
      {
        icon: "material-symbols:layers-outline",
        label: "Hỗ Trợ Cả Hai",
        value: bothCount,
        color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${s.color}`}>
              <Icon icon={s.icon} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5 text-slate-800 dark:text-slate-100">{s.value}</p>
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
          placeholder="Tìm kiếm tên danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading && categories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-4xl text-slate-400 mb-4">
            <Icon icon="material-symbols:category-outline-rounded" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy danh mục nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hãy thêm danh mục dịch vụ đầu tiên.</p>
          <button
            onClick={openAddModal}
            className="mt-5 flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Icon icon="material-symbols:add" />
            Thêm Danh Mục
          </button>
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
                    checked={selectedIds.length === categories.length && categories.length > 0}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedIds.length > 0 && selectedIds.length < categories.length;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-700 cursor-pointer accent-cyan-700"
                  />
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh Mục</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loại</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số DV</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
              {categories.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${selectedIds.includes(item.id) ? "bg-red-50/20 dark:bg-red-950/10" : ""}`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-cyan-700 cursor-pointer accent-cyan-700"
                    />
                  </td>
                  <td className="px-5 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">#{item.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg shrink-0">
                        {item.icon ? <Icon icon={item.icon} /> : <Icon icon="material-symbols:category-outline-rounded" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                        {item.description && <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-xs">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${TYPE_LABELS[item.type]?.color || ""}`}>{TYPE_LABELS[item.type]?.label || item.type}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.services_count ?? 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {permissions.update && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                        </button>
                      )}
                      {permissions.delete && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-650 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Xóa"
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
      </div>
    );
  };

  const renderModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal} />
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${modalMode === "add" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"}`}>
                <Icon icon={modalMode === "add" ? "material-symbols:add" : "material-symbols:edit-note"} />
              </div>
              <h3 className="font-extrabold text-base">{modalMode === "add" ? "Thêm Danh Mục Mới" : "Chỉnh Sửa Danh Mục"}</h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên Danh Mục *</label>
              <input
                type="text"
                name="name"
                placeholder="Vệ sinh nhà cửa..."
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.name && formik.errors.name ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.name && formik.errors.name && <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô Tả</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Mô tả ngắn về danh mục..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Icon */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Icon (Iconify key)</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="icon"
                  placeholder="material-symbols:cleaning-services"
                  value={formik.values.icon}
                  onChange={formik.handleChange}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all"
                />
                {formik.values.icon && (
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                    <Icon icon={formik.values.icon} />
                  </div>
                )}
              </div>
              <div className="mt-2.5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block mb-1.5">Gợi ý icon dịch vụ phổ biến (Click để chọn):</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-700/50 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                  {SUGGESTED_ICONS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => formik.setFieldValue("icon", item.key)}
                      title={`${item.label} (${item.key})`}
                      className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        formik.values.icon === item.key
                          ? "border-cyan-600 bg-cyan-50/50 text-cyan-600 dark:text-cyan-400 font-bold"
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-650 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-350"
                      }`}
                    >
                      <Icon icon={item.key} className="text-xl" />
                      <span className="text-xs text-center truncate w-full font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loại Dịch Vụ</label>
              <div className="grid grid-cols-3 gap-3">
                {(["both", "booking", "job"] as const).map((t) => (
                  <div
                    key={t}
                    onClick={() => formik.setFieldValue("type", t)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center select-none text-sm font-bold ${
                      formik.values.type === t
                        ? "border-cyan-600 bg-cyan-50/30 dark:bg-cyan-950/10 text-cyan-700 dark:text-cyan-400"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {TYPE_LABELS[t].label}
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

export default ServiceCategories;
