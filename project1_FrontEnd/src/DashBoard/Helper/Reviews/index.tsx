import { Icon } from "@iconify/react";
import { useHelperReviews } from "./useHook";
import { Pagination } from "../../../components/Pagination";
import { ReviewCard, RatingDistributionRow } from "../../../components/Reviews";
import { renderStars } from "../../../utils";

export const HelperReviewsPage = () => {
  const { reviews, totalReviews, ratingAvg, ratingDistribution, loading, error, currentPage, setCurrentPage, ratingFilter, setRatingFilter, itemsPerPage } = useHelperReviews();

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Nhận Xét & Đánh Giá</h2>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-1">Xem phản hồi, nhận xét và xếp hạng chất lượng từ khách hàng đã sử dụng dịch vụ của bạn.</p>
      </div>
    </div>
  );

  const renderKPIs = () => {
    const avg = ratingAvg ? ratingAvg.toFixed(1) : "0.0";

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-lg font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-2">Điểm Đánh Giá</span>
          <span className="text-5xl font-black text-slate-850 dark:text-slate-100 mb-2">{avg}</span>
          {renderStars(Math.round(ratingAvg || 0))}
          <span className="text-base text-slate-400 dark:text-slate-550 mt-3 font-semibold">Dựa trên {totalReviews} lượt đánh giá</span>
        </div>

        <div className="bg-white dark:bg-slate-805 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 block">Phân Bổ Xếp Hạng</h3>
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingDistributionRow key={star} star={star} count={ratingDistribution[star] || 0} total={totalReviews} showPercentText={true} />
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-slate-600 dark:text-slate-350">Lọc theo số sao:</span>
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 text-base px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold cursor-pointer"
        >
          <option value="all">Tất cả đánh giá</option>
          <option value="5">5 Sao</option>
          <option value="4">4 Sao</option>
          <option value="3">3 Sao</option>
          <option value="2">2 Sao</option>
          <option value="1">1 Sao</option>
        </select>
      </div>
      <div className="text-lg font-bold text-slate-450 dark:text-slate-500 hidden sm:block">Tổng số: {totalReviews}</div>
    </div>
  );

  const renderReviewsList = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-4 font-semibold">Đang tải nhận xét...</p>
        </div>
      );
    }

    if (error) {
      return <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-750 p-5 rounded-2xl text-center font-bold text-lg">{error}</div>;
    }

    if (!reviews.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:rate-review-outline" />
          </div>
          <h3 className="text-xl font-bold text-slate-850 dark:text-slate-200">Không tìm thấy đánh giá nào</h3>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Bạn chưa nhận được đánh giá nào hoặc không có nhận xét phù hợp với lựa chọn lọc.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} variant="dashboard" />
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Pagination currentPage={currentPage} totalItems={totalReviews} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 w-full max-w-8xl mx-auto space-y-6">
      {renderHeader()}
      {renderKPIs()}
      {renderFilters()}
      {renderReviewsList()}
    </div>
  );
};

export default HelperReviewsPage;
