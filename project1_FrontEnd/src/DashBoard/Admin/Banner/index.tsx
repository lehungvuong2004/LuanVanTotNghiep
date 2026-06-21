import { useBanner } from "./useHook";
import { Icon } from "@iconify/react";
import { Toast } from "../../../components/Toast";

export const Banners = () => {
  const {
    banners,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    isModalOpen,
    modalMode,
    toast,
    setToast,
    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDeleteBanner,
    handleToggleStatus,
  } = useBanner();

  // 1. Toast message renderer
  const renderToast = () => {
    if (!toast) return null;
    return <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />;
  };

  // 2. Main banner system header
  const renderHeader = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-end">
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-5 py-3 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
            Tạo Banner Mới
          </button>
        </div>
    );
  };

  // 3. Stats section block
  const renderStats = () => {
    const activeCount = banners.filter((b) => b.status === "active").length;
    const inactiveCount = banners.filter((b) => b.status === "inactive").length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:ad-units-outline" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Banner</p>
            <p className="text-2xl font-bold mt-0.5">{totalItems}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:visibility-outline-rounded" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đang Hiển Thị</p>
            <p className="text-2xl font-bold mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:visibility-off-outline-rounded" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đang Ẩn</p>
            <p className="text-2xl font-bold mt-0.5">{inactiveCount}</p>
          </div>
        </div>
      </div>
    );
  };

  // 4. Filters bar (Search and Status tab)
  const renderFilters = () => {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề banner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái:</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Hoạt Động
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Đang Ẩn
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 5. Grid list of banners and pagination controls
  const renderBannerGrid = () => {
    if (loading && banners.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải dữ liệu từ máy chủ...</p>
        </div>
      );
    }

    if (banners.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-dissatisfied-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy banner nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Thử thay đổi từ khóa tìm kiếm hoặc tạo một banner quảng cáo mới.</p>
          <button
            onClick={openAddModal}
            className="mt-5 flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Icon icon="material-symbols:add" />
            Tạo Banner Đầu Tiên
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col"
            >
              {/* Image with status badge */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x450/e2e8f0/64748b?text=Lỗi+Tải+Ảnh";
                  }}
                />

                {/* Top overlay elements */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-xs flex items-center gap-1 ${
                      banner.status === "active" ? "bg-emerald-500/90 text-white" : "bg-amber-500/95 text-white"
                    }`}
                  >
                    <Icon icon={banner.status === "active" ? "material-symbols:check-circle" : "material-symbols:warning"} />
                    {banner.status === "active" ? "Hoạt Động" : "Đang Ẩn"}
                  </span>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="w-8 h-8 rounded-lg bg-white/90 text-slate-700 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Icon icon="material-symbols:edit-outline" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="w-8 h-8 rounded-lg bg-white/90 text-red-650 hover:bg-red-600 hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Icon icon="material-symbols:delete-outline" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{banner.title}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {banner.link ? (
                      <div className="flex items-center gap-1.5">
                        <Icon icon="material-symbols:link" className="text-base text-slate-400" />
                        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 break-all">
                          {banner.link}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Icon icon="material-symbols:link-off" className="text-base" />
                        <span>Không có liên kết</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Icon icon="material-symbols:person-outline" className="text-base text-slate-400" />
                      <span>Tạo bởi: {banner.creator?.full_name || "Admin"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions footer of card */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      banner.status === "active" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    <Icon icon={banner.status === "active" ? "material-symbols:visibility-off" : "material-symbols:visibility"} className="text-sm" />
                    {banner.status === "active" ? "Ẩn Banner" : "Hiện Banner"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-650 hover:bg-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 pt-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Hiển thị trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
            </p>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon icon="material-symbols:chevron-left-rounded" className="text-xl" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon icon="material-symbols:chevron-right-rounded" className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 6. Dialog Modal renderer for Add / Edit
  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>

        {/* Modal Content */}
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${modalMode === "add" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"}`}>
                <Icon icon={modalMode === "add" ? "material-symbols:add" : "material-symbols:edit-note"} />
              </div>
              <h3 className="font-extrabold text-base">{modalMode === "add" ? "Thêm Mới Banner" : "Chỉnh Sửa Banner"}</h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Title input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiêu Đề Banner *</label>
              <input
                type="text"
                name="title"
                placeholder="Nhập tiêu đề, VD: Khuyến mãi dọn dẹp nhà cửa..."
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.title && formik.errors.title ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>}
            </div>

            {/* Destination Link */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đường Dẫn Liên Kết (Link URL)</label>
              <input
                type="url"
                name="link"
                placeholder="https://example.com/khuyen-mai"
                value={formik.values.link || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.link && formik.errors.link ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.link && formik.errors.link && <p className="text-red-500 text-xs mt-1">{formik.errors.link}</p>}
            </div>

            {/* Image Link */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link Hình Ảnh Banner (Image URL) *</label>
              <input
                type="text"
                name="image"
                placeholder="Nhập link ảnh, VD: https://images.unsplash.com/banner.jpg"
                value={formik.values.image}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.image && formik.errors.image ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.image && formik.errors.image && <p className="text-red-500 text-xs mt-1">{formik.errors.image}</p>}
            </div>

            {/* Live Preview section */}
            {formik.values.image && !formik.errors.image && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hình Ảnh Xem Trước</span>
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-900">
                  <img
                    src={formik.values.image}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/800x450/e2e8f0/64748b?text=Đường+dẫn+ảnh+không+hợp+lệ";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng Thái Mặc Định</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formik.values.status === "active"}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-emerald-600 dark:text-emerald-400">Hiển thị (Active)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formik.values.status === "inactive"}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-amber-600 dark:text-amber-400">Ẩn đi (Inactive)</span>
                </label>
              </div>
              {formik.touched.status && formik.errors.status && <p className="text-red-500 text-xs mt-1">{formik.errors.status}</p>}
            </div>

            {/* Actions footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3 mt-6">
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
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/10 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200">
      {renderToast()}
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderBannerGrid()}
      {renderModal()}
    </div>
  );
};
