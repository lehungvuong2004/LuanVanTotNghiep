import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAdminReports } from "./useHook";
import { useAuth } from "../../../hooks/useAuth";
import { Pagination } from "../../../components/Pagination";
import { BulkDeleteBar } from "../../../components/BulkDeleteBar";
import { getInitials, getRoleBadge } from "../../../utils";

export const Reports = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    view: hasPermission("reports.view"),
    process: hasPermission("reports.process"),
    delete: hasPermission("reports.process"),
  };

  const {
    reports,
    usersMap,
    loading,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
    handleProcessReport,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleDeleteReport,
    handleBulkDelete,
  } = useAdminReports();

  // Detail Modal state
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processStatus, setProcessStatus] = useState<"resolved" | "dismissed">("resolved");
  const [processNote, setProcessNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDetail = (report: any) => {
    setSelectedReport(report);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  const handleOpenProcess = (report, status: "resolved" | "dismissed") => {
    setSelectedReport(report);
    setProcessStatus(status);
    setProcessNote("");
    setIsProcessOpen(true);
  };

  const handleCloseProcess = () => {
    setIsProcessOpen(false);
    setProcessNote("");
  };

  const handleSubmitProcess = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await handleProcessReport(selectedReport.id, processStatus, processNote);
      handleCloseProcess();
      handleCloseDetail();
    } catch (err) {
      // already toasted
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Chờ xử lý
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Đã giải quyết
          </span>
        );
      case "dismissed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-650 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
            Đã bỏ qua
          </span>
        );
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">{status}</span>;
    }
  };

  if (!permissions.view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <Icon icon="material-symbols:lock-outline" className="text-6xl text-red-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không có quyền truy cập</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bạn không có quyền xem thông tin báo cáo vi phạm.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-8xl mx-auto px-4 md:px-6 py-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Icon icon="material-symbols:report-outline" className="text-3xl text-amber-500" />
            Quản lý Báo cáo Vi phạm
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Xem và xử lý các báo cáo vi phạm, khiếu nại từ khách hàng và người giúp việc.</p>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-750/60 shadow-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "resolved", "dismissed"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                statusFilter === status
                  ? "bg-[#026E5F] border-[#026E5F] text-white"
                  : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {status === "all" ? "Tất cả" : status === "pending" ? "Chờ xử lý" : status === "resolved" ? "Đã giải quyết" : "Đã bỏ qua"}
            </button>
          ))}
        </div>
      </div>

      {permissions.delete && selectedIds.length > 0 && (
        <div className="my-2">
          <BulkDeleteBar
            selectedIds={selectedIds}
            totalCount={reports.length}
            onToggleAll={toggleSelectAll}
            onDeleteSelected={handleBulkDelete}
            onClear={clearSelection}
            loading={loading}
          />
        </div>
      )}

      {/* Main Table card */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-[#026E5F]" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải danh sách báo cáo...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-100 dark:border-slate-700">
              <Icon icon="material-symbols:assignment-turned-in-outline-rounded" className="text-3xl" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Không có báo cáo nào</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Danh sách báo cáo trống.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-4xl">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-5 w-12 text-center">
                    {permissions.delete && (
                      <input
                        type="checkbox"
                        checked={selectedIds.length === reports.length && reports.length > 0}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = selectedIds.length > 0 && selectedIds.length < reports.length;
                          }
                        }}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600"
                      />
                    )}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mã cáo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Người báo cáo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Đối tượng bị báo cáo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Liên kết</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lý do</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-750">
                {reports.map((report) => {
                  const reporter = usersMap[report.report_by];
                  const reported = report.reported_user_id ? usersMap[report.reported_user_id] : null;

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                      <td className="py-4 px-5 text-center">
                        {permissions.delete && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelectOne(report.id)}
                            className="w-4 h-4 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="text-xs font-extrabold text-slate-450 dark:text-slate-500">#{report.id}</span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {reporter?.avatar ? (
                            <img
                              src={reporter.avatar.startsWith("http") ? reporter.avatar : `http://localhost:8000${reporter.avatar}`}
                              alt={reporter.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                              {getInitials(reporter?.full_name || "N/A")}
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{reporter?.full_name || "Hệ thống"}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getRoleBadge(reporter?.role_id)}
                              <span className="text-xs text-slate-450 dark:text-slate-500">ID: {report.report_by}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {reported?.avatar ? (
                            <img
                              src={reported.avatar.startsWith("http") ? reported.avatar : `http://localhost:8000${reported.avatar}`}
                              alt={reported.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-455 flex items-center justify-center font-bold text-sm">
                              {getInitials(reported?.full_name || "N/A")}
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{reported?.full_name || "N/A"}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getRoleBadge(reported?.role_id)}
                              <span className="text-xs text-slate-450 dark:text-slate-500">ID: {report.reported_user_id || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-left">
                        {report.booking_id && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#026E5F] dark:text-teal-400">
                            <Icon icon="material-symbols:calendar-today-outline" className="text-sm" />
                            Đơn: #{report.booking_id}
                          </span>
                        )}
                        {report.job_post_id && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-650 dark:text-purple-400">
                            <Icon icon="material-symbols:work-outline" className="text-sm" />
                            Bài tuyển: #{report.job_post_id}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-left max-w-xs truncate">
                        <span className="text-sm text-slate-650 dark:text-slate-300" title={report.reason}>
                          {report.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-center">{getStatusBadge(report.status)}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDetail(report)}
                            title="Xem chi tiết"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Icon icon="material-symbols:info-outline-rounded" className="text-xl" />
                          </button>
                          {permissions.process && report.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleOpenProcess(report, "resolved")}
                                title="Giải quyết"
                                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 rounded-lg transition-colors cursor-pointer"
                              >
                                <Icon icon="material-symbols:check-circle-outline-rounded" className="text-xl" />
                              </button>
                              <button
                                onClick={() => handleOpenProcess(report, "dismissed")}
                                title="Bỏ qua"
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <Icon icon="material-symbols:block-outline-rounded" className="text-xl" />
                              </button>
                            </>
                          )}
                          {permissions.delete && (
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              title="Xóa báo cáo"
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-455 rounded-lg transition-colors cursor-pointer"
                            >
                              <Icon icon="material-symbols:delete-outline-rounded" className="text-xl" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>

      {/* Report Detail Modal */}
      {selectedReport && !isProcessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-850 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50">
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                  <Icon icon="material-symbols:info-outline-rounded" className="text-2xl text-[#026E5F]" />
                  Chi tiết Báo cáo vi phạm
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Mã báo cáo: #{selectedReport.id}</p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
              >
                <Icon icon="material-symbols:close" className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] text-left">
              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Trạng thái</span>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Thời gian tạo</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 block">{new Date(selectedReport.created_at).toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {/* Actors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Người báo cáo</span>
                  {(() => {
                    const actor = usersMap[selectedReport.report_by];
                    return (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{actor?.full_name || "Hệ thống"}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{actor?.email}</span>
                          <span className="mt-1 self-start">{getRoleBadge(actor?.role_id)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Đối tượng bị báo cáo</span>
                  {(() => {
                    const actor = selectedReport.reported_user_id ? usersMap[selectedReport.reported_user_id] : null;
                    return (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{actor?.full_name || "N/A"}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{actor?.email || "N/A"}</span>
                          <span className="mt-1 self-start">{getRoleBadge(actor?.role_id)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Linked objects */}
              {(selectedReport.booking_id || selectedReport.job_post_id) && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tham chiếu hệ thống</span>
                  {selectedReport.booking_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Mã Đặt Lịch:</span>
                      <span className="font-bold text-[#026E5F] dark:text-teal-400">#{selectedReport.booking_id}</span>
                    </div>
                  )}
                  {selectedReport.job_post_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Mã Bài Tuyển Dụng:</span>
                      <span className="font-bold text-purple-650 dark:text-purple-400">#{selectedReport.job_post_id}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nội dung / Lý do vi phạm</span>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.reason}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3 border-t border-slate-100 dark:border-slate-800/50 pt-4.5">
              <button
                onClick={handleCloseDetail}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>
              {permissions.process && selectedReport.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setProcessStatus("dismissed");
                      setProcessNote("");
                      setIsProcessOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                  <button
                    onClick={() => {
                      setProcessStatus("resolved");
                      setProcessNote("");
                      setIsProcessOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-550 hover:bg-emerald-600 text-white text-sm font-bold transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    Giải quyết
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Process Modal */}
      {isProcessOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitProcess}
            className="bg-white dark:bg-slate-850 w-full max-w-md rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50 text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-855 dark:text-white flex items-center gap-2">
                  <Icon
                    icon={processStatus === "resolved" ? "material-symbols:check-circle-outline-rounded" : "material-symbols:block-outline-rounded"}
                    className={`text-2xl ${processStatus === "resolved" ? "text-emerald-500" : "text-slate-400"}`}
                  />
                  {processStatus === "resolved" ? "Giải quyết báo cáo" : "Bỏ qua báo cáo"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Xử lý báo cáo vi phạm #{selectedReport?.id}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseProcess}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
              >
                <Icon icon="material-symbols:close" className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Ghi chú xử lý <span className="text-slate-400 font-normal">(không bắt buộc)</span>
                </label>
                <textarea
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                  placeholder="Nhập lý do hoặc biện pháp xử lý vi phạm..."
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:border-[#026E5F] focus:ring-1 focus:ring-[#026E5F]/20 outline-none transition disabled:opacity-60 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={handleCloseProcess}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold transition active:scale-95 cursor-pointer shadow-sm ${
                  processStatus === "resolved" ? "bg-emerald-550 hover:bg-emerald-600" : "bg-slate-500 hover:bg-slate-600"
                }`}
              >
                {isSubmitting ? <Icon icon="svg-spinners:3-dots-fade" className="text-lg" /> : <Icon icon="material-symbols:check-circle-outline" className="text-lg" />}
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
