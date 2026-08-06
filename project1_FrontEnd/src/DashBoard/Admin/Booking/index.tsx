import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { useBooking } from "./useHook";
import type { BookingItem } from "./useHook";
import { Pagination } from "../../../components/Pagination";
import { Loading } from "../../../components/Commom";

import { formatNumberVI, fmtVND } from "../../../utils";
import { exportToExcel } from "../../../utils/excelExporter";
import { BulkDeleteBar } from "../../../components/BulkDeleteBar";
import { useToast } from "../../../contexts/ToastContext";

export const Booking = () => {
  const { showToast } = useToast();
  const {
    isLoading,
    helperList,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedPayment,
    setSelectedPayment,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredBookings,
    filteredCount,
    paginatedBookings,
    metrics,
    selectedBooking,
    isDetailOpen,
    isEditOpen,
    editingBooking,
    setEditingBooking,
    handleOpenDetail,
    handleCloseDetail,
    handleOpenEdit,
    handleCloseEdit,
    handleUpdateBooking,
    handleDeleteBooking,
    handleQuickStatusChange,
    pieOption,
    lineOption,

    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
  } = useBooking();

  // Cancel Reason input for Quick Cancel action
  const [showCancelInput, setShowCancelInput] = useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState("");

  // Render Page Header
  const renderHeader = () => (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-100 mb-1">Theo dõi đơn đặt lịch</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý và giám sát trạng thái các yêu cầu dịch vụ thời gian thực.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <button
          type="button"
          onClick={() => {
            if (!filteredBookings || filteredBookings.length === 0) {
              showToast("warning", "Xuất báo cáo", "Không có dữ liệu đơn đặt lịch nào để xuất.");
              return;
            }
            const success = exportToExcel({
              filename: `Bao_cao_don_dat_lich_${new Date().toISOString().slice(0, 10)}.xlsx`,
              sheetName: "Đơn đặt lịch",
              data: filteredBookings,
              columns: [
                { key: "bookingCode", label: "Mã Đơn" },
                { key: "customerName", label: "Khách Hàng" },
                { key: "customerPhone", label: "SĐT Khách" },
                { key: "customerEmail", label: "Email Khách" },
                { key: "helperName", label: "Người Giúp Việc", formatter: (val) => val || "Chưa phân công" },
                { key: "helperPhone", label: "SĐT NGV", formatter: (val) => val || "—" },
                { key: "address", label: "Địa Chỉ" },
                { key: "district", label: "Quận/Huyện" },
                { key: "city", label: "Thành Phố" },
                { key: "bookingDate", label: "Ngày Thực Hiện" },
                { key: "startTime", label: "Giờ Bắt Đầu" },
                { key: "totalPrice", label: "Tổng Tiền (VNĐ)", formatter: (val) => fmtVND(val) },
                {
                  key: "status",
                  label: "Trạng Thái Đơn",
                  formatter: (val) => (val === "completed" ? "Hoàn thành" : val === "confirmed" ? "Đã xác nhận" : val === "cancelled" ? "Đã hủy" : "Chờ xử lý"),
                },
                {
                  key: "paymentStatus",
                  label: "Thanh Toán",
                  formatter: (val) => (val === "paid" ? "Đã thanh toán" : val === "refunded" ? "Đã hoàn tiền" : val === "failed" ? "Thất bại" : "Chờ thanh toán"),
                },
                { key: "createdAt", label: "Ngày Tạo Đơn" },
              ],
            });
            if (success) {
              showToast("success", "Xuất báo cáo", "Báo cáo thống kê đơn đặt lịch đã được xuất file .xlsx thành công!");
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs active:scale-97 cursor-pointer"
        >
          <Icon icon="material-symbols:download-rounded" className="text-lg" />
          <span>Xuất báo cáo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            showToast("info", "Tạo đơn mới", "Chức năng tạo đơn mới đang được kích hoạt...");
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs hover:shadow-sm active:scale-97 transition-all cursor-pointer"
        >
          <Icon icon="material-symbols:add-rounded" className="text-lg" />
          <span>Tạo đơn mới</span>
        </button>

        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
          <input
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all dark:text-slate-100 shadow-xs"
            placeholder="Tìm theo mã đơn, khách, nhân viên..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Render KPI Metrics Cards
  const renderKPICards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1">TỔNG ĐƠN ĐẶT</span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.total} đơn</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">Hệ thống Gia Đình Việt</span>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
          <Icon icon="material-symbols:calendar-today-outline-rounded" className="text-2xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1">TỔNG DOANH THU</span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{formatNumberVI(metrics.totalRevenue)} ₫</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-455 mt-1">Đơn hoàn thành/xác nhận</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-455">
          <Icon icon="material-symbols:payments-outline-rounded" className="text-2xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1">TỶ LỆ HOÀN THÀNH</span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.completionRate}%</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-650 dark:text-purple-400 mt-1">Đơn hoàn tất thành công</span>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
          <Icon icon="material-symbols:trending-up-rounded" className="text-2xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 mb-1">ĐƠN CHỜ PHÊ DUYỆT</span>
          <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.pending} đơn</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Cần quản trị viên duyệt</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
          <Icon icon="material-symbols:hourglass-empty" className="text-2xl" />
        </div>
      </div>
    </div>
  );

  // Render Charts using Grid layout
  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Line & Bar Combined Chart: Booking Count & Revenue over dates */}
      <div className="lg:col-span-2 min-h-80 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Xu Hướng Đặt Lịch & Doanh Thu</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">Biểu đồ tổng quan</span>
        </div>
        <div className="flex-1 h-70 flex items-center justify-center">
          <ReactECharts option={lineOption} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>

      {/* Pie Chart: Status Breakdown */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Phân Bố Trạng Thái</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">Tỷ lệ đơn hàng</span>
        </div>
        <div className="flex-1 h-70 flex items-center justify-center">
          <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );

  // Render Toolbar for Filtering
  const renderToolbar = () => (
    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex gap-2">
        <select
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-250 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All Statuses">Tất cả Trạng thái</option>
          <option value="Pending">Chờ duyệt (Pending)</option>
          <option value="Confirmed">Đã xác nhận (Confirmed)</option>
          <option value="Completed">Hoàn thành (Completed)</option>
          <option value="Cancelled">Đã hủy (Cancelled)</option>
        </select>

        <select
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-250 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
        >
          <option value="All Payments">Tất cả Thanh toán</option>
          <option value="Pending">Chưa thanh toán</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="Refunded">Đã hoàn tiền</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
        <Icon icon="material-symbols:filter-list" className="text-lg" />
        <span>
          Tìm thấy <b>{filteredCount}</b> đơn hàng
        </span>
      </div>
    </div>
  );

  // Render Grid-based List (instead of Table)
  const renderTable = () => (
    <div className="overflow-x-auto w-full">
      <div className="min-w-250">
        {/* Grid Header */}
        <div className="grid grid-cols-14 gap-4 items-center bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider py-4 px-5">
          <div className="col-span-1 text-center">
            <input
              type="checkbox"
              checked={selectedIds.length === paginatedBookings.length && paginatedBookings.length > 0}
              ref={(el) => {
                if (el) {
                  el.indeterminate = selectedIds.length > 0 && selectedIds.length < paginatedBookings.length;
                }
              }}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
            />
          </div>
          <div className="col-span-2">Mã đơn</div>
          <div className="col-span-2">Khách hàng</div>
          <div className="col-span-2">Người thực hiện</div>
          <div className="col-span-2">Thời gian</div>
          <div className="col-span-1">Tổng tiền</div>
          <div className="col-span-1">Thanh toán</div>
          <div className="col-span-1">Trạng thái</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        {/* Grid Body */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {paginatedBookings.map((booking) => {
            const hasHelper = booking.helperName !== null;
            const isSelected = selectedIds.includes(booking.id);

            return (
              <div
                key={booking.id}
                className={`grid grid-cols-14 gap-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors py-4 px-5 text-sm text-slate-750 dark:text-slate-200 ${
                  isSelected ? "bg-red-50/20 dark:bg-red-950/10" : ""
                }`}
              >
                {/* Checkbox */}
                <div className="col-span-1 text-center">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelectOne(booking.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600" />
                </div>
                {/* Booking Code */}
                <div className="col-span-2">
                  <button onClick={() => handleOpenDetail(booking)} className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer">
                    {booking.bookingCode}
                  </button>
                  <div className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">{booking.createdAt}</div>
                </div>

                {/* Customer Info */}
                <div className="col-span-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{booking.customerName}</div>
                  <div className="text-xs text-slate-450 dark:text-slate-400">{booking.customerPhone}</div>
                </div>

                {/* Helper assigned */}
                <div className="col-span-2">
                  {hasHelper ? (
                    <div className="flex items-center gap-2">
                      <img src={booking.helperAvatar || ""} alt={booking.helperName || ""} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-650" />
                      <div>
                        <div className="font-semibold text-slate-750 dark:text-slate-200 text-xs">{booking.helperName}</div>
                        <div className="text-xxs text-slate-450 dark:text-slate-450">{booking.helperPhone}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                      <Icon icon="material-symbols:person-search" className="text-sm" />
                      Chưa phân phối
                    </span>
                  )}
                </div>

                {/* Date & Time */}
                <div className="col-span-2">
                  <div className="font-medium text-slate-800 dark:text-slate-200">{booking.bookingDate}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-550 mt-0.5">{booking.startTime.substring(0, 5)}</div>
                </div>

                {/* Price */}
                <div className="col-span-1 font-bold text-slate-850 dark:text-slate-150">{formatNumberVI(booking.totalPrice)} ₫</div>

                {/* Payment status */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xxs font-semibold ${
                      booking.paymentStatus === "paid"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
                        : booking.paymentStatus === "pending"
                          ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30"
                          : booking.paymentStatus === "refunded"
                            ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30"
                            : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30"
                    }`}
                  >
                    {booking.paymentStatus === "paid" ? "Đã trả" : booking.paymentStatus === "pending" ? "Chờ trả" : booking.paymentStatus === "refunded" ? "Hoàn tiền" : "Lỗi"}
                  </span>
                </div>

                {/* Booking status */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-bold ${
                      booking.status === "completed"
                        ? "bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-850 dark:text-emerald-300"
                        : booking.status === "confirmed"
                          ? "bg-blue-100/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
                          : booking.status === "cancelled"
                            ? "bg-red-100/80 dark:bg-red-950/40 text-red-850 dark:text-red-300"
                            : "bg-amber-100/80 dark:bg-amber-950/40 text-amber-850 dark:text-amber-300"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        booking.status === "completed"
                          ? "bg-emerald-600 dark:bg-emerald-450"
                          : booking.status === "confirmed"
                            ? "bg-blue-600 dark:bg-blue-400 animate-pulse"
                            : booking.status === "cancelled"
                              ? "bg-red-600 dark:bg-red-400"
                              : "bg-amber-600 dark:bg-amber-400"
                      }`}
                    />
                    {booking.status === "completed" ? "Xong" : booking.status === "confirmed" ? "Duyệt" : booking.status === "cancelled" ? "Hủy" : "Chờ"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleQuickStatusChange(booking.id, "confirmed")}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-all cursor-pointer"
                        title="Duyệt đơn hàng"
                      >
                        <Icon icon="material-symbols:check-circle-outline" className="text-lg" />
                      </button>
                    )}

                    {/* Quick Complete button if confirmed */}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleQuickStatusChange(booking.id, "completed")}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-all cursor-pointer"
                        title="Hoàn tất đơn đặt"
                      >
                        <Icon icon="material-symbols:task-alt-rounded" className="text-lg" />
                      </button>
                    )}

                    {/* Quick Cancel button if pending/confirmed */}
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <div className="relative">
                        <button
                          onClick={() => {
                            if (showCancelInput === booking.id) {
                              setShowCancelInput(null);
                            } else {
                              setShowCancelInput(booking.id);
                              setCancelReasonText("");
                            }
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-all cursor-pointer"
                          title="Hủy đơn đặt"
                        >
                          <Icon icon="material-symbols:block-outline-rounded" className="text-lg" />
                        </button>

                        {showCancelInput === booking.id && (
                          <div className="absolute right-0 bottom-10 z-50 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl w-64 text-left">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Lý do hủy đơn:</label>
                            <input
                              type="text"
                              value={cancelReasonText}
                              onChange={(e) => setCancelReasonText(e.target.value)}
                              placeholder="Nhập lý do..."
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-slate-100 mb-2"
                              autoFocus
                            />
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => setShowCancelInput(null)} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-655 dark:text-slate-300 rounded text-xxs font-bold">
                                Đóng
                              </button>
                              <button
                                onClick={() => {
                                  handleQuickStatusChange(booking.id, "cancelled");
                                  // Update the cancelled booking record details in local state
                                  const reason = cancelReasonText.trim() || "Hủy đơn bởi Admin.";
                                  handleUpdateBooking({
                                    ...booking,
                                    status: "cancelled",
                                    cancelBy: "Admin",
                                    cancelReason: reason,
                                    refundStatus: booking.paymentStatus === "paid" ? "pending" : "none",
                                  });
                                  setShowCancelInput(null);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded text-xxs font-bold"
                              >
                                Xác nhận hủy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Detail button */}
                    <button
                      onClick={() => handleOpenDetail(booking)}
                      className="p-1.5 text-slate-550 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <Icon icon="material-symbols:visibility-outline" className="text-lg" />
                    </button>

                    {/* Edit/Reassign button */}
                    <button
                      onClick={() => handleOpenEdit(booking)}
                      className="p-1.5 text-slate-550 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa & phân công"
                    >
                      <Icon icon="material-symbols:edit-outline" className="text-lg" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-1.5 text-slate-550 hover:text-red-655 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Xóa đơn hàng"
                    >
                      <Icon icon="material-symbols:delete-outline" className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {paginatedBookings.length === 0 && <div className="p-8 text-center text-slate-450 dark:text-slate-500">Không tìm thấy đơn đặt lịch nào phù hợp với bộ lọc.</div>}
        </div>
      </div>
    </div>
  );

  // Render Detailed View Modal
  const renderDetailModal = () => {
    if (!isDetailOpen || !selectedBooking) return null;
    const booking = selectedBooking;
    const hasHelper = booking.helperName !== null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-8">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <span>Chi tiết Đơn Đặt Lịch:</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{booking.bookingCode}</span>
              </h3>
              <span className="text-xxs text-slate-450 dark:text-slate-500 block mt-0.5">Khởi tạo lúc: {booking.createdAt}</span>
            </div>
            <button
              onClick={handleCloseDetail}
              className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-left">
            {/* Grid 1: Basic Info & Status badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-700/50">
                <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Trạng thái dịch vụ</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === "completed"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : booking.status === "confirmed"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      booking.status === "completed" ? "bg-emerald-600" : booking.status === "confirmed" ? "bg-blue-600 animate-pulse" : booking.status === "cancelled" ? "bg-red-600" : "bg-amber-600"
                    }`}
                  />
                  {booking.status === "completed" ? "Hoàn thành" : booking.status === "confirmed" ? "Đã xác nhận & duyệt" : booking.status === "cancelled" ? "Đã hủy đơn" : "Đang chờ duyệt"}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-700/50">
                <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Thông tin thanh toán</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === "paid"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"
                        : booking.paymentStatus === "pending"
                          ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600"
                          : booking.paymentStatus === "refunded"
                            ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600"
                            : "bg-red-50 dark:bg-red-950/20 text-red-600"
                    }`}
                  >
                    {booking.paymentStatus === "paid" ? "Đã thanh toán" : booking.paymentStatus === "pending" ? "Chưa trả tiền" : booking.paymentStatus === "refunded" ? "Đã hoàn tiền" : "Thất bại"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                <Icon icon="material-symbols:person-outline" className="text-base" />
                Khách hàng & Địa điểm
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-xxs text-slate-400 dark:text-slate-500 mb-0.5">Tên khách hàng:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.customerName}</span>
                </div>
                <div>
                  <span className="block text-xxs text-slate-400 dark:text-slate-500 mb-0.5">Số điện thoại / Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {booking.customerPhone} / {booking.customerEmail}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xxs text-slate-400 dark:text-slate-500 mb-0.5">Địa chỉ phục vụ:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {booking.address}, {booking.district}, {booking.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Helper Assigned Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                <Icon icon="material-symbols:engineering-outline-rounded" className="text-base" />
                Nhân viên thực hiện
              </h4>
              {hasHelper ? (
                <div className="flex items-center gap-4 bg-blue-50/30 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/25">
                  <img src={booking.helperAvatar || ""} alt={booking.helperName || ""} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  <div className="text-xs sm:text-sm">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{booking.helperName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Số điện thoại liên hệ: {booking.helperPhone}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-200 dark:border-amber-900/35 text-amber-700 dark:text-amber-400 text-xs sm:text-sm flex items-center gap-2">
                  <Icon icon="material-symbols:warning-outline" className="text-lg shrink-0" />
                  <span>Đơn đặt lịch này chưa có nhân viên nhận việc hoặc được phân công. Vui lòng phân phối nhân viên.</span>
                </div>
              )}
            </div>

            {/* DateTime and Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                <Icon icon="material-symbols:schedule-outline" className="text-base" />
                Thời gian & Ghi chú khách hàng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-xxs text-slate-400 dark:text-slate-500 mb-0.5">Ngày phục vụ:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.bookingDate}</span>
                </div>
                <div>
                  <span className="block text-xxs text-slate-400 dark:text-slate-500 mb-0.5">Giờ khởi đầu:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.startTime}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xxs text-slate-400 dark:text-slate-500 mb-0.5">Ghi chú của khách hàng:</span>
                  <p className="italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-150 dark:border-slate-750">
                    {booking.note || "Không có ghi chú gì thêm."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                <Icon icon="material-symbols:handyman-outline" className="text-base" />
                Dịch vụ được yêu cầu
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs sm:text-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/40 font-bold text-slate-600 dark:text-slate-450 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Tên dịch vụ</th>
                      <th className="p-3">Đơn giá</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Số lượng</th>
                      <th className="p-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {booking.services.map((srv, idx) => (
                      <tr key={idx} className="text-slate-750 dark:text-slate-350">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{srv.name}</td>
                        <td className="p-3">{formatNumberVI(srv.price)} ₫</td>
                        <td className="p-3">{srv.duration_hours} giờ</td>
                        <td className="p-3">{srv.quantity}</td>
                        <td className="p-3 text-right font-bold text-slate-850 dark:text-slate-150">{formatNumberVI(srv.price * srv.quantity)} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right text-base font-black text-slate-850 dark:text-slate-100">
                Tổng cộng: <span className="text-blue-600 dark:text-blue-400">{formatNumberVI(booking.totalPrice)} ₫</span>
              </div>
            </div>

            {booking.status === "cancelled" && (
              <div className="p-4 bg-red-50/50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/45 rounded-xl space-y-1">
                <h5 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase flex items-center gap-1">
                  <Icon icon="material-symbols:cancel-presentation-outline" />
                  ĐƠN HÀNG ĐÃ BỊ HỦY
                </h5>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <b>Người hủy:</b> {booking.cancelBy || "Chưa xác định"}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <b>Lý do hủy:</b> {booking.cancelReason || "Không có lý do chi tiết."}
                </p>
                {booking.refundStatus !== "none" && (
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                    Trạng thái hoàn tiền: {booking.refundStatus === "refunded" ? "Đã hoàn tiền thành công" : "Đang chờ xử lý hoàn tiền"}
                  </p>
                )}
              </div>
            )}

            {booking.status === "completed" && booking.rating && (
              <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/35 rounded-xl space-y-2">
                <h5 className="text-xs font-bold text-emerald-850 dark:text-emerald-300 uppercase flex items-center gap-1">
                  <Icon icon="material-symbols:star-rate-outline-rounded" />
                  Đánh giá từ khách hàng
                </h5>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} icon="material-symbols:star-rate-rounded" className={`text-lg ${i < (booking.rating || 0) ? "text-amber-400" : "text-slate-300 dark:text-slate-650"}`} />
                  ))}
                  <span className="text-xs text-slate-450 ml-1">({booking.rating}/5 sao)</span>
                </div>
                <p className="text-xs italic text-slate-700 dark:text-slate-300">"{booking.reviewComment || "Không có bình luận gì thêm."}"</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
            <div className="flex gap-2">
              {/* Approve pending */}
              {booking.status === "pending" && (
                <button
                  onClick={() => {
                    handleQuickStatusChange(booking.id, "confirmed");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-755 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  Phê duyệt đơn đặt
                </button>
              )}

              {/* Complete confirmed */}
              {booking.status === "confirmed" && (
                <button
                  onClick={() => {
                    handleQuickStatusChange(booking.id, "completed");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  Hoàn thành dịch vụ
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleOpenEdit(booking);
                  handleCloseDetail();
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Chỉnh sửa đơn
              </button>
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-250 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Edit & Reassign Modal
  const renderEditModal = () => {
    if (!isEditOpen || !editingBooking) return null;
    const booking = editingBooking;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 text-left">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Chỉnh Sửa & Phân Công: {booking.bookingCode}</h3>
              <p className="text-xxs text-slate-450 dark:text-slate-500">Cập nhật lịch trình dịch vụ, người thực hiện hoặc trạng thái đơn hàng</p>
            </div>
            <button
              onClick={handleCloseEdit}
              className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>

          {/* Modal Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateBooking(booking);
            }}
            className="p-6 space-y-4 text-left max-h-[70vh] overflow-y-auto"
          >
            {/* Grid: Booking Date & Start Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">Ngày làm việc</label>
                <input
                  required
                  value={booking.bookingDate}
                  onChange={(e) => setEditingBooking({ ...booking, bookingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100"
                  type="date"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Giờ làm việc</label>
                <input
                  required
                  value={booking.startTime}
                  onChange={(e) => setEditingBooking({ ...booking, startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100"
                  type="text"
                  placeholder="e.g. 08:00:00"
                />
              </div>
            </div>

            {/* Helper Assignment */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Nhân viên thực hiện</label>
              <select
                value={booking.helperName || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const foundHelper = helperList.find((h) => h.value === val);
                  if (foundHelper && val !== "") {
                    setEditingBooking({
                      ...booking,
                      helperName: foundHelper.name,
                      helperAvatar: foundHelper.avatar || null,
                      helperPhone: foundHelper.phone || null,
                    });
                  } else {
                    setEditingBooking({
                      ...booking,
                      helperName: null,
                      helperAvatar: null,
                      helperPhone: null,
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100 outline-none cursor-pointer"
              >
                {helperList.map((helper, idx) => (
                  <option key={idx} value={helper.value}>
                    {helper.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid: Status & Payment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Trạng thái đơn hàng</label>
                <select
                  value={booking.status}
                  onChange={(e) => {
                    const status = e.target.value as any;
                    const update: Partial<BookingItem> = { status };
                    if (status === "completed") {
                      update.paymentStatus = "paid";
                    }
                    setEditingBooking({ ...booking, ...update });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="pending">Chờ duyệt (Pending)</option>
                  <option value="confirmed">Đã duyệt (Confirmed)</option>
                  <option value="completed">Hoàn thành (Completed)</option>
                  <option value="cancelled">Đã hủy (Cancelled)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Trạng thái thanh toán</label>
                <select
                  value={booking.paymentStatus}
                  onChange={(e) => setEditingBooking({ ...booking, paymentStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="pending">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thanh toán lỗi</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>
            </div>

            {/* Refund details if cancelled */}
            {booking.status === "cancelled" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Hủy bởi ai?</label>
                  <select
                    value={booking.cancelBy || "Admin"}
                    onChange={(e) => setEditingBooking({ ...booking, cancelBy: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    <option value="Admin">Admin (Quản lý)</option>
                    <option value="Customer">Customer (Khách hàng)</option>
                    <option value="Helper">Helper (Nhân viên)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Trạng thái hoàn tiền</label>
                  <select
                    value={booking.refundStatus}
                    onChange={(e) => setEditingBooking({ ...booking, refundStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    <option value="none">Không hoàn tiền</option>
                    <option value="pending">Đang hoàn tiền</option>
                    <option value="refunded">Đã hoàn tất</option>
                  </select>
                </div>
              </div>
            )}

            {/* Cancel Reason */}
            {booking.status === "cancelled" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Lý do hủy đơn</label>
                <input
                  value={booking.cancelReason || ""}
                  onChange={(e) => setEditingBooking({ ...booking, cancelReason: e.target.value })}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100"
                  type="text"
                />
              </div>
            )}

            {/* Customer Note */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">Yêu cầu ghi chú của khách hàng</label>
              <textarea
                value={booking.note || ""}
                onChange={(e) => setEditingBooking({ ...booking, note: e.target.value })}
                rows={3}
                placeholder="Yêu cầu riêng biệt..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-650 focus:ring-1 focus:ring-blue-650 dark:text-slate-100 outline-none resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm">
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Main Content Scroll Container */}
      <main className="flex-1 p-6 w-full max-w-8xl mx-auto">
        {renderHeader()}
        {renderKPICards()}
        {renderCharts()}

        {/* Booking List Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {renderToolbar()}
          {selectedIds.length > 0 && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-750 bg-slate-50/30 dark:bg-slate-900/10">
              <BulkDeleteBar selectedIds={selectedIds} totalCount={paginatedBookings.length} onToggleAll={toggleSelectAll} onDeleteSelected={handleBulkDelete} onClear={clearSelection} />
            </div>
          )}
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loading />
            </div>
          ) : (
            renderTable()
          )}

          {/* Pagination */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-750">
            <Pagination currentPage={currentPage} totalItems={filteredCount} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        </div>
      </main>

      {/* Popups / Modals */}
      {renderDetailModal()}
      {renderEditModal()}

      {/* Toast Alert message */}
    </div>
  );
};

export default Booking;
