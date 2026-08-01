import { useNewsAdmin } from "./useHook";
import { Icon } from "@iconify/react";
import { useAuth } from "../../../hooks/useAuth";
import { Pagination } from "../../../components/Pagination";
import { getImageUrl } from "../../../utils/images";
import Toggle from "../../../components/Toggle";
import ImageUpload from "../../../components/ImageUpload";
import { uploadNewsImage } from "../../../api/newsApi/news";

export const NewsAdmin = () => {
  const { hasPermission } = useAuth();

  const permissions = {
    create: hasPermission("news.create"),
    update: hasPermission("news.update"),
    delete: hasPermission("news.delete"),
  };
  const {
    news,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalItems,
    perPage,
    isModalOpen,
    modalMode,
    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDeleteNews,
    handleToggleStatus,
  } = useNewsAdmin();

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Quản Lý Tin Tức</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý các bài viết tin tức, kinh nghiệm hiển thị trên trang chủ.</p>
        </div>
        {permissions.create && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
            Tạo Bài Viết Mới
          </button>
        )}
      </div>
    );
  };

  const renderStats = () => {
    const publishedCount = news.filter((n) => n.status === "published").length;
    const draftCount = news.filter((n) => n.status === "draft").length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:newspaper" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng Bài Viết</p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800 dark:text-slate-100">{totalItems}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:visibility-outline-rounded" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đã Xuất Bản</p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800 dark:text-slate-100">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:visibility-off-outline-rounded" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bản Nháp (Ẩn)</p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800 dark:text-slate-100">{draftCount}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>
    );
  };

  const renderNewsGrid = () => {
    if (loading && news.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải dữ liệu từ máy chủ...</p>
        </div>
      );
    }

    if (news.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:newspaper" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy bài viết nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Thử thay đổi từ khóa tìm kiếm hoặc tạo một bài viết mới.</p>
          {permissions.create && (
            <button
              onClick={openAddModal}
              className="mt-5 flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-sm"
            >
              <Icon icon="material-symbols:add" />
              Tạo Bài Viết Đầu Tiên
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                {item.thumbnail ? (
                  <img
                    src={getImageUrl(item.thumbnail)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/800x450/e2e8f0/64748b?text=Lỗi+Tải+Ảnh";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <Icon icon="material-symbols:newspaper" className="text-5xl" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md flex items-center gap-1.5 ${
                      item.status === "published" ? "bg-emerald-500/90 text-white" : "bg-amber-500/95 text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${item.status === "published" ? "animate-pulse" : ""}`}></span>
                    {item.status === "published" ? "Xuất Bản" : "Bản Nháp"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-slate-850 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-900 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="material-symbols:calendar-today-outline" className="text-base text-slate-400 shrink-0" />
                      <span>{new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon icon="material-symbols:person-outline-rounded" className="text-base text-slate-400 shrink-0" />
                      <span>
                        Người tạo: <span className="font-medium text-slate-700 dark:text-slate-300">{item.creator?.full_name || "Quản trị viên"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                  {permissions.update ? <Toggle checked={item.status === "published"} onChange={() => handleToggleStatus(item)} activeLabel="Hoạt động" inactiveLabel="Tạm ngưng" /> : <div />}

                  <div className="flex items-center gap-1">
                    {permissions.update && (
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                      </button>
                    )}
                    {permissions.delete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-655 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-500 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={perPage} onPageChange={(page) => setCurrentPage(page)} />
      </div>
    );
  };

  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal}></div>
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${modalMode === "add" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"}`}>
                <Icon icon={modalMode === "add" ? "material-symbols:add" : "material-symbols:edit-note"} />
              </div>
              <h3 className="font-extrabold text-base">{modalMode === "add" ? "Thêm Mới Bài Viết" : "Chỉnh Sửa Bài Viết"}</h3>
            </div>
            <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiêu Đề Bài Viết *</label>
              <input
                type="text"
                name="title"
                placeholder="Nhập tiêu đề..."
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.title && formik.errors.title ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>}
            </div>

            {/* Image Upload Component */}
            <ImageUpload
              label="Hình Ảnh Thu Nhỏ (Thumbnail)"
              value={formik.values.thumbnail || ""}
              onChange={(val) => formik.setFieldValue("thumbnail", val)}
              onUpload={uploadNewsImage}
              error={formik.errors.thumbnail}
              touched={formik.touched.thumbnail}
              aspectRatio="video"
              placeholder="Nhập link ảnh hoặc bấm chọn tệp để tải lên..."
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô Tả Ngắn (Summary)</label>
              <textarea
                name="summary"
                rows={2}
                placeholder="Nhập mô tả ngắn..."
                value={formik.values.summary}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all resize-none ${
                  formik.touched.summary && formik.errors.summary ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              ></textarea>
              {formik.touched.summary && formik.errors.summary && <p className="text-red-500 text-xs mt-1">{formik.errors.summary}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nội Dung Bài Viết (HTML) *</label>
              <textarea
                name="content"
                rows={6}
                placeholder="<p>Nhập nội dung bài viết...</p>"
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all ${
                  formik.touched.content && formik.errors.content ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              ></textarea>
              {formik.touched.content && formik.errors.content && <p className="text-red-500 text-xs mt-1">{formik.errors.content}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng Thái</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => formik.setFieldValue("status", "published")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none ${
                    formik.values.status === "published"
                      ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-650 dark:text-slate-405"
                  }`}
                >
                  <Icon icon="material-symbols:check-circle-outline-rounded" className="text-xl shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Xuất Bản</p>
                    <p className="text-xs opacity-75 mt-0.5">Hiển thị công khai</p>
                  </div>
                </div>

                <div
                  onClick={() => formik.setFieldValue("status", "draft")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none ${
                    formik.values.status === "draft"
                      ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 text-amber-700 dark:text-amber-450"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-650 dark:text-slate-405"
                  }`}
                >
                  <Icon icon="material-symbols:edit-document-outline" className="text-xl shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Bản Nháp</p>
                    <p className="text-xs opacity-75 mt-0.5">Lưu ẩn, có thể sửa lại</p>
                  </div>
                </div>
              </div>
            </div>

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
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderNewsGrid()}
      {renderModal()}
    </div>
  );
};

export default NewsAdmin;
