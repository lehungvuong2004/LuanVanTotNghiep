import React from "react";
import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { usePaymentsRefunds, PAYMENT_METHODS_LABELS, PAYMENT_METHODS_ICONS } from "./useHook";
import { Toast } from "../../../components/Toast";
import { Pagination } from "../../../components/Pagination";

interface PaymentsRefundsProps {
  defaultTab?: "payments" | "refunds";
}

export const PaymentsRefunds: React.FC<PaymentsRefundsProps> = ({ defaultTab = "payments" }) => {
  const {
    activeTab, setActiveTab,
    loading, statsLoading,
    toast, setToast,
    searchQuery, setSearchQuery,
    liveStats,
    payments, paymentsPage, setPaymentsPage, paymentsTotal,
    paymentStatusFilter, setPaymentStatusFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    handleUpdatePaymentStatus,
    refunds, refundsPage, setRefundsPage, refundsTotal,
    refundStatusFilter, setRefundStatusFilter,
    handleProcessRefund,
    computedMetrics,
    revenueChartOption, statusDistributionOption, methodDistributionOption,
    itemsPerPage,
  } = usePaymentsRefunds(defaultTab);

  const fmtVND  = (n: number) => n.toLocaleString("vi-VN") + " ₫";
  const fmtPct  = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";

  // ─── Status Class Mappings ────────────────────────────────────────────────

  const getStatusBadgeCls = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
      pending:   "bg-amber-50  dark:bg-amber-950/30  text-amber-600  dark:text-amber-400",
      failed:    "bg-rose-50   dark:bg-rose-950/30   text-rose-600   dark:text-rose-400",
      refunded:  "bg-slate-100 dark:bg-slate-800     text-slate-600  dark:text-slate-400",
      approved:  "bg-sky-50    dark:bg-sky-950/30    text-sky-600    dark:text-sky-400",
      rejected:  "bg-rose-50   dark:bg-rose-950/30   text-rose-600   dark:text-rose-400",
    };
    return map[status] ?? "bg-slate-100 text-slate-500";
  };

  const getStatusDotCls = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-emerald-500", pending: "bg-amber-500", failed: "bg-rose-500",
      refunded: "bg-slate-400", approved: "bg-sky-500", rejected: "bg-rose-500",
    };
    return map[status] ?? "bg-slate-400";
  };

  // ─── Render Functions ─────────────────────────────────────────────────────

  const renderHeader = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quản lý Thanh toán & Hoàn tiền
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Theo dõi giao dịch, xử lý hoàn tiền và kiểm tra doanh thu theo thời gian thực.
        </p>
      </div>
    );
  };

  const renderStats = () => {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng doanh thu */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <Icon icon="material-symbols:payments-outline-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Tổng doanh thu</p>
            {statsLoading ? (
              <div className="mt-1.5 h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                {liveStats ? fmtVND(liveStats.total_revenue) : "—"}
              </h3>
            )}
            {liveStats && !statsLoading && (
              <p className="text-xs mt-0.5 font-medium text-slate-400">
                Tháng này: {fmtVND(liveStats.this_month_revenue)}
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Tăng trưởng */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Icon icon="material-symbols:trending-up-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Tăng trưởng tháng</p>
            {statsLoading ? (
              <div className="mt-1.5 h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                {liveStats ? fmtPct(liveStats.change_percent) : "—"}
              </h3>
            )}
            {liveStats && !statsLoading && (
              <p className={`text-xs mt-0.5 font-medium ${liveStats.change_percent >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                Tháng trước: {fmtVND(liveStats.last_month_revenue)}
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Hoàn tiền chờ */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Icon icon="material-symbols:pending-actions-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Yêu cầu hoàn tiền chờ</p>
            <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
              {computedMetrics.pendingRefundsCount} yêu cầu
            </h3>
          </div>
        </div>

        {/* Card 4: Đã hoàn tiền */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Icon icon="material-symbols:undo-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Đã hoàn tiền</p>
            <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
              {fmtVND(computedMetrics.completedRefundsAmount)}
            </h3>
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
          <div className="h-56"><ReactECharts option={statusDistributionOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate /></div>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Phương thức thanh toán</h3>
          <div className="h-56"><ReactECharts option={methodDistributionOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate /></div>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Doanh thu theo ngày</h3>
          <p className="text-xs text-slate-400 mb-3">Giao dịch đã hoàn thành</p>
          <div className="h-48"><ReactECharts option={revenueChartOption} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate /></div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    return (
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        {/* Tabs + search */}
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5 self-start rounded-lg bg-slate-100/60 dark:bg-slate-900/60 p-1">
            {(["payments", "refunds"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-950 text-[#066d72] dark:text-teal-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}>
                <Icon icon={tab === "payments" ? "material-symbols:payments-outline-rounded" : "material-symbols:undo-rounded"} />
                {tab === "payments" ? "Thanh toán" : "Hoàn tiền"}
                <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {tab === "payments" ? paymentsTotal : refundsTotal}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2 max-w-xs flex-1">
            <Icon icon="material-symbols:search-rounded" className="text-slate-400 text-lg shrink-0" />
            <input type="text"
              placeholder={activeTab === "payments" ? "Tìm theo mã, ID đặt lịch..." : "Tìm theo ID, lý do..."}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Lọc:</span>
          {activeTab === "payments" ? (
            <>
              {["All","Pending","Completed","Failed","Refunded"].map((s) => (
                <button key={s} onClick={() => { setPaymentStatusFilter(s); setPaymentsPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    paymentStatusFilter === s ? "bg-[#066d72] border-[#066d72] text-white" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                  }`}>{s}</button>
              ))}
              <span className="mx-1 text-slate-200 dark:text-slate-700">|</span>
              {["All","cash","vnpay"].map((m) => (
                <button key={m} onClick={() => { setPaymentMethodFilter(m); setPaymentsPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    paymentMethodFilter === m ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                  }`}>{m === "All" ? "Tất cả phương thức" : (PAYMENT_METHODS_LABELS[m] ?? m)}</button>
              ))}
            </>
          ) : (
            ["All","Pending","Approved","Rejected","Completed"].map((s) => (
              <button key={s} onClick={() => { setRefundStatusFilter(s); setRefundsPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  refundStatusFilter === s ? "bg-[#066d72] border-[#066d72] text-white" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}>{s}</button>
            ))
          )}
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-[#066d72]" />
              <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
            </div>
          ) : activeTab === "payments" ? (
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
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-medium">Không tìm thấy giao dịch nào.</td></tr>
                ) : payments.map((p) => {
                  const mLabel = p.payment_method ? (PAYMENT_METHODS_LABELS[p.payment_method] ?? p.payment_method) : "—";
                  const mIcon  = p.payment_method ? (PAYMENT_METHODS_ICONS[p.payment_method]  ?? "material-symbols:payments-outline") : "material-symbols:help-outline";
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
                            <p className="text-xs text-slate-400 mt-0.5">{p.user.email} · {p.user.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isVnpay
                            ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}>
                          <Icon icon={mIcon} className="text-base shrink-0" />
                          {mLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {p.booking_id  && <span className="block">📅 Booking #{p.booking_id}</span>}
                        {p.job_post_id && <span className="block">💼 Bài tuyển #{p.job_post_id}</span>}
                        {!p.booking_id && !p.job_post_id && <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {Number(p.amount || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeCls(p.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotCls(p.status)}`} />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {p.paid_at ? new Date(p.paid_at).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <select value={p.status} onChange={(e) => handleUpdatePaymentStatus(p.id, e.target.value as any)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-slate-300">
                          <option value="pending">Chờ thanh toán</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="failed">Thất bại</option>
                          <option value="refunded">Đã hoàn tiền</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5">Mã yêu cầu</th>
                  <th className="px-5 py-3.5">Mã thanh toán</th>
                  <th className="px-5 py-3.5">Số tiền</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Lý do</th>
                  <th className="px-5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {refunds.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">Không tìm thấy yêu cầu hoàn tiền nào.</td></tr>
                ) : refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs">REF-{String(r.id).padStart(4, "0")}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(r.created_at).toLocaleDateString("vi-VN")}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">PAY-{r.payment_id}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {Number(r.amount || 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeCls(r.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotCls(r.status)}`} />
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs text-slate-500 truncate" title={r.reason || ""}>{r.reason || "Không có lý do."}</p>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {r.status === "pending" && (
                        <>
                          <button onClick={() => handleProcessRefund(r.id, "approved")}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-600 hover:bg-sky-100 cursor-pointer transition-colors">
                            Duyệt
                          </button>
                          <button onClick={() => handleProcessRefund(r.id, "rejected")}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors">
                            Từ chối
                          </button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button onClick={() => handleProcessRefund(r.id, "completed")}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 cursor-pointer transition-colors">
                          Hoàn tất
                        </button>
                      )}
                      {r.status === "completed" && <span className="text-xs font-semibold text-emerald-500">Đã xử lý</span>}
                      {r.status === "rejected"  && <span className="text-xs font-semibold text-rose-400">Đã từ chối</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && (
          <Pagination
            currentPage={activeTab === "payments" ? paymentsPage : refundsPage}
            totalItems={activeTab === "payments" ? paymentsTotal : refundsTotal}
            itemsPerPage={itemsPerPage}
            onPageChange={activeTab === "payments" ? setPaymentsPage : setRefundsPage}
          />
        )}
      </div>
    );
  };

  // ─── Main Return ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
      {toast && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      {renderHeader()}

      {renderStats()}

      {renderCharts()}

      {renderTable()}
    </div>
  );
};
