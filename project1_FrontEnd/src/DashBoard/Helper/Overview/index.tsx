import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { useHelperOverview } from "./useHook";
import { formatNumberVI, renderStars } from "../../../utils";
import { Link } from "react-router-dom";

export const HelperOverview = () => {
  const { data, loading, error, barOption, pieOption } = useHelperOverview();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-96">
        <Icon icon="line-md:loading-twotone-loop" className="text-5xl text-blue-600 mb-3" />
        <span className="text-slate-550 text-xl font-bold">Đang tải thống kê bảng điều khiển...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-6 w-full max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 p-5 rounded-2xl flex items-center gap-3 text-xl font-bold">
          <Icon icon="material-symbols:error-outline-rounded" className="text-2xl" />
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900">
            <Icon icon="material-symbols:check-circle-rounded" className="text-xl" />
            Đã Kiểm Duyệt
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold bg-amber-50 text-amber-700 border border-amber-205 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900">
            <Icon icon="material-symbols:pending-actions-rounded" className="text-xl" />
            Đang Chờ Duyệt Hồ Sơ
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold bg-rose-50 text-rose-700 border border-rose-205 dark:bg-rose-955/20 dark:text-rose-450 dark:border-rose-900">
            <Icon icon="material-symbols:cancel-rounded" className="text-xl" />
            Hồ Sơ Bị Từ Chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold bg-slate-100 text-slate-700 border border-slate-205 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <Icon icon="material-symbols:info-rounded" className="text-xl" />
            Chưa Nộp Xét Duyệt
          </span>
        );
    }
  };

  // 1. Header Function
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Bảng Điều Khiển Helper</h1>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-1.5">Chào mừng trở lại! Theo dõi thu nhập, hiệu quả công việc và các hoạt động vận hành của bạn tại đây.</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg text-slate-600 dark:text-slate-450 font-bold">Trạng thái tài khoản:</span>
        {renderVerificationStatus(operations.verification_status)}
      </div>
    </div>
  );

  // 2. Vertical KPI Stack Function
  const renderKPICards = () => (
    <div className="flex flex-col justify-between gap-5 h-full">
      {/* KPI 1: Tổng thu nhập */}
      <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-lg font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Tổng Thu Nhập</span>
          <span className="block text-3xl font-black text-slate-800 dark:text-slate-100">{formatNumberVI(earnings.total_income)} ₫</span>
          <span className="inline-flex items-center gap-1 text-base font-bold text-emerald-650 mt-1.5">
            <Icon icon="material-symbols:trending-up-rounded" className="text-xl" />
            Doanh thu hoàn tất
          </span>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-955/35 text-blue-600">
          <Icon icon="material-symbols:payments-outline-rounded" className="text-3xl" />
        </div>
      </div>

      {/* KPI 3: Đánh giá trung bình */}
      <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-lg font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Đánh Giá Trung Bình</span>
          <span className="block text-3xl font-black text-slate-800 dark:text-slate-100">{reviews.rating_avg} / 5</span>
          <span className="inline-flex items-center gap-1 text-base font-bold text-amber-500 mt-1.5">
            <Icon icon="material-symbols:star-rounded" className="text-xl" />
            {reviews.total_reviews} lượt đánh giá
          </span>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-955/35 text-amber-500">
          <Icon icon="material-symbols:star-outline-rounded" className="text-3xl" />
        </div>
      </div>

      {/* KPI 2: Số công việc hoàn thành */}
      <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
          <span className="block text-lg font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Công Việc Hoàn Thành</span>
          <span className="block text-3xl font-black text-slate-800 dark:text-slate-100">{jobs.completed_jobs}</span>
          <span className="inline-flex items-center gap-1 text-base font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
            <Icon icon="material-symbols:task-alt-rounded" className="text-xl" />
            Đơn hàng thành công
          </span>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-955/35 text-emerald-600">
          <Icon icon="material-symbols:check-circle-outline-rounded" className="text-3xl" />
        </div>
      </div>
    </div>
  );

  // 3. Source Distribution Pie Chart Function
  const renderSourcePie = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Cơ Cấu Nguồn Thu</h1>
      </div>
      <div className="flex-1 h-65 min-h-65 relative flex items-center justify-center">
        <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} notMerge={true} lazyUpdate={true} />
      </div>
      <div className="mt-4 space-y-3.5 border-t border-slate-100 dark:border-slate-700 pt-4 text-xl">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-slate-500 font-semibold">Đặt lịch trực tiếp</span>
            <span className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">(Thu nhập đã khấu trừ 20% hoa hồng vận hành)</span>
          </div>
          <span className="font-bold text-emerald-650">{formatNumberVI(earnings.booking_income)} ₫</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-slate-500 font-semibold">Bài đăng tuyển dụng</span>
            <span className="text-xs text-slate-455 dark:text-slate-550 mt-0.5">(Thu nhập đã khấu trừ 10% hoa hồng kết nối)</span>
          </div>
          <span className="font-bold text-violet-600">{formatNumberVI(earnings.job_post_income)} ₫</span>
        </div>
      </div>
    </div>
  );

  // 4. Monthly Income Line Chart Function
  const renderMonthlyChart = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Thu Nhập Hàng Tháng (VNĐ)</h1>
        <span className="text-lg font-semibold text-slate-400">Thống kê theo tháng thanh toán</span>
      </div>
      <div className="w-full h-87.5">
        <ReactECharts option={barOption} style={{ height: "100%", width: "100%" }} notMerge={true} lazyUpdate={true} />
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">Chỉ Số Hiệu Suất Công Việc</h1>
        <div className="space-y-6">
          {/* Job progress statuses count */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-955/10">
              <span className="block text-3xl font-black text-amber-600">{jobs.waiting_confirmation_jobs}</span>
              <span className="text-base font-bold text-slate-500 uppercase tracking-wider block mt-1">Chờ Xác Nhận</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-955/10">
              <span className="block text-3xl font-black text-blue-600">{jobs.in_progress_jobs}</span>
              <span className="text-base font-bold text-slate-500 uppercase tracking-wider block mt-1">Đang Thực Hiện</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-955/10">
              <span className="block text-3xl font-black text-emerald-600">{jobs.completed_jobs}</span>
              <span className="text-base font-bold text-slate-500 uppercase tracking-wider block mt-1">Hoàn Thành</span>
            </div>
          </div>

          {/* Progress: Acceptance Rate */}
          <div className="space-y-1.5 flex flex-col">
            <div className="flex justify-between text-xl font-semibold text-slate-700 dark:text-slate-350">
              <span>Tỷ lệ chấp nhận yêu cầu:</span>
              <span className="font-bold text-emerald-650">{jobs.acceptance_rate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${jobs.acceptance_rate}%` }} />
            </div>
          </div>

          {/* Progress: Cancel Rate */}
          <div className="space-y-1.5 flex flex-col">
            <div className="flex justify-between text-xl font-semibold text-slate-700 dark:text-slate-355">
              <span>Tỷ lệ hủy công việc:</span>
              <span className="font-bold text-rose-650">{jobs.cancel_rate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${jobs.cancel_rate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xl text-slate-650 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2.5">
          <Icon icon="material-symbols:location-on-outline-rounded" className="text-2xl text-slate-400" />
          <span>
            Khu vực hoạt động: <strong className="text-slate-805 dark:text-slate-200">{operations.active_working_areas}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Icon icon="material-symbols:verified-user-outline-rounded" className="text-2xl text-slate-405" />
          <span>
            Xét duyệt:{" "}
            <strong className="text-slate-800 dark:text-slate-202">{operations.verification_status === "approved" || operations.verification_status === "active" ? "Đã đạt" : "Chưa đạt"}</strong>
          </span>
        </div>
      </div>
    </div>
  );

  // 6. Recent Reviews Feedback Function
  const renderRecentReviews = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-105 dark:border-slate-700">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Đánh Giá Mới Nhất</h1>
          <Link to="/helper/reviews" className="text-lg font-bold text-blue-600 hover:text-cyan-850 shrink-0">
            Xem tất cả
          </Link>
        </div>
        {reviews.recent_reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-450 flex flex-col items-center justify-center">
            <Icon icon="material-symbols:rate-review-outline" className="text-6xl mb-2 text-slate-350" />
            <span className="text-lg font-bold">Bạn chưa nhận được đánh giá nào.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.recent_reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl space-y-3.5 border border-slate-100 dark:border-slate-808">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.customer?.avatar ? (
                      <img src={rev.customer.avatar} alt={rev.customer.full_name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-105 dark:bg-blue-900/50 text-blue-705 dark:text-blue-305 flex items-center justify-center font-black text-xl">
                        {rev.customer?.full_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-slate-850 dark:text-slate-200 leading-tight">{rev.customer?.full_name || "Khách hàng ẩn danh"}</h4>
                      <span className="text-lg text-slate-400 font-medium">{new Date(rev.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  {renderStars(rev.rating)}
                </div>
                <p className="text-xl text-slate-650 dark:text-slate-300 italic leading-relaxed">"{rev.comment || "Không có bình luận"}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-5 w-full max-w-8xl mx-auto space-y-6">
      {renderHeader()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderKPICards()}
        {renderSourcePie()}
      </div>
      {renderMonthlyChart()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderPerformance()}
        {renderRecentReviews()}
      </div>
    </div>
  );
};

export default HelperOverview;
