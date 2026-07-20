import { Icon } from "@iconify/react";
import ReactECharts from "echarts-for-react";
import { useAdminReviews } from "./useHook";
import { useAuth } from "../../../hooks/useAuth";
import { useState } from "react";
import { Pagination } from "../../../components/Pagination";
import { BulkDeleteBar } from "../../../components/BulkDeleteBar";
import { getInitials, formatNumberVI, formatMoneyShortVI } from "../../../utils";

export const Reviews = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    view: hasPermission("reviews.view"),
    create: hasPermission("reviews.create"),
    update: hasPermission("reviews.update"),
    delete: hasPermission("reviews.update"),
  };
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states - Create
  const [createCustomerId, setCreateCustomerId] = useState("");
  const [createHelperId, setCreateHelperId] = useState("");
  const [createRating, setCreateRating] = useState(5);
  const [createComment, setCreateComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Edit
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const {
    reviews,
    usersMap,
    loading,
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,

    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
    ratingDistributionOption,
    ratingBarOption,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
  } = useAdminReviews();

  const customersList = Object.values(usersMap).filter((u) => u.role_id === 4);
  const helpersList = Object.values(usersMap).filter((u) => u.role_id === 3);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          icon={i <= rating ? "material-symbols:star-rounded" : "material-symbols:star-outline-rounded"}
          className={`text-lg ${i <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-650"}`}
        />,
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createCustomerId || !createHelperId) {
      alert("Vui lòng chọn đầy đủ Khách hàng và Người giúp việc!");
      return;
    }
    setIsSubmitting(true);
    try {
      await handleCreateReview({
        customer_id: parseInt(createCustomerId),
        helper_id: parseInt(createHelperId),
        rating: createRating,
        comment: createComment,
      });
      // Reset & close
      setCreateCustomerId("");
      setCreateHelperId("");
      setCreateRating(5);
      setCreateComment("");
      setIsCreateOpen(false);
    } catch (err) {
      // already toasted
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    setIsSubmitting(true);
    try {
      await handleUpdateReview(editingReview.id, {
        rating: editRating,
        comment: editComment,
      });
      setIsEditOpen(false);
      setEditingReview(null);
    } catch (err) {
      // already toasted
    } finally {
      setIsSubmitting(false);
    }
  };

  // ECharts Configurations are retrieved from useAdminReviews hook

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Giám Sát Đánh Giá</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hệ thống giám sát và đối soát phản hồi chất lượng dịch vụ của khách hàng và người giúp việc.</p>
      </div>
      {permissions.create && (
        <button
          onClick={() => setIsCreateOpen(true)}
          className="cursor-pointer bg-[#008080] hover:bg-[#006666] active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-md shadow-[#008080]/20 text-sm"
        >
          <Icon icon="material-symbols:add-rounded" className="text-lg" />
          Thêm Đánh Giá
        </button>
      )}
    </div>
  );

  const renderKPIs = () => {
    const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0";
    const total5Star = reviews.filter((r) => r.rating === 5).length;
    const totalBad = reviews.filter((r) => r.rating <= 2).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Reviews Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:rate-review-outline-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Tổng Đánh Giá</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {totalItems >= 10_000_000 ? formatMoneyShortVI(totalItems) : formatNumberVI(totalItems)}
            </span>
          </div>
        </div>

        {/* Avg Rating Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:star-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Điểm Trung Bình</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{avgRating} / 5.0</span>
          </div>
        </div>

        {/* 5-Star Reviews Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:sentiment-very-satisfied-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Số Đánh Giá Tốt</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {total5Star >= 10_000_000 ? formatMoneyShortVI(total5Star) : formatNumberVI(total5Star)}
            </span>
          </div>
        </div>

        {/* Bad Reviews Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:sentiment-very-dissatisfied-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Đánh Giá Xấu</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {totalBad >= 10_000_000 ? formatMoneyShortVI(totalBad) : formatNumberVI(totalBad)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in">
        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
          <div className="h-80 w-full flex items-center justify-center">
            <ReactECharts option={ratingDistributionOption} style={{ height: "100%", width: "100%" }} notMerge={true} lazyUpdate={true} />
          </div>
        </div>
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
          <div className="h-80 w-full flex items-center justify-center">
            <ReactECharts option={ratingBarOption} style={{ height: "100%", width: "100%" }} notMerge={true} lazyUpdate={true} />
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative w-full md:w-96">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 text-lg">
          <Icon icon="material-symbols:search-rounded" />
        </span>
        <input
          type="text"
          placeholder="Tìm theo tên Khách hàng, Người giúp việc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Số:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-705 dark:text-slate-200 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">Đang tải danh sách đánh giá...</p>
        </div>
      );
    }

    if (!reviews.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-neutral-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy đánh giá nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Không có dữ liệu đánh giá phù hợp với bộ lọc hiện tại.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-4xl">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-700 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                {permissions.delete && (
                  <th className="py-3 px-5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === reviews.length && reviews.length > 0}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = selectedIds.length > 0 && selectedIds.length < reviews.length;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </th>
                )}
                <th className="py-3 px-5">Khách Hàng</th>
                <th className="py-3 px-5">Người Giúp Việc</th>
                <th className="py-3 px-5">Đánh Giá</th>
                <th className="py-3 px-5">Nội Dung Nhận Xét</th>
                <th className="py-3 px-5">Thời Gian</th>
                {(permissions.update || permissions.delete) && <th className="py-3 px-5 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
              {reviews.map((r) => {
                const customer = usersMap[r.customer_id];
                const helper = usersMap[r.helper_id];
                const isSelected = selectedIds.includes(r.id);

                return (
                  <tr key={r.id} className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-750/30 ${isSelected ? "bg-red-50/20 dark:bg-red-950/10" : ""}`}>
                    {permissions.delete && (
                      <td className="py-3 px-5 text-center">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelectOne(r.id)} className="w-4 h-4 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600" />
                      </td>
                    )}
                    {/* Customer */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {customer?.avatar ? (
                          <img src={customer.avatar} alt={customer.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            {getInitials(customer?.full_name || "Customer")}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{customer?.full_name || `Khách hàng #${r.customer_id}`}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{customer?.email || "N/A"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Helper */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {helper?.avatar ? (
                          <img src={helper.avatar} alt={helper.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            {getInitials(helper?.full_name || "Helper")}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{helper?.full_name || `Người giúp việc #${r.helper_id}`}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{helper?.email || "N/A"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-5">{renderStars(r.rating)}</td>

                    {/* Comment */}
                    <td className="py-3 px-5 max-w-xs">
                      <div className="truncate" title={r.comment || ""}>
                        <span className={r.comment ? "text-slate-700 dark:text-slate-200" : "italic text-slate-400 dark:text-slate-500"}>
                          {r.comment || "Không có nhận xét bằng văn bản"}
                        </span>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(r.created_at).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    {(permissions.update || permissions.delete) && (
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {permissions.update && (
                            <button
                              onClick={() => {
                                setEditingReview(r);
                                setEditRating(r.rating);
                                setEditComment(r.comment || "");
                                setIsEditOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                              title="Sửa đánh giá"
                            >
                              <Icon icon="material-symbols:edit-outline-rounded" className="text-lg" />
                            </button>
                          )}
                          {permissions.delete && (
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Xóa đánh giá"
                            >
                              <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-5 pb-4">
          <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      </div>
    );
  };

  const renderCreateModal = () => {
    if (!isCreateOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <Icon icon="material-symbols:add-reaction-outline-rounded" className="text-xl text-[#008080]" />
              Tạo Đánh Giá Mới
            </h3>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <Icon icon="material-symbols:close-rounded" className="text-xl" />
            </button>
          </div>
          <form onSubmit={handleCreateSubmit} className="p-6 flex flex-col gap-4">
            {/* Customer Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khách Hàng</label>
              <select
                required
                value={createCustomerId}
                onChange={(e) => setCreateCustomerId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
              >
                <option value="">-- Chọn Khách Hàng --</option>
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Helper Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Người Giúp Việc</label>
              <select
                required
                value={createHelperId}
                onChange={(e) => setCreateHelperId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
              >
                <option value="">-- Chọn Người Giúp Việc --</option>
                {helpersList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.full_name} ({h.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Sao Đánh Giá</label>
              <select
                required
                value={createRating}
                onChange={(e) => setCreateRating(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
              >
                <option value="5">5 Sao</option>
                <option value="4">4 Sao</option>
                <option value="3">3 Sao</option>
                <option value="2">2 Sao</option>
                <option value="1">1 Sao</option>
              </select>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nhận Xét</label>
              <textarea
                placeholder="Nhập nội dung phản hồi của khách hàng..."
                value={createComment}
                onChange={(e) => setCreateComment(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#008080] hover:bg-[#006666] active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-[#008080]/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu lại"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!isEditOpen || !editingReview) return null;
    const customer = usersMap[editingReview.customer_id];
    const helper = usersMap[editingReview.helper_id];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300">
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <Icon icon="material-symbols:edit-document-outline-rounded" className="text-xl text-blue-650" />
              Sửa Đánh Giá
            </h3>
            <button
              onClick={() => setIsEditOpen(false)}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <Icon icon="material-symbols:close-rounded" className="text-xl" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
            {/* Meta Info Readonly */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Khách Hàng</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{customer?.full_name || `Khách hàng #${editingReview.customer_id}`}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Người Giúp Việc</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">{helper?.full_name || `Người giúp việc #${editingReview.helper_id}`}</span>
              </div>
            </div>

            {/* Rating Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Sao Đánh Giá</label>
              <select
                required
                value={editRating}
                onChange={(e) => setEditRating(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
              >
                <option value="5">5 Sao</option>
                <option value="4">4 Sao</option>
                <option value="3">3 Sao</option>
                <option value="2">2 Sao</option>
                <option value="1">1 Sao</option>
              </select>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nhận Xét</label>
              <textarea
                placeholder="Nhập nội dung phản hồi của khách hàng..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 w-full">
      {renderHeader()}
      {renderKPIs()}
      {renderCharts()}
      {renderFilters()}
      {permissions.delete && selectedIds.length > 0 && (
        <div className="mb-4">
          <BulkDeleteBar selectedIds={selectedIds} totalCount={reviews.length} onToggleAll={toggleSelectAll} onDeleteSelected={handleBulkDelete} onClear={clearSelection} loading={loading} />
        </div>
      )}
      {renderTable()}
      {renderCreateModal()}
      {renderEditModal()}
    </div>
  );
};
