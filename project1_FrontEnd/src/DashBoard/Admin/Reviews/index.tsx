import React from "react";
import { Icon } from "@iconify/react";
import { useAdminReviews } from "./useHook";
import { Toast } from "../../../components/Toast";
import { Pagination } from "../../../components/Pagination";

export const Reviews: React.FC = () => {
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
    toast,
    setToast,
  } = useAdminReviews();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          icon={i <= rating ? "material-symbols:star-rounded" : "material-symbols:star-outline-rounded"}
          className={`text-lg ${i <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-650"}`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Giám Sát Đánh Giá (Reviews)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống giám sát và đối soát phản hồi chất lượng dịch vụ của khách hàng và người giúp việc. (Quyền đọc)
        </p>
      </div>
    </div>
  );

  const renderKPIs = () => {
    const avgRating = reviews.length
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";
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
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{totalItems}</span>
          </div>
        </div>

        {/* Avg Rating Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:star-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Điểm Trung Bình</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{avgRating} / 5.0</span>
          </div>
        </div>

        {/* 5-Star Reviews Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:sentiment-very-satisfied-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Số Đánh Giá 5★</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{total5Star}</span>
          </div>
        </div>

        {/* Bad Reviews Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:sentiment-very-dissatisfied-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Đánh Giá Xấu (≤ 2★)</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{totalBad}</span>
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
            <option value="5">5 Sao ★</option>
            <option value="4">4 Sao ★</option>
            <option value="3">3 Sao ★</option>
            <option value="2">2 Sao ★</option>
            <option value="1">1 Sao ★</option>
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
                <th className="py-3 px-5">Khách Hàng</th>
                <th className="py-3 px-5">Người Giúp Việc</th>
                <th className="py-3 px-5">Đánh Giá</th>
                <th className="py-3 px-5">Nội Dung Nhận Xét</th>
                <th className="py-3 px-5">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
              {reviews.map((r) => {
                const customer = usersMap[r.customer_id];
                const helper = usersMap[r.helper_id];

                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    {/* Customer */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {customer?.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                          />
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
                          <img
                            src={helper.avatar}
                            alt={helper.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                          />
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
                    <td className="py-3 px-5">
                      {renderStars(r.rating)}
                    </td>

                    {/* Comment */}
                    <td className="py-3 px-5 max-w-xs truncate">
                      <span className={r.comment ? "text-slate-700 dark:text-slate-200" : "italic text-slate-400 dark:text-slate-500"}>
                        {r.comment || "Không có nhận xét bằng văn bản"}
                      </span>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-5 pb-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 w-full">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {renderHeader()}
      {renderKPIs()}
      {renderFilters()}
      {renderTable()}
    </div>
  );
};
