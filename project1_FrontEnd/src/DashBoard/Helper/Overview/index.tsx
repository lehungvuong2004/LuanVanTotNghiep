import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { useHelperOverview } from "./useHook";
import { formatNumberVI } from "../../../utils";

export const HelperOverview = () => {
  const { data, loading, error, barOption, pieOption } = useHelperOverview();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-96">
        <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-blue-600 mb-2" />
        <span className="text-slate-500 text-sm">Đang tải thống kê bảng điều khiển...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-5 w-full max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <Icon icon="material-symbols:error-outline-rounded" className="text-xl" />
          <span>{error || "Không có dữ liệu hiển thị"}</span>
        </div>
      </div>
    );
  }

  const { earnings, jobs, reviews, operations } = data;

  // Render Verification Badge helper
  const renderVerificationStatus = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900">
            <Icon icon="material-symbols:check-circle-rounded" className="text-sm" />
            Đã Kiểm Duyệt
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900">
            <Icon icon="material-symbols:pending-actions-rounded" className="text-sm" />
            Đang Chờ Duyệt Hồ Sơ
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900">
            <Icon icon="material-symbols:cancel-rounded" className="text-sm" />
            Hồ Sơ Bị Từ Chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <Icon icon="material-symbols:info-rounded" className="text-sm" />
            Chưa Nộp Xét Duyệt
          </span>
        );
    }
  };

  // Helper to render star rating using forEach
  const renderStars = (rating: number) => {
    const stars = [];
    [...Array(5)].forEach((_, i) => {
      stars.push(
        <Icon
          key={i}
          icon="material-symbols:star-rounded"
          className={`text-xs ${i < rating ? "text-amber-400" : "text-slate-300"}`}
        />
      );
    });
    return stars;
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bảng Điều Khiển Helper</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Chào mừng trở lại! Theo dõi thu nhập, hiệu quả công việc và các hoạt động vận hành của bạn tại đây.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-450 dark:text-slate-500 font-medium">Trạng thái tài khoản:</span>
        {renderVerificationStatus(operations.verification_status)}
      </div>
    </div>
  );

  const renderKPICards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng thu nhập */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Tổng Thu Nhập
          </span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formatNumberVI(earnings.total_income)} ₫
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
            <Icon icon="material-symbols:trending-up-rounded" />
            Doanh thu hoàn tất
          </span>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
          <Icon icon="material-symbols:payments-outline-rounded" className="text-2xl" />
        </div>
      </div>

      {/* KPI 2: Số công việc hoàn thành */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Công Việc Hoàn Thành
          </span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">
            {jobs.completed_jobs}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
            <Icon icon="material-symbols:task-alt-rounded" />
            Đơn hàng thành công
          </span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
          <Icon icon="material-symbols:check-circle-outline-rounded" className="text-2xl" />
        </div>
      </div>

      {/* KPI 3: Đánh giá trung bình */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Đánh Giá Trung Bình
          </span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">
            {reviews.rating_avg} / 5
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-500 mt-1">
            <Icon icon="material-symbols:star-rounded" />
            {reviews.total_reviews} lượt đánh giá
          </span>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500">
          <Icon icon="material-symbols:star-outline-rounded" className="text-2xl" />
        </div>
      </div>

      {/* KPI 4: Lịch rảnh tuần này */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Lịch Rảnh Đã Đăng
          </span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">
            {operations.availabilities_this_week}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            <Icon icon="material-symbols:date-range-outline-rounded" />
            Trong tuần này
          </span>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
          <Icon icon="material-symbols:calendar-month-outline-rounded" className="text-2xl" />
        </div>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Monthly earnings chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col min-h-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Thu Nhập Hàng Tháng (VNĐ)</h3>
          <span className="text-xs text-slate-455 dark:text-slate-500">Thống kê theo tháng thanh toán</span>
        </div>
        <div className="flex-1 h-80">
          <ReactECharts option={barOption} style={{ height: "100%", width: "100%" }} notMerge={true} lazyUpdate={true} />
        </div>
      </div>

      {/* Earnings source distribution */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col min-h-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Cơ Cấu Nguồn Thu</h3>
        </div>
        <div className="flex-1 h-64 relative flex items-center justify-center">
          <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} notMerge={true} lazyUpdate={true} />
        </div>
        <div className="mt-2 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Đặt lịch trực tiếp:</span>
            <span className="font-bold text-emerald-600">{formatNumberVI(earnings.booking_income)} ₫</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Bài đăng tuyển dụng:</span>
            <span className="font-bold text-violet-600">{formatNumberVI(earnings.job_post_income)} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceAndReviews = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Performance metrics & Operations */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Chỉ Số Hiệu Suất Công Việc
          </h3>
          <div className="space-y-5">
            {/* Job progress statuses count */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10">
                <span className="block text-lg font-black text-amber-600">{jobs.waiting_confirmation_jobs}</span>
                <span className="text-xxs text-slate-500 uppercase tracking-wider block mt-1">Chờ Xác Nhận</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10">
                <span className="block text-lg font-black text-blue-600">{jobs.in_progress_jobs}</span>
                <span className="text-xxs text-slate-500 uppercase tracking-wider block mt-1">Đang Thực Hiện</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10">
                <span className="block text-lg font-black text-emerald-600">{jobs.completed_jobs}</span>
                <span className="text-xxs text-slate-500 uppercase tracking-wider block mt-1">Hoàn Thành</span>
              </div>
            </div>

            {/* Progress: Acceptance Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tỷ lệ chấp nhận yêu cầu:</span>
                <span className="font-bold text-emerald-600">{jobs.acceptance_rate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${jobs.acceptance_rate}%` }}
                />
              </div>
            </div>

            {/* Progress: Cancel Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tỷ lệ hủy công việc:</span>
                <span className="font-bold text-rose-600">{jobs.cancel_rate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${jobs.cancel_rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 grid grid-cols-2 gap-4 text-sm text-slate-650 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Icon icon="material-symbols:location-on-outline-rounded" className="text-lg text-slate-400" />
            <span>Khu vực hoạt động: <strong className="text-slate-800 dark:text-slate-200">{operations.active_working_areas}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="material-symbols:verified-user-outline-rounded" className="text-lg text-slate-400" />
            <span>Xét duyệt: <strong className="text-slate-800 dark:text-slate-200">
              {operations.verification_status === "approved" || operations.verification_status === "active" ? "Đã đạt" : "Chưa đạt"}
            </strong></span>
          </div>
        </div>
      </div>

      {/* Recent Reviews list */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Đánh Giá Mới Nhất
          </h3>
          {reviews.recent_reviews.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center">
              <Icon icon="material-symbols:rate-review-outline" className="text-4xl mb-2 text-slate-350" />
              <span className="text-sm">Bạn chưa nhận được đánh giá nào.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.recent_reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.customer?.avatar ? (
                        <img
                          src={rev.customer.avatar}
                          alt={rev.customer.full_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {rev.customer?.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {rev.customer?.full_name || "Khách hàng ẩn danh"}
                        </h4>
                        <span className="text-xxs text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {renderStars(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{rev.comment || "Không có bình luận"}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-5 w-full max-w-7xl mx-auto space-y-6">
      {renderHeader()}
      {renderKPICards()}
      {renderCharts()}
      {renderPerformanceAndReviews()}
    </div>
  );
};
