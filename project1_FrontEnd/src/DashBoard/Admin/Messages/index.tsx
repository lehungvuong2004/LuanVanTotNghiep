import { Icon } from "@iconify/react";
import { useAdminMessages } from "./useHook";
import { formatDateTime, getRoleBadge, getInitials } from "../../../utils";

export const AdminMessages = () => {
  const {
    t,
    messages,
    page,
    setPage,
    lastPage,
    searchQuery,
    handleSearchChange,
    loading,
    deletingId,
    handleDelete,
    refresh,
  } = useAdminMessages();

  // 1. Render Header & Search
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0.5">{t("Quản lý Tin nhắn")}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("Xem lịch sử trò chuyện, kiểm duyệt nội dung tin nhắn và xóa tin nhắn vi phạm chính sách của hệ thống.")}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("Tìm theo nội dung, tên, email...")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-xs"
          />
          <Icon
            icon="material-symbols:search-rounded"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
          />
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          title={t("Làm mới")}
        >
          <Icon
            icon="material-symbols:refresh-rounded"
            className={`text-xl ${loading ? "animate-spin text-blue-500" : ""}`}
          />
        </button>
      </div>
    </div>
  );

  // Helper to render user details cell
  const renderUserCell = (user: any) => {
    if (!user) return <span className="text-slate-400 italic text-xs">{t("Không xác định")}</span>;

    const initials = getInitials(user.full_name);

    return (
      <div className="flex items-center gap-3 min-w-52">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.full_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {user.full_name}
          </span>
          <span className="text-xs text-slate-550 dark:text-slate-400 truncate">
            {user.email}
          </span>
          <div className="mt-0.5 self-start">
            {getRoleBadge(user.role?.name || user.role)}
          </div>
        </div>
      </div>
    );
  };

  // 2. Render Messages Table
  const renderTable = () => {
    if (loading && messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-blue-500 mb-2" />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t("Đang tải dữ liệu...")}</span>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center mb-4">
            <Icon icon="material-symbols:chat-bubble-outline-rounded" className="text-3xl text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{t("Không tìm thấy tin nhắn")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {searchQuery
              ? t("Không có tin nhắn nào khớp với từ khóa tìm kiếm của bạn.")
              : t("Hiện tại hệ thống chưa có dữ liệu tin nhắn nào.")}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-16">ID</th>
                <th className="py-4 px-6">{t("Người gửi")}</th>
                <th className="py-4 px-6">{t("Người nhận")}</th>
                <th className="py-4 px-6 min-w-80">{t("Nội dung tin nhắn")}</th>
                <th className="py-4 px-6 w-48">{t("Thời gian gửi")}</th>
                <th className="py-4 px-6 w-24 text-center">{t("Hành động")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
              {messages.map((msg) => {
                const isDeleting = deletingId === msg.id;

                return (
                  <tr
                    key={msg.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-750/10 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-slate-400 text-xs">#{msg.id}</td>

                    {/* Sender */}
                    <td className="py-4 px-6">{renderUserCell(msg.sender)}</td>

                    {/* Receiver */}
                    <td className="py-4 px-6">{renderUserCell(msg.receiver)}</td>

                    {/* Message content */}
                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-md">
                        <div className="bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-250 p-2.5 rounded-xl text-sm break-words leading-relaxed inline-block">
                          {msg.message}
                        </div>
                        {msg.attachment && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                            <Icon icon="material-symbols:attach-file-rounded" className="text-sm" />
                            <a
                              href={msg.attachment}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline truncate max-w-xs"
                            >
                              {msg.attachment.split("/").pop()}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sent At */}
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-450 whitespace-nowrap">
                      {formatDateTime(msg.created_at)}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={isDeleting || loading}
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-650 dark:text-red-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        title={t("Xóa vĩnh viễn tin nhắn")}
                      >
                        {isDeleting ? (
                          <Icon icon="line-md:loading-twotone-loop" className="text-lg" />
                        ) : (
                          <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {renderPagination()}
      </div>
    );
  };

  // 3. Render Pagination
  const renderPagination = () => {
    if (lastPage <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/5">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t("Trang {{page}} / {{lastPage}}", { page, lastPage })}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Icon icon="material-symbols:chevron-left-rounded" className="text-xl" />
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === lastPage)
            .map((p, index, array) => {
              const isCurrent = p === page;
              const showEllipsis = index > 0 && p - array[index - 1] > 1;

              return (
                <div key={p} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-2 text-slate-400 select-none">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-xs"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                </div>
              );
            })}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
            disabled={page === lastPage || loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Icon icon="material-symbols:chevron-right-rounded" className="text-xl" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 w-full max-w-8xl mx-auto space-y-6">
      {renderHeader()}
      {renderTable()}
    </div>
  );
};
