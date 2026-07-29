import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { usePaymentsHook, PAYMENT_METHODS_LABELS, PAYMENT_METHODS_ICONS } from "./usePaymentsHook";
import { Pagination } from "../../../components/Pagination";
import { fmtVND, getStatusBadge } from "../../../utils";
import { useAuth } from "../../../hooks/useAuth";

export const Payments = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    viewStats: hasPermission("payments.view"),
    updateStatus: hasPermission("payments.view"),
  };

  const {
    loading,
    statsLoading,
    searchQuery,
    setSearchQuery,
    liveStats,
    payments,
    paymentsPage,
    setPaymentsPage,
    paymentsTotal,
    paymentStatusFilter,
    setPaymentStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    handleUpdatePaymentStatus,
    revenueChartOption,
    statusDistributionOption,
    methodDistributionOption,
    itemsPerPage,
  } = usePaymentsHook();

  const fmtPct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

  const renderHeader = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Thanh toán</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Theo dõi lịch sử giao dịch và doanh thu hệ thống theo thời gian thực.</p>
      </div>
    );
  };
  const renderStats = () => {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <Icon icon="material-symbols:payments-outline-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Tổng doanh thu</p>
            {statsLoading ? (
              <div className="mt-1.5 h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <h3 className="mt-1 text-3xl font-black text-slate-800 dark:text-slate-100 truncate">{liveStats ? fmtVND(liveStats.total_revenue) : "—"}</h3>
            )}
            {liveStats && !statsLoading && <p className="text-xs mt-0.5 font-medium text-slate-400">Tháng này: {fmtVND(liveStats.this_month_revenue)}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Icon icon="material-symbols:trending-up-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Tăng trưởng tháng</p>
            {statsLoading ? (
              <div className="mt-1.5 h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <h3 className="mt-1 text-3xl font-black text-slate-800 dark:text-slate-100 truncate">{liveStats ? fmtPct(liveStats.change_percent) : "—"}</h3>
            )}
            {liveStats && !statsLoading && (
              <p className={`text-xs mt-0.5 font-medium ${liveStats.change_percent >= 0 ? "text-emerald-500" : "text-rose-500"}`}>Tháng trước: {fmtVND(liveStats.last_month_revenue)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Icon icon="material-symbols:receipt-long-outline-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Tổng số giao dịch</p>
            <h3 className="mt-1 text-3xl font-black text-slate-800 dark:text-slate-100 truncate">{paymentsTotal} giao dịch</h3>
            <p className="text-xs mt-0.5 font-medium text-slate-400">Dựa theo bộ lọc hiện tại</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Trạng thái giao dịch</h3>
          <div className="h-56">
            <ReactECharts option={statusDistributionOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Phương thức thanh toán</h3>
          <div className="h-56">
            <ReactECharts option={methodDistributionOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Doanh thu theo ngày</h3>
          <p className="text-xs text-slate-400 mb-3">Giao dịch đã hoàn thành</p>
          <div className="h-48">
            <ReactECharts option={revenueChartOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    return (
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        {/* Search bar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-bold text-slate-700 dark:text-slate-350">Danh sách giao dịch</div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2 max-w-xs flex-1">
            <Icon icon="material-symbols:search-rounded" className="text-slate-400 text-lg shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo mã, ID đặt lịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Lọc trạng thái:</span>
            {["All", "Pending", "Completed", "Failed", "Refunded"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setPaymentStatusFilter(s);
                  setPaymentsPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  paymentStatusFilter === s ? "bg-[#066d72] border-[#066d72] text-white" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-800" />

          {/* Payment Method Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Phương thức:</span>
            {["All", "cash", "vnpay"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setPaymentMethodFilter(m);
                  setPaymentsPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  paymentMethodFilter === m ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                {m === "All" ? "Tất cả" : (PAYMENT_METHODS_LABELS[m] ?? m)}
              </button>
            ))}
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-[#066d72]" />
              <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5">Mã giao dịch</th>
                  <th className="px-5 py-3.5">Người chuyển</th>
                  <th className="px-5 py-3.5">Phương thức</th>
                  <th className="px-5 py-3.5">Liên kết</th>
                  <th className="px-5 py-3.5">Số tiền</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Thanh toán lúc</th>
                  <th className="px-5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const mLabel = p.payment_method ? (PAYMENT_METHODS_LABELS[p.payment_method] ?? p.payment_method) : "—";
                    const mIcon = p.payment_method ? (PAYMENT_METHODS_ICONS[p.payment_method] ?? "material-symbols:payments-outline") : "material-symbols:help-outline";
                    const isVnpay = p.payment_method === "vnpay";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs">{p.transaction_code || `PAY-${p.id}`}</p>
                          <p className="text-xs text-slate-400 mt-0.5">#{p.id}</p>
                        </td>
                        <td className="px-5 py-4">
                          {p.user ? (
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{p.user.full_name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {p.user.email} · {p.user.phone}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              isVnpay
                                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <Icon icon={mIcon} className="text-base shrink-0" />
                            {mLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {p.booking_id && <span className="block">📅 Booking #{p.booking_id}</span>}
                          {p.job_post_id && <span className="block">💼 Bài tuyển #{p.job_post_id}</span>}
                          {!p.booking_id && !p.job_post_id && <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{Number(p.amount || 0).toLocaleString("vi-VN")} ₫</td>
                        <td className="px-5 py-4">{getStatusBadge(p.status, "payment")}</td>
                        <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{p.paid_at ? new Date(p.paid_at).toLocaleString("vi-VN") : "—"}</td>
                        <td className="px-5 py-4 text-right">
                          <select
                            disabled={!permissions.updateStatus}
                            value={p.status}
                            onChange={(e) => handleUpdatePaymentStatus(p.id, e.target.value as any)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="pending">Chờ thanh toán</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="failed">Thất bại</option>
                            <option value="refunded">Đã hoàn tiền</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && <Pagination currentPage={paymentsPage} totalItems={paymentsTotal} itemsPerPage={itemsPerPage} onPageChange={setPaymentsPage} />}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
      {renderHeader()}
      {permissions.viewStats && renderStats()}
      {permissions.viewStats && renderCharts()}
      {renderTable()}
    </div>
  );
};
