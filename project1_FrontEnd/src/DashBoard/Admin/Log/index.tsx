import { Icon } from "@iconify/react";

import { Pagination } from "../../../components/Pagination";
import { useActivityLogsAdmin } from "./useHook";
import { getInitials, getRoleBadge, formatDateTimeLong } from "../../../utils";

export const ActivityLogs = () => {
  const {
    logs,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalItems,
    
    
    fetchLogs,
    handleDeleteLog,
    handleClearLogs } = useActivityLogsAdmin();

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("login") || act.includes("logout")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 whitespace-nowrap">
          <Icon icon="material-symbols:vpn-key-outline-rounded" />
          Hệ thống
        </span>
      );
    }
    if (act.includes("create") || act.includes("add") || act.includes("register")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 whitespace-nowrap">
          <Icon icon="material-symbols:add-circle-outline-rounded" />
          Tạo mới
        </span>
      );
    }
    if (act.includes("update") || act.includes("edit") || act.includes("change") || act.includes("toggle") || act.includes("save")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">
          <Icon icon="material-symbols:edit-note-rounded" />
          Cập nhật
        </span>
      );
    }
    if (act.includes("delete") || act.includes("remove") || act.includes("clear") || act.includes("destroy")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 whitespace-nowrap">
          <Icon icon="material-symbols:delete-outline-rounded" />
          Xóa bỏ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/30 whitespace-nowrap">
        <Icon icon="material-symbols:info-outline" />
        {action}
      </span>
    );
  };



  

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Lịch Sử Hoạt Động
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi các hoạt động, thao tác thay đổi dữ liệu của người dùng trên toàn hệ thống.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon icon="material-symbols:delete-sweep-outline-rounded" className="text-xl" />
            Xóa Toàn Bộ Nhật Ký
          </button>
        )}
      </div>
    </div>
  );

  const renderStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Icon icon="material-symbols:history-rounded" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng số bản ghi</p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800 dark:text-slate-100">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Icon icon="material-symbols:person-play-outline-rounded" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Người dùng hoạt động</p>
            <p className="text-3xl font-bold mt-0.5 text-slate-800 dark:text-slate-100">
              {Array.from(new Set(logs.map(l => l.user_id))).length} người
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Icon icon="material-symbols:today-rounded" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trạng thái hệ thống</p>
            <p className="text-xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">Đang hoạt động ổn định</p>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        <input
          type="text"
          placeholder="Tìm theo hành động, mô tả, tên, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading && logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải lịch sử hoạt động...</p>
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-4xl text-slate-400 mb-4">
            <Icon icon="material-symbols:history-toggle-rounded" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy lịch sử hoạt động nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hệ thống chưa ghi nhận bất kỳ thao tác nào phù hợp.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Người Thực Hiện</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô Tả Chi Tiết</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời Gian</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                {logs.map((item) => {
                  const user = item.user;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">#{item.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 border border-cyan-100 dark:border-cyan-900/40">
                            {user ? getInitials(user.full_name, "KH") : "HT"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                                {user ? user.full_name : "Hệ thống"}
                              </p>
                              {user && getRoleBadge(user.role_id)}
                            </div>
                            {user && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {getActionBadge(item.action)}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {item.description}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTimeLong(item.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteLog(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Xóa bản ghi"
                          >
                            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={15}
          onPageChange={(p) => fetchLogs(p)}
        />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200">
      
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderTable()}
    </div>
  );
};

export default ActivityLogs;

