import { Icon } from "@iconify/react";
import { useRefundsHook } from "./useHook.ts";
import { Pagination } from "../../../components/Pagination";
import { fmtVND, getStatusBadge } from "../../../utils";
import { useAuth } from "../../../hooks/useAuth";

export const Refunds = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    approve: hasPermission("refunds.approve"),
    reject: hasPermission("refunds.reject"),
  };

  const { loading, searchQuery, setSearchQuery, refunds, refundsPage, setRefundsPage, refundsTotal, refundStatusFilter, setRefundStatusFilter, handleProcessRefund, computedMetrics, itemsPerPage } =
    useRefundsHook();

  const renderHeader = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Hoàn tiền</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Xem xét và xử lý các yêu cầu hoàn tiền từ khách hàng.</p>
      </div>
    );
  };

  const renderStats = () => {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Icon icon="material-symbols:pending-actions-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Yêu cầu hoàn tiền chờ</p>
            <h3 className="mt-1 text-3xl font-black text-slate-800 dark:text-slate-100 truncate">{computedMetrics.pendingRefundsCount} yêu cầu</h3>
            <p className="text-xs mt-0.5 font-medium text-slate-400">Cần xem xét xử lý</p>
          </div>
        </div>
        {/* Card 2: Đã hoàn tiền */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <Icon icon="material-symbols:undo-rounded" className="text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Đã hoàn tiền thành công</p>
            <h3 className="mt-1 text-3xl font-black text-rose-600 dark:text-rose-400 truncate">{fmtVND(computedMetrics.completedRefundsAmount)}</h3>
            <p className="text-xs mt-0.5 font-medium text-slate-400">Tổng số tiền đã hoàn trả</p>
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
          <div className="text-sm font-bold text-slate-700 dark:text-slate-350">Danh sách yêu cầu hoàn tiền</div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2 max-w-xs flex-1">
            <Icon icon="material-symbols:search-rounded" className="text-slate-400 text-lg shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo ID, lý do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Lọc trạng thái:</span>
          {["All", "Pending", "Approved", "Rejected", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setRefundStatusFilter(s);
                setRefundsPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                refundStatusFilter === s ? "bg-[#066d72] border-[#066d72] text-white" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-[#066d72]" />
              <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xxs font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Mã yêu cầu</th>
                  <th className="px-5 py-3">Mã thanh toán</th>
                  <th className="px-5 py-3">Số tiền</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Lý do</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-650 dark:text-slate-300">
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium text-xs">
                      Không tìm thấy yêu cầu hoàn tiền nào.
                    </td>
                  </tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs">REF-{String(r.id).padStart(4, "0")}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(r.created_at).toLocaleDateString("vi-VN")}</p>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-500">PAY-{r.payment_id}</td>
                      <td className="px-5 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">{Number(r.amount || 0).toLocaleString("vi-VN")} ₫</td>
                      <td className="px-5 py-3">{getStatusBadge(r.status, "refund")}</td>
                      <td className="px-5 py-3 max-w-xs">
                        <p className="text-xs text-slate-500 truncate" title={r.reason || ""}>
                          {r.reason || "Không có lý do."}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                        {r.status === "pending" && (
                          <>
                            {permissions.approve && (
                              <button
                                onClick={() => handleProcessRefund(r.id, "approved")}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-600 hover:bg-sky-100 cursor-pointer transition-colors"
                              >
                                Duyệt
                              </button>
                            )}
                            {permissions.reject && (
                              <button
                                onClick={() => handleProcessRefund(r.id, "rejected")}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors"
                              >
                                Từ chối
                              </button>
                            )}
                            {!permissions.approve && !permissions.reject && <span className="text-xs text-slate-400 italic">Chờ phê duyệt</span>}
                          </>
                        )}
                        {r.status === "approved" && (
                          <>
                            {permissions.approve ? (
                              <button
                                onClick={() => handleProcessRefund(r.id, "completed")}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 cursor-pointer transition-colors"
                              >
                                Hoàn tất
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-sky-500">Đã duyệt (Chờ hoàn tất)</span>
                            )}
                          </>
                        )}
                        {r.status === "completed" && <span className="text-xs font-bold text-emerald-500">Đã xử lý</span>}
                        {r.status === "rejected" && <span className="text-xs font-bold text-rose-400">Đã từ chối</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && <Pagination currentPage={refundsPage} totalItems={refundsTotal} itemsPerPage={itemsPerPage} onPageChange={setRefundsPage} />}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
      {renderHeader()}
      {renderStats()}
      {renderTable()}
    </div>
  );
};
