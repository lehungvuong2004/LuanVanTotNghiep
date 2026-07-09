import React from "react";
import { Icon } from "@iconify/react";
import { useFollowingOrder } from "./useHook";
import { Pagination } from "../../../components/Pagination";
import { Toast } from "../../../components/Toast";

export const FollowingOrder: React.FC = () => {
  const {
    bookings,
    usersMap,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    totalItems,
    selectedBooking,
    isDetailOpen,
    detailLoading,
    handleOpenDetail,
    handleCloseDetail,
    metrics,
    toast,
    setToast,
    itemsPerPage,
  } = useFollowingOrder();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: string }> = {
      pending: { label: "Chờ duyệt", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-600 dark:text-amber-400", icon: "material-symbols:hourglass-empty-rounded" },
      confirmed: { label: "Đã duyệt", bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-600 dark:text-blue-400", icon: "material-symbols:check-circle-outline-rounded" },
      on_the_way: { label: "Đang đến", bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-650 dark:text-indigo-400", icon: "material-symbols:directions-car-outline" },
      in_progress: { label: "Đang làm", bg: "bg-cyan-50 dark:bg-cyan-950/20", text: "text-cyan-600 dark:text-cyan-400", icon: "material-symbols:run-circle-outline" },
      completed: { label: "Xong", bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-600 dark:text-emerald-400", icon: "material-symbols:task-alt-rounded" },
      cancelled: { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/20", text: "text-rose-600 dark:text-rose-450", icon: "material-symbols:block-outline-rounded" },
    };

    const cfg = configs[status] || { label: status, bg: "bg-slate-50", text: "text-slate-600", icon: "material-symbols:help-outline" };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border border-current/10`}>
        <Icon icon={cfg.icon} className="text-sm shrink-0" />
        {cfg.label}
      </span>
    );
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight font-sans">
          Theo Dõi & Giám Sát Đặt Lịch
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kênh kiểm soát lịch trình làm việc và trạng thái di chuyển của Người giúp việc theo thời gian thực.
        </p>
      </div>
    </div>
  );

  const renderKPIs = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0">
          <Icon icon="material-symbols:calendar-today-outline-rounded" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Tổng Đơn Đặt</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.total} đơn</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
          <Icon icon="material-symbols:hourglass-empty-rounded" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Chờ Phê Duyệt</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.pending} đơn</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
          <Icon icon="material-symbols:directions-car-outline" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Đang Làm Việc / Đến Nơi</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {bookings.filter(b => b.status === "on_the_way" || b.status === "in_progress").length} đơn
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center text-2xl shrink-0">
          <Icon icon="material-symbols:task-alt-rounded" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Đã Hoàn Thành</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{bookings.filter(b => b.status === "completed").length} đơn</span>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative w-full md:w-96">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 text-lg">
          <Icon icon="material-symbols:search-rounded" />
        </span>
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, tên Khách hàng, SĐT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Trạng Thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-705 dark:text-slate-200 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
          >
            <option value="All Statuses">Tất cả</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Confirmed">Đã duyệt</option>
            <option value="On_the_way">Đang di chuyển</option>
            <option value="In_progress">Đang làm việc</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">Đang tải danh sách đơn đặt lịch...</p>
        </div>
      );
    }

    if (!bookings.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-neutral-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy đơn hàng nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Không có dữ liệu đơn đặt lịch phù hợp với bộ lọc hiện tại.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-4xl">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-700 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã Đơn / Ngày Tạo</th>
                <th className="py-3.5 px-5">Khách Hàng</th>
                <th className="py-3.5 px-5">Người Giúp Việc</th>
                <th className="py-3.5 px-5">Thời Gian Thực Hiện</th>
                <th className="py-3.5 px-5">Tổng Thanh Toán</th>
                <th className="py-3.5 px-5">Trạng Thái</th>
                <th className="py-3.5 px-5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
              {bookings.map((b) => {
                const customer = usersMap[b.customer_id];
                const helper = b.helper_id ? usersMap[b.helper_id] : null;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    {/* Booking Code */}
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleOpenDetail(b)}
                        className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer"
                      >
                        {b.booking_code || `#BK-${b.id}`}
                      </button>
                      <div className="text-xxs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(b.created_at || Date.now()).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{customer?.full_name || `Khách hàng #${b.customer_id}`}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{customer?.phone || "N/A"}</div>
                    </td>

                    {/* Helper */}
                    <td className="py-3.5 px-5">
                      {helper ? (
                        <div className="flex items-center gap-2.5">
                          {helper.avatar ? (
                            <img
                              src={helper.avatar}
                              alt={helper.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-slate-100 dark:border-slate-700">
                              {getInitials(helper.full_name)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">{helper.full_name}</div>
                            <div className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">{helper.phone || "N/A"}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-bold bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                          <Icon icon="material-symbols:person-search-rounded" className="text-sm shrink-0" />
                          Chưa có helper
                        </span>
                      )}
                    </td>

                    {/* Execution Date & Time */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{b.booking_date}</div>
                      <div className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">Vào lúc {b.start_time?.substring(0, 5)}</div>
                    </td>

                    {/* Total Price */}
                    <td className="py-3.5 px-5 font-bold text-slate-850 dark:text-slate-150">
                      {formatPrice(b.total_price)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      {renderStatusBadge(b.status)}
                    </td>

                    {/* Detail trigger */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenDetail(b)}
                        className="p-2 rounded-xl text-slate-450 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                        title="Xem hành trình & nhật ký"
                      >
                        <Icon icon="material-symbols:visibility-outline-rounded" className="text-lg" />
                      </button>
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

  const renderDetailModal = () => {
    if (!isDetailOpen || !selectedBooking) return null;
    const b = selectedBooking;
    const customer = usersMap[b.customer_id];
    const helper = b.helper_id ? usersMap[b.helper_id] : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transform scale-100 transition-all my-8">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-2">
                <Icon icon="material-symbols:timeline-rounded" className="text-[#026E5F] dark:text-emerald-400" />
                Hành Trình Đơn: <span className="text-[#026E5F] dark:text-emerald-400">{b.booking_code || `#BK-${b.id}`}</span>
              </h3>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">Chi tiết trạng thái, nhật ký di chuyển & làm việc</p>
            </div>
            <button
              onClick={handleCloseDetail}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Icon icon="material-symbols:close-rounded" className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-left max-h-[70vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-8 h-8 border-3 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 mt-3">Đang tải nhật ký hành trình từ hệ thống...</p>
              </div>
            ) : (
              <>
                {/* Basic info strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <span className="block text-xxs font-bold text-slate-400 dark:text-slate-550 uppercase mb-1">Thời gian đặt lịch</span>
                    <span className="text-sm font-semibold text-slate-750 dark:text-slate-200">
                      {b.booking_date} lúc {b.start_time?.substring(0, 5)}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <span className="block text-xxs font-bold text-slate-400 dark:text-slate-550 uppercase mb-1">Tổng thanh toán</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {formatPrice(b.total_price)}
                    </span>
                  </div>
                </div>

                {/* Partner Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-700/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <Icon icon="material-symbols:person-outline-rounded" />
                      Khách hàng
                    </h4>
                    <div className="text-sm">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{customer?.full_name}</div>
                      <div className="text-xs text-slate-550 dark:text-slate-400 mt-1">SĐT: {customer?.phone || "Chưa có"}</div>
                      <div className="text-xs text-slate-550 dark:text-slate-400">Email: {customer?.email || "Chưa có"}</div>
                    </div>
                  </div>

                  {/* Helper Info */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-700/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <Icon icon="material-symbols:engineering-outline-rounded" />
                      Người giúp việc
                    </h4>
                    {helper ? (
                      <div className="text-sm">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{helper.full_name}</div>
                        <div className="text-xs text-slate-550 dark:text-slate-400 mt-1">SĐT: {helper.phone || "Chưa có"}</div>
                        <div className="text-xs text-slate-550 dark:text-slate-400">Email: {helper.email || "Chưa có"}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Chưa phân công người giúp việc thực hiện.</div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Icon icon="material-symbols:handyman-outline-rounded" />
                    Dịch vụ đã chọn
                  </h4>
                  <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                        <tr>
                          <th className="p-3">Dịch vụ</th>
                          <th className="p-3">Đơn giá</th>
                          <th className="p-3">Số lượng</th>
                          <th className="p-3 text-right">Tổng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {b.services?.map((svc, idx) => (
                          <tr key={idx} className="text-slate-700 dark:text-slate-300">
                            <td className="p-3 font-semibold">{svc.name || `Dịch vụ #${svc.service_id}`}</td>
                            <td className="p-3">{formatPrice(svc.price)}</td>
                            <td className="p-3">{svc.quantity}</td>
                            <td className="p-3 text-right font-bold">{formatPrice(svc.price * svc.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Helper Work Logs (Check-in/Check-out) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Icon icon="material-symbols:check-box-outline-blank-rounded" />
                    Nhật ký check-in của Helper
                  </h4>
                  {b.work_logs && b.work_logs.length > 0 ? (
                    <div className="space-y-3">
                      {b.work_logs.map((log: any) => (
                        <div key={log.id} className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              Trạng thái Check-in: <span className="text-emerald-600">{log.status}</span>
                            </div>
                            <div className="text-slate-500 mt-1">
                              Vào lúc: {new Date(log.checkin_time).toLocaleString("vi-VN")}
                            </div>
                          </div>
                          {log.checkout_time && (
                            <div className="text-right">
                              <span className="font-semibold text-slate-500 block">Check-out lúc:</span>
                              <span className="text-slate-750 dark:text-slate-300">{new Date(log.checkout_time).toLocaleString("vi-VN")}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">Chưa ghi nhận thông tin check-in/check-out từ Người giúp việc.</p>
                  )}
                </div>

                {/* Status Timeline History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Icon icon="material-symbols:history-rounded" />
                    Lịch sử thay đổi trạng thái
                  </h4>
                  {b.status_histories && b.status_histories.length > 0 ? (
                    <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 space-y-4 text-xs ml-2">
                      {b.status_histories.map((hist: any, index: number) => (
                        <div key={hist.id || index} className="relative">
                          {/* Timeline dot */}
                          <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-850 bg-blue-600 shadow-xs" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                              {hist.old_status || "Khởi tạo"} → {hist.new_status}
                            </span>
                            <span className="text-xxs text-slate-400 dark:text-slate-550 block mt-0.5">
                              {new Date(hist.created_at || Date.now()).toLocaleString("vi-VN")}
                            </span>
                            {hist.note && (
                              <p className="text-slate-550 dark:text-slate-450 mt-1 italic">
                                Ghi chú: "{hist.note}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">Chưa ghi nhận lịch sử thay đổi trạng thái.</p>
                  )}
                </div>

                {/* Cancel information if cancelled */}
                {b.status === "cancelled" && (b.cancel_reason || b.cancel_by) && (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-rose-600 flex items-center gap-1">
                      <Icon icon="material-symbols:warning-outline-rounded" />
                      Thông tin hủy đơn
                    </div>
                    <div>Người thực hiện hủy: {b.cancel_by ? `User #${b.cancel_by}` : "Hệ thống"}</div>
                    <div>Lý do: <span className="italic">"{b.cancel_reason || "Không nêu lý do"}"</span></div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-end">
            <button
              onClick={handleCloseDetail}
              className="px-4 py-2 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {renderHeader()}
      {renderKPIs()}
      {renderFilters()}
      {renderTable()}
      {renderDetailModal()}
    </div>
  );
};
