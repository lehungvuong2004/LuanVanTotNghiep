import React from "react";
import ReactECharts from "echarts-for-react";
import { Icon } from "@iconify/react";
import { usePaymentsRefunds } from "./useHook";
import { Toast } from "../../../components/Toast";

interface PaymentsRefundsProps {
  defaultTab?: "payments" | "refunds";
}

export const PaymentsRefunds: React.FC<PaymentsRefundsProps> = ({ defaultTab = "payments" }) => {
  const {
    activeTab,
    setActiveTab,
    loading,
    toast,
    setToast,
    searchQuery,
    setSearchQuery,

    // Payments
    payments,
    paymentsPage,
    setPaymentsPage,
    paymentsTotal,
    paymentStatusFilter,
    setPaymentStatusFilter,
    statusDistributionOption,
    handleUpdatePaymentStatus,

    // Refunds
    refunds,
    refundsPage,
    setRefundsPage,
    refundsTotal,
    refundStatusFilter,
    setRefundStatusFilter,
    handleProcessRefund,

    // Stats / ECharts
    metrics,
    revenueChartOption,
    itemsPerPage,
  } = usePaymentsRefunds(defaultTab);

  // Status Badge Helpers
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400";
      case "pending":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400";
      case "failed":
        return "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400";
      case "refunded":
        return "bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-350";
      default:
        return "bg-gray-50 dark:bg-gray-900 text-gray-600";
    }
  };

  const getRefundStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400";
      case "pending":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400";
      case "rejected":
        return "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400";
      default:
        return "bg-gray-50 dark:bg-gray-900 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payment & Refund Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor and process customer transactions, payouts, and refund requests.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1 */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450">
            <Icon icon="material-symbols:payments-outline-rounded" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Revenue (Completed)
            </p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">
              {metrics.totalPaymentsAmount.toLocaleString("vi-VN")} ₫
            </h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450">
            <Icon icon="material-symbols:pending-actions-rounded" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Pending Refund Requests
            </p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">
              {metrics.pendingRefundsCount} requests
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450">
            <Icon icon="material-symbols:undo-rounded" className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Refunded (Completed)
            </p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">
              {metrics.completedRefundsAmount.toLocaleString("vi-VN")} ₫
            </h3>
          </div>
        </div>
      </div>

      {/* Analytics/Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Trend Line Chart */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
              Revenue Over Time
            </h3>
            <span className="text-xs text-slate-400">Completed Transactions</span>
          </div>
          <div className="h-64 w-full">
            <ReactECharts
              option={revenueChartOption}
              style={{ height: "100%", width: "100%" }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>

        {/* Payment Status Distribution Pie Chart */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
              Payment Statuses
            </h3>
            <span className="text-xs text-slate-400">Share Ratio</span>
          </div>
          <div className="h-64 w-full">
            <ReactECharts
              option={statusDistributionOption}
              style={{ height: "100%", width: "100%" }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>

      {/* Navigation & Controls Section */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
        {/* Tabs and Search Bar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-850 pb-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-900/60 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "payments"
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon icon="material-symbols:payments-outline-rounded" />
              Payments
            </button>
            <button
              onClick={() => setActiveTab("refunds")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "refunds"
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon icon="material-symbols:undo-rounded" />
              Refund Requests
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-1 max-w-md items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50">
            <Icon icon="material-symbols:search-rounded" className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder={
                activeTab === "payments"
                  ? "Search by Booking ID or Code..."
                  : "Search by Refund ID or Reason..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Filter Status:
          </span>

          {activeTab === "payments" ? (
            <>
              {/* Payments Status Filters */}
              {["All", "Pending", "Completed", "Failed", "Refunded"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setPaymentStatusFilter(status);
                    setPaymentsPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    paymentStatusFilter === status
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </>
          ) : (
            <>
              {/* Refunds Status Filters */}
              {["All", "Pending", "Approved", "Rejected", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setRefundStatusFilter(status);
                    setRefundsPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    refundStatusFilter === status
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading records...</p>
          </div>
        ) : activeTab === "payments" ? (
          /* ============================================================
             PAYMENTS TAB LISTING
             ============================================================ */
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  <th className="px-6 py-4">Transaction Code</th>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Paid At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No payments found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-150">
                        {p.transaction_code || `PAY-${p.id}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                        BK-{p.booking_id || "N/A"}
                      </td>
                      <td className="px-6 py-4 uppercase font-semibold text-xs text-slate-500 dark:text-slate-400">
                        {p.payment_method || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                        {Number(p.amount || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(p.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === "completed" ? "bg-emerald-600" : p.status === "pending" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {p.paid_at ? new Date(p.paid_at).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={p.status}
                          onChange={(e) => handleUpdatePaymentStatus(p.id, e.target.value as any)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-slate-350 dark:hover:border-slate-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ============================================================
             REFUNDS TAB LISTING
             ============================================================ */
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  <th className="px-6 py-4">Request Info</th>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No refund requests found matching the current status.
                    </td>
                  </tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-150">
                          REF-{r.id.toString().padStart(4, "0")}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(r.created_at).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                        PAY-{r.payment_id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-100">
                        {Number(r.amount || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getRefundStatusBadge(r.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === "completed" || r.status === "approved" ? "bg-emerald-600" : r.status === "pending" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs truncate" title={r.reason || ""}>
                        {r.reason || "No reason specified."}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleProcessRefund(r.id, "approved")}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessRefund(r.id, "rejected")}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === "approved" && (
                          <button
                            onClick={() => handleProcessRefund(r.id, "completed")}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                        {r.status === "completed" && (
                          <span className="text-xs text-slate-400 font-semibold">Processed</span>
                        )}
                        {r.status === "rejected" && (
                          <span className="text-xs text-rose-450 font-semibold">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850">
            <span className="text-xs text-slate-400 font-semibold">
              Showing {activeTab === "payments" ? payments.length : refunds.length} of{" "}
              {activeTab === "payments" ? paymentsTotal : refundsTotal} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={activeTab === "payments" ? paymentsPage === 1 : refundsPage === 1}
                onClick={() =>
                  activeTab === "payments"
                    ? setPaymentsPage((prev) => Math.max(1, prev - 1))
                    : setRefundsPage((prev) => Math.max(1, prev - 1))
                }
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon icon="material-symbols:chevron-left-rounded" className="text-lg" />
              </button>
              <span className="text-xs font-bold text-slate-650 dark:text-slate-350 px-2">
                Page {activeTab === "payments" ? paymentsPage : refundsPage} of{" "}
                {Math.ceil(
                  (activeTab === "payments" ? paymentsTotal : refundsTotal) / itemsPerPage
                ) || 1}
              </span>
              <button
                disabled={
                  activeTab === "payments"
                    ? paymentsPage >= Math.ceil(paymentsTotal / itemsPerPage)
                    : refundsPage >= Math.ceil(refundsTotal / itemsPerPage)
                }
                onClick={() =>
                  activeTab === "payments"
                    ? setPaymentsPage((prev) => prev + 1)
                    : setRefundsPage((prev) => prev + 1)
                }
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon icon="material-symbols:chevron-right-rounded" className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
