import { useState } from "react";
import { Icon } from "@iconify/react";
import { Toast } from "../../../components/Toast";
import { Pagination } from "../../../components/Pagination";
import { useServicesAdmin } from "./useHook";

const PRICE_TYPE_LABELS = {
  hourly: {
    label: "Theo giờ",
    icon: "material-symbols:schedule-outline-rounded",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  },
  fixed: {
    label: "Cố định",
    icon: "material-symbols:attach-money-rounded",
    color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  },
  daily: {
    label: "Theo ngày",
    icon: "material-symbols:calendar-today-outline",
    color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  },
};

const formatPrice = (price: number | string) => {
  return Number(price).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

export const Services = () => {
  const {
    services,
    categories,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    fetchServices,
    isModalOpen,
    modalMode,
    toast,
    setToast,
    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDelete,
  } = useServicesAdmin();

  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === services.length ? [] : services.map((s) => s.id)
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} dịch vụ đã chọn?`)) {
      return;
    }
    for (const id of selectedIds) {
      await handleDelete(id, true);
    }
    setSelectedIds([]);
  };


  const renderToast = () => {
    if (!toast) return null;
    return <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />;
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Quản Lý Dịch Vụ
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản lý danh sách dịch vụ, giá cả và trạng thái hoạt động.
        </p>
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
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
          Thêm Dịch Vụ
        </button>
      </div>
    </div>
  );

  const renderStats = () => {
    const stats = [
      {
        icon: "material-symbols:home-repair-service-outline-rounded",
        label: "Tổng Dịch Vụ",
        value: totalItems,
        color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
      },
      {
        icon: "material-symbols:category-outline-rounded",
        label: "Số Danh Mục",
        value: categories.length,
        color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md w-full">
        <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        <input
          type="text"
          placeholder="Tìm kiếm tên dịch vụ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading && services.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-4xl text-slate-400 mb-4">
            <Icon icon="material-symbols:home-repair-service-outline-rounded" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy dịch vụ nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hãy thêm dịch vụ đầu tiên cho nền tảng.</p>
          <button
            onClick={openAddModal}
            className="mt-5 flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Icon icon="material-symbols:add" />
            Thêm Dịch Vụ
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === services.length && services.length > 0}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = selectedIds.length > 0 && selectedIds.length < services.length;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-cyan-700 cursor-pointer accent-cyan-700"
                    />
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dịch Vụ</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh Mục</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá Cơ Bản</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loại Giá</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                {services.map((item) => {
                  const pt = PRICE_TYPE_LABELS[item.price_type];
                  const category = item.category;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${
                        selectedIds.includes(item.id) ? "bg-red-50/20 dark:bg-red-950/10" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-cyan-700 cursor-pointer accent-cyan-700"
                        />
                      </td>
                      <td className="px-5 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">#{item.id}</td>

                      {/* Service Name + Description */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg shrink-0">
                            {category?.icon ? (
                              <Icon icon={category.icon} />
                            ) : (
                              <Icon icon="material-symbols:home-repair-service-outline-rounded" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-xs mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        {category ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                            {category.icon && <Icon icon={category.icon} className="text-base" />}
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{formatPrice(item.base_price)}</span>
                      </td>

                      {/* Price Type */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${pt?.color}`}>
                          <Icon icon={pt?.icon} className="text-sm" />
                          {pt?.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={12}
          onPageChange={(p) => fetchServices(p)}
        />
      </div>
    );
  };


  const renderModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal} />
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${modalMode === "add" ? "bg-teal-100 text-teal-600" : "bg-indigo-100 text-indigo-600"}`}>
                <Icon icon={modalMode === "add" ? "material-symbols:add" : "material-symbols:edit-note"} />
              </div>
              <h3 className="font-extrabold text-base">
                {modalMode === "add" ? "Thêm Dịch Vụ Mới" : "Chỉnh Sửa Dịch Vụ"}
              </h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh Mục *</label>
              <select
                name="category_id"
                value={formik.values.category_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all cursor-pointer ${
                  formik.touched.category_id && formik.errors.category_id ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {formik.touched.category_id && formik.errors.category_id && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.category_id as string}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên Dịch Vụ *</label>
              <input
                type="text"
                name="name"
                placeholder="Dọn dẹp nhà cơ bản..."
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
                placeholder="Mô tả dịch vụ..."
                value={formik.values.description}
                onChange={formik.handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Price + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá Cơ Bản (VNĐ) *</label>
                <input
                  type="number"
                  name="base_price"
                  min={0}
                  placeholder="50000"
                  value={formik.values.base_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                    formik.touched.base_price && formik.errors.base_price ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  }`}
                />
                {formik.touched.base_price && formik.errors.base_price && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.base_price as string}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loại Giá *</label>
                <select
                  name="price_type"
                  value={formik.values.price_type}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="hourly">Theo giờ</option>
                  <option value="fixed">Cố định</option>
                  <option value="daily">Theo ngày</option>
                </select>
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
      {renderToast()}
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderTable()}
      {renderModal()}
    </div>
  );
};

export default Services;
