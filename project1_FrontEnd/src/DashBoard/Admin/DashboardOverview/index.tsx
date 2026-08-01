import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { useDashboardOverview } from "./useHook";
import type { KPICardData, RecentBooking } from "./useHook";
import { Link } from "react-router-dom";
import { formatNumberVI, fmtVND } from "../../../utils";

export const DashboardOverview = () => {
  const { kpis, recentBookings, totalServiceCount, barOption, pieOption, loading, error } = useDashboardOverview();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-96">
        <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-blue-600 mb-2" />
        <span className="text-slate-500 text-sm">Đang tải dữ liệu thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-5 w-full max-w-350 mx-auto">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
          <Icon icon="material-symbols:error-outline-rounded" className="text-xl" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0.5">Tổng quan bảng điều khiển</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Chào mừng trở lại, Quản trị viên. Dưới đây là tóm tắt hoạt động hôm nay.</p>
    </div>
  );

  const renderKPICards = (items: KPICardData[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((card, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div>
            <span className="block text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{card.title}</span>
            <span className="block text-3xl font-extrabold text-slate-850 dark:text-slate-100">
              {typeof card.value === "number" ? (card.type === "revenue" || idx === 0 ? fmtVND(card.value) : card.value.toLocaleString("vi-VN")) : card.value}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold mt-1 ${card.isPositive !== false ? "text-emerald-650 dark:text-emerald-450" : "text-rose-600 dark:text-rose-400"}`}
            >
              <Icon icon={card.isPositive !== false ? "material-symbols:trending-up-rounded" : "material-symbols:trending-down-rounded"} />
              {card.change}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor}`}>
            <Icon icon={card.icon} className="text-2xl" />
          </div>
        </div>
      ))}
    </div>
  );

  // Sub-render 3: Charts Layout using Grid (with min-h-80 to prevent resizing issues)
  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 min-h-80 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-bold text-slate-805 dark:text-slate-100">Hoạt động đặt chỗ hàng tuần</h3>
          <span className="text-sm text-slate-400 dark:text-slate-500">Tổng quan từ Thứ 2 - Chủ Nhật</span>
        </div>
        <div className="flex-1 h-80 flex items-center justify-center">
          <ReactECharts option={barOption} style={{ height: "100%", width: "100%" }} lazyUpdate notMerge />
        </div>
      </div>

      {/* Service Shares Pie Chart (1 col width, aligned height) */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-bold text-slate-805 dark:text-slate-100">Danh mục dịch vụ</h3>
        </div>

        {/* Aligned height for symmetrical grid layout */}
        <div className="flex-1 h-80 flex items-center justify-center relative">
          <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} lazyUpdate notMerge />
        </div>

        {/* Bottom stats and action link */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng số lượng:</span>
            <span className="text-xl font-black text-emerald-650 dark:text-blue-450">{totalServiceCount}</span>
          </div>
          <Link to="/admin/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-950 hover:text-blue-780 dark:text-blue-400 dark:hover:text-blue-300" target="_blank">
            <span>Xem tất cả</span>
            <Icon icon="material-symbols:chevron-right-rounded" className="text-lg" />
          </Link>
        </div>
      </div>
    </div>
  );

  // Sub-render 4: Recent Activity Table
  const renderRecentActivity = (bookings: RecentBooking[]) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-805 dark:text-slate-100">Đặt chỗ gần đây</h3>
        <Link to="/admin/bookings" className="text-sm font-semibold text-blue-950 hover:text-gray-800 dark:text-blue-400 cursor-pointer" target="_blank">
          Xem tất cả
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Khách hàng</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dịch vụ</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ngày</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giá</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
            {bookings.map((booking, idx) => (
              <tr key={idx}>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{booking.customer}</td>
                <td className="px-5 py-3 text-sm text-slate-550 dark:text-slate-400">{booking.service}</td>
                <td className="px-5 py-3 text-sm text-slate-550 dark:text-slate-400">{booking.date}</td>
                <td className="px-5 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">{`${formatNumberVI(booking.price)} ₫`}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      booking.status === "Completed"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-455"
                        : booking.status === "Confirmed"
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-455"
                    }`}
                  >
                    {booking.status === "Completed"
                      ? "Đã hoàn thành"
                      : booking.status === "Confirmed"
                        ? "Đã xác nhận"
                        : booking.status === "Pending"
                          ? "Chờ duyệt"
                          : booking.status === "Cancelled"
                            ? "Đã hủy"
                            : booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-5 w-full max-w-8xl mx-auto space-y-5">
      {renderHeader()}
      {renderKPICards(kpis)}
      {renderCharts()}
      {renderRecentActivity(recentBookings)}
    </div>
  );
};

export default DashboardOverview;
