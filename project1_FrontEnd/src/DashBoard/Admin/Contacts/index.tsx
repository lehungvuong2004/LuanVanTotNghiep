import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAdminContacts } from "./useHook";
import { useAuth } from "../../../hooks/useAuth";
import { Pagination } from "../../../components/Pagination";
import { BulkDeleteBar } from "../../../components/BulkDeleteBar";
import { getInitials, formatDateTime, getStatusBadge } from "../../../utils";

export const Contacts = () => {
  const { hasPermission } = useAuth();
  const permissions = {
    view: hasPermission("contacts.view"),
    process: hasPermission("contacts.process"),
    delete: hasPermission("contacts.delete"),
  };

  const {
    contacts,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
    handleProcessContact,
    handleDeleteContact,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
  } = useAdminContacts();

  // Detail Modal state
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDetail = (contact: any) => {
    setSelectedContact(contact);
  };

  const handleCloseDetail = () => {
    setSelectedContact(null);
  };

  const handleOpenProcess = (contact: any) => {
    setSelectedContact(contact);
    setIsProcessOpen(true);
  };

  const handleCloseProcess = () => {
    setIsProcessOpen(false);
  };

  const handleSubmitProcess = async () => {
    if (!selectedContact) return;
    setIsSubmitting(true);
    try {
      await handleProcessContact(selectedContact.id);
      handleCloseProcess();
      handleCloseDetail();
    } catch {
      // already handled in hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Quản Lý Liên Hệ & Hỗ Trợ</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Theo dõi và phản hồi các yêu cầu liên hệ, thắc mắc hoặc góp ý từ khách hàng gửi qua form Contact Us.</p>
      </div>
    </div>
  );

  const renderKPIs = () => {
    const totalCount = totalItems;
    const pendingCount = contacts.filter((c) => c.status === "pending").length;
    const processedCount = contacts.filter((c) => c.status === "processed").length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng yêu cầu</span>
            <h3 className="text-3xl font-black text-slate-700 dark:text-slate-100 mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
            <Icon icon="material-symbols:contact-phone-outline-rounded" className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đang chờ xử lý</span>
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/30">
            <Icon icon="material-symbols:hourglass-empty" className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đã giải quyết</span>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{processedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
            <Icon icon="material-symbols:check-circle-outline-rounded" className="text-2xl" />
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    const statuses = ["All", "Pending", "Processed"];
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between mb-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lọc Trạng Thái:</span>
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-cyan-900 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {status === "All" ? "Tất Cả" : status === "Pending" ? "Chờ Xử Lý" : "Đã Xử Lý"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative w-full md:max-w-md">
          <Icon icon="material-symbols:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-cyan-900/20 focus:outline-hidden focus:border-cyan-900 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-12 flex flex-col items-center justify-center gap-4">
          <span className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đang tải dữ liệu liên hệ...</span>
        </div>
      );
    }

    if (contacts.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-16 text-center">
          <Icon icon="material-symbols:contact-phone-outline-rounded" className="text-slate-300 dark:text-slate-600 text-6xl mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-350">Không tìm thấy yêu cầu liên hệ nào</h4>
          <p className="text-sm text-slate-400 mt-1">Dữ liệu liên hệ hiện tại trống hoặc không khớp bộ lọc.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 font-bold text-xxs tracking-wider uppercase">
                {permissions.delete && (
                  <th className="py-4 px-5 w-12 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-650 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                    >
                      {selectedIds.length === contacts.length && <span className="w-2 h-2 bg-teal-650 dark:bg-teal-400 rounded-xs" />}
                    </button>
                  </th>
                )}
                <th className="py-4 px-5">Người gửi</th>
                <th className="py-4 px-5">Lời nhắn</th>
                <th className="py-4 px-5">Trạng thái</th>
                <th className="py-4 px-5">Ngày gửi</th>
                <th className="py-4 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-xs font-semibold text-slate-600 dark:text-slate-350">
              {contacts.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <tr key={c.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors ${isSelected ? "bg-teal-500/5 dark:bg-teal-500/2" : ""}`}>
                    {permissions.delete && (
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => toggleSelectOne(c.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            isSelected ? "border-teal-650 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/20" : "border-slate-300 dark:border-slate-650 hover:border-slate-400"
                          }`}
                        >
                          {isSelected && <Icon icon="material-symbols:check-small-rounded" className="text-teal-600 dark:text-teal-400 text-sm" />}
                        </button>
                      </td>
                    )}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold text-xxs flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                          {getInitials(c.full_name)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-100">{c.full_name}</h5>
                          <p className="text-slate-400 text-xxs font-medium mt-0.5">
                            {c.email} | {c.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 min-w-45 max-w-xs">
                      <p className="whitespace-normal wrap-break-word text-slate-600 dark:text-slate-350" title={c.message}>
                        {c.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-5">{getStatusBadge(c.status, "contact")}</td>
                    <td className="py-3.5 px-5 text-slate-450 dark:text-slate-500">{formatDateTime(c.created_at)}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(c)}
                          title="Xem chi tiết"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
                        >
                          <Icon icon="material-symbols:visibility-outline-rounded" className="text-lg" />
                        </button>

                        {permissions.process && c.status === "pending" && (
                          <button
                            onClick={() => handleOpenProcess(c)}
                            title="Xử lý yêu cầu"
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer transition-colors"
                          >
                            <Icon icon="material-symbols:check-box-outline-blank" className="text-lg" />
                          </button>
                        )}

                        {permissions.delete && (
                          <button
                            onClick={() => {
                              if (confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) {
                                handleDeleteContact(c.id);
                              }
                            }}
                            title="Xóa liên hệ"
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-955/20 text-red-600 dark:text-red-400 hover:text-red-800 cursor-pointer transition-colors"
                          >
                            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
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

        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} />
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedContact) return null;
    const c = selectedContact;

    return (
      <div className="fixed inset-0 z-200 overflow-y-auto bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Icon icon="material-symbols:contact-support-outline-rounded" className="text-[#026E5F] text-xl" />
              Chi Tiết Yêu Cầu Liên Hệ
            </h3>
            <button onClick={handleCloseDetail} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors">
              <Icon icon="material-symbols:close-rounded" className="text-xl" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-700/80">
              <div className="w-12 h-12 rounded-full bg-[#026E5F]/10 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] font-bold text-base flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                {getInitials(c.full_name)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{c.full_name}</h4>
                <p className="text-xxs text-slate-400 dark:text-slate-550 font-medium mt-0.5">Ngày gửi: {formatDateTime(c.created_at)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-xxs text-slate-400 dark:text-slate-500 uppercase font-bold">Địa chỉ Email</span>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-bold mt-0.5 break-all">{c.email}</p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-xxs text-slate-400 dark:text-slate-500 uppercase font-bold">Số điện thoại</span>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-bold mt-0.5">{c.phone || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xxs text-slate-400 dark:text-slate-550 uppercase font-bold">Lời nhắn từ người dùng:</span>
              <div className="p-4 bg-slate-50 dark:bg-slate-905 rounded-xl border border-slate-150 dark:border-slate-750/80 text-slate-700 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                {c.message}
              </div>
            </div>

            <div className="p-4 rounded-xl border flex flex-col gap-2.5 bg-slate-50/50 dark:bg-slate-900/20 border-slate-150 dark:border-slate-750/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Trạng thái xử lý</span>
                {getStatusBadge(c.status, "contact")}
              </div>
              {c.processed_by_user && (
                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-750/80 text-xxs font-semibold space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Người xử lý:</span>
                    <span className="text-slate-750 dark:text-slate-200 font-bold">{c.processed_by_user.full_name}</span>
                  </div>
                  {c.processed_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thời gian xử lý:</span>
                      <span className="text-slate-750 dark:text-slate-200 font-bold">{formatDateTime(c.processed_at)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3">
            <button
              onClick={handleCloseDetail}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-slate-750 dark:text-slate-300"
            >
              Đóng lại
            </button>

            {permissions.process && c.status === "pending" && (
              <button
                onClick={() => handleOpenProcess(c)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Icon icon="material-symbols:check-circle-outline-rounded" className="text-base" />
                Xác nhận đã xử lý
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessModal = () => {
    if (!isProcessOpen || !selectedContact) return null;
    const c = selectedContact;

    return (
      <div className="fixed inset-0 z-300 overflow-y-auto bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
        <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Icon icon="material-symbols:check-box-outline-blank" className="text-emerald-500" />
              Xác Nhận Xử Lý Yêu Cầu
            </h3>
            <button onClick={handleCloseProcess} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <Icon icon="material-symbols:close-rounded" className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn đánh dấu yêu cầu liên hệ của <span className="text-teal-600 font-extrabold">"{c.full_name}"</span> là{" "}
              <span className="text-emerald-600 font-extrabold">ĐÃ XỬ LÝ</span>?
            </p>
            <p className="text-xxs text-slate-400 dark:text-slate-500">Hành động này xác nhận bạn đã liên hệ lại và giải quyết xong thắc mắc của khách hàng này.</p>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3">
            <button
              onClick={handleCloseProcess}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmitProcess}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md active:scale-98 transition-all cursor-pointer"
            >
              {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200">
      {renderHeader()}
      {renderKPIs()}
      {renderFilters()}

      {permissions.delete && selectedIds.length > 0 && (
        <div className="my-2">
          <BulkDeleteBar
            selectedIds={selectedIds}
            totalCount={contacts.length}
            onToggleAll={toggleSelectAll}
            onDeleteSelected={async () => {
              if (confirm(`Bạn có chắc muốn xóa ${selectedIds.length} liên hệ đã chọn?`)) {
                for (const id of selectedIds) {
                  await handleDeleteContact(id);
                }
              }
            }}
            onClear={clearSelection}
            loading={loading}
          />
        </div>
      )}

      {renderTable()}
      {renderDetailModal()}
      {renderProcessModal()}
    </div>
  );
};

export default Contacts;
