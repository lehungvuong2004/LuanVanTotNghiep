import { Icon } from "@iconify/react";
import { useApplicationReview } from "./useHook";
import { Pagination } from "../../../components/Pagination";

import { BulkDeleteBar } from "../../../components/BulkDeleteBar";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export const ApplicationReview = () => {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission("job_posts.approve");
  const canReject = hasPermission("job_posts.reject");
  const canHide = hasPermission("job_posts.hide");
  const canCreate = hasPermission("job_posts.create");
  const canDelete = hasPermission("job_posts.delete");

  const {
    jobPosts,
    usersMap,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    totalItems,
    selectedPost,
    isDetailOpen,
    detailLoading,
    actionLoading,
    handleOpenDetail,
    handleCloseDetail,
    handleUpdateStatus,
    metrics,

    itemsPerPage,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
  } = useApplicationReview();

  const formatPrice = (price: any) => {
    if (!price) return "Thỏa thuận";
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const renderStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: string }> = {
      pending: { label: "Chờ duyệt", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-650 dark:text-amber-400", icon: "material-symbols:hourglass-empty-rounded" },
      open: { label: "Hoạt động", bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-600 dark:text-emerald-400", icon: "material-symbols:check-circle-outline-rounded" },
      closed: { label: "Đã đóng", bg: "bg-slate-100 dark:bg-slate-900/40", text: "text-slate-600 dark:text-slate-400", icon: "material-symbols:cancel-presentation-outline" },
      rejected: { label: "Bị từ chối", bg: "bg-rose-50 dark:bg-rose-955/20", text: "text-rose-600 dark:text-rose-400", icon: "material-symbols:block-outline-rounded" },
    };

    const cfg = configs[status] || { label: status, bg: "bg-slate-50", text: "text-slate-655", icon: "material-symbols:help-outline" };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border border-current/10`}>
        <Icon icon={cfg.icon} className="text-sm shrink-0" />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-8xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight font-sans">Phê Duyệt Tin Tuyển Dụng</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kênh kiểm duyệt thông tin và trạng thái hiển thị của các bài đăng tìm người giúp việc từ Khách hàng.</p>
        </div>
        {canCreate && (
          <Link
            to="/dang-bai-tuyen"
            className="inline-flex items-center gap-2 bg-[#0d5c63] hover:bg-[#0b4d53] text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:shadow-md shrink-0 cursor-pointer"
          >
            <Icon icon="material-symbols:add-box-outline-rounded" className="text-xl" />
            Đăng Tin Tuyển Dụng
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:post-add-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 block">Tổng Bài Đăng</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.total} tin</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:hourglass-empty-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 block">Chờ Kiểm Duyệt</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.pending} tin</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:check-circle-outline-rounded" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 block">Đang Hiển Thị</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.open} tin</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-slate-550 dark:text-slate-400 flex items-center justify-center text-2xl shrink-0">
            <Icon icon="material-symbols:cancel-presentation-outline" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 block">Đã Khóa / Đóng</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.closed} tin</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 text-lg">
            <Icon icon="material-symbols:search-rounded" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tiêu đề, tên Khách hàng, Nội dung..."
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
              <option value="Open">Hoạt động (Open)</option>
              <option value="Closed">Đã đóng (Closed)</option>
              <option value="Rejected">Bị từ chối (Rejected)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">Đang tải danh sách tin đăng...</p>
        </div>
      ) : !jobPosts.length ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-neutral-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy tin tuyển dụng</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Không có tin tuyển dụng nào được tìm thấy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {canDelete && selectedIds.length > 0 && (
            <BulkDeleteBar selectedIds={selectedIds} totalCount={jobPosts.length} onToggleAll={toggleSelectAll} onDeleteSelected={handleBulkDelete} onClear={clearSelection} loading={actionLoading} />
          )}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-4xl">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-700 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {canDelete && (
                      <th className="py-3.5 px-5 text-center w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === jobPosts.length && jobPosts.length > 0}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = selectedIds.length > 0 && selectedIds.length < jobPosts.length;
                            }
                          }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                        />
                      </th>
                    )}
                    <th className="py-3.5 px-5">Bài Tuyển Dụng</th>
                    <th className="py-3.5 px-5">Khách Hàng</th>
                    <th className="py-3.5 px-5">Mức Lương Đề Xuất</th>
                    <th className="py-3.5 px-5">Khu Vực</th>
                    <th className="py-3.5 px-5">Trạng Thái</th>
                    <th className="py-3.5 px-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-705 dark:text-slate-200">
                  {jobPosts.map((post) => {
                    const customer = usersMap[post.customer_id];

                    return (
                      <tr key={post.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors ${selectedIds.includes(post.id) ? "bg-red-50/20 dark:bg-red-950/10" : ""}`}>
                        {/* Checkbox column */}
                        {canDelete && (
                          <td className="py-3.5 px-5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(post.id)}
                              onChange={() => toggleSelectOne(post.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                            />
                          </td>
                        )}
                        {/* Job Title */}
                        <td className="py-3.5 px-5 max-w-xs">
                          <button onClick={() => handleOpenDetail(post)} className="font-extrabold text-blue-650 dark:text-blue-400 hover:underline text-left truncate block w-full cursor-pointer">
                            {post.title}
                          </button>
                          <div className="text-xxs text-slate-400 dark:text-slate-500 mt-1">Đăng ngày: {new Date(post.created_at).toLocaleDateString("vi-VN")}</div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{customer?.full_name || `Khách hàng #${post.customer_id}`}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{customer?.phone || "N/A"}</div>
                        </td>

                        {/* Salary */}
                        <td className="py-3.5 px-5 font-bold text-slate-850 dark:text-slate-150">{formatPrice(post.salary)}</td>

                        {/* Location */}
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{post.district || "N/A"}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{post.city || ""}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">{renderStatusBadge(post.status)}</td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Approve (Open) */}
                            {post.status !== "open" && canApprove && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleUpdateStatus(post.id, "open")}
                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 disabled:opacity-50 cursor-pointer"
                                title="Phê duyệt cho hiển thị"
                              >
                                <Icon icon="material-symbols:check-circle-outline-rounded" className="text-lg" />
                              </button>
                            )}

                            {/* Block / Pending */}
                            {post.status !== "pending" && canHide && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleUpdateStatus(post.id, "pending")}
                                className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-955/20 disabled:opacity-50 cursor-pointer"
                                title="Tạm dừng / Chờ duyệt"
                              >
                                <Icon icon="material-symbols:hourglass-empty-rounded" className="text-lg" />
                              </button>
                            )}

                            {/* Close */}
                            {post.status !== "closed" && canHide && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleUpdateStatus(post.id, "closed")}
                                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-50 cursor-pointer"
                                title="Đóng / Gỡ bài viết"
                              >
                                <Icon icon="material-symbols:block-outline-rounded" className="text-lg" />
                              </button>
                            )}

                            {/* View Detail */}
                            <button
                              onClick={() => handleOpenDetail(post)}
                              className="p-2 rounded-xl text-slate-450 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                              title="Xem chi tiết tuyển dụng"
                            >
                              <Icon icon="material-symbols:visibility-outline-rounded" className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 pb-4">
              <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transform scale-100 transition-all my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-2">
                  <Icon icon="material-symbols:post-add-rounded" className="text-[#026E5F] dark:text-emerald-400" />
                  Chi Tiết Bài Tuyển Dụng
                </h3>
                <p className="text-xxs text-slate-400 dark:text-slate-550 mt-0.5">Kiểm duyệt các thông tin công việc</p>
              </div>
              <button onClick={handleCloseDetail} className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Icon icon="material-symbols:close-rounded" className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-left max-h-[70vh] overflow-y-auto">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-8 h-8 border-3 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 mt-3">Đang tải hồ sơ bài đăng tuyển dụng...</p>
                </div>
              ) : (
                <>
                  {/* Status Strip */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <span className="block text-xxs font-bold text-slate-400 dark:text-slate-550 uppercase">Trạng thái hiện tại</span>
                      <div className="mt-1">{renderStatusBadge(selectedPost.status)}</div>
                    </div>
                    <div>
                      <span className="block text-xxs font-bold text-slate-400 dark:text-slate-550 uppercase text-right">Lương đề xuất</span>
                      <span className="text-sm font-extrabold text-blue-650 dark:text-blue-400 block mt-1">{formatPrice(selectedPost.salary)}</span>
                    </div>
                  </div>

                  {/* Title & Customer */}
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{selectedPost.title}</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-500">
                      Đăng bởi: <span className="font-bold text-slate-700 dark:text-slate-350">{usersMap[selectedPost.customer_id]?.full_name || `User #${selectedPost.customer_id}`}</span> (SĐT:{" "}
                      {usersMap[selectedPost.customer_id]?.phone || "N/A"})
                    </p>
                  </div>

                  {/* Location & Time Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-700/30">
                    <div>
                      <span className="block text-xxs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Địa điểm phục vụ</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200">
                        {selectedPost.address ? `${selectedPost.address}, ` : ""}
                        {selectedPost.district || ""}, {selectedPost.city || ""}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xxs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Thời gian làm việc</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200">{selectedPost.working_time ? new Date(selectedPost.working_time).toLocaleString("vi-VN") : "Thỏa thuận"}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Mô tả công việc</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-750 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedPost.description || "Không có mô tả công việc."}
                    </div>
                  </div>

                  {/* Services Needed */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Dịch vụ yêu cầu</h4>
                    {selectedPost.services && selectedPost.services.length > 0 ? (
                      <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                            <tr>
                              <th className="p-3">Tên dịch vụ</th>
                              <th className="p-3">Giá gợi ý</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 dark:divide-slate-750 bg-white dark:bg-slate-800">
                            {selectedPost.services.map((svc: any) => (
                              <tr key={svc.id} className="text-slate-700 dark:text-slate-300">
                                <td className="p-3 font-semibold">{svc.name}</td>
                                <td className="p-3">{formatPrice(svc.price)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-400">Không có dịch vụ cụ thể.</p>
                    )}
                  </div>

                  {/* Job Applications list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Hồ sơ ứng tuyển từ thợ ({selectedPost.applications?.length || 0})</h4>
                    {selectedPost.applications && selectedPost.applications.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPost.applications.map((app: any) => {
                          const helperUser = usersMap[app.helper_id];
                          return (
                            <div
                              key={app.id}
                              className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                            >
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                  <span>{helperUser?.full_name || `Helper #${app.helper_id}`}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ${app.status === "accepted" ? "bg-emerald-50 text-emerald-650 border border-emerald-200" : app.status === "rejected" ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}
                                  >
                                    {app.status === "accepted" ? "Đã nhận việc" : app.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                                  </span>
                                </div>
                                <div className="text-slate-500 mt-1">SĐT: {helperUser?.phone || "N/A"}</div>
                                {app.message && (
                                  <p className="text-slate-550 dark:text-slate-400 mt-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                                    Tin nhắn: "{app.message}"
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="block text-xxs text-slate-400 uppercase font-bold">Giá đề xuất của thợ</span>
                                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block mt-1">{formatPrice(app.proposed_price || selectedPost.salary)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-400">Chưa có Người giúp việc nào ứng tuyển vào bài đăng này.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
              {/* Quick actions in detail modal */}
              {selectedPost && !detailLoading && (
                <div className="flex gap-2">
                  {selectedPost.status !== "open" && canApprove && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedPost.id, "open")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Duyệt (Open)
                    </button>
                  )}
                  {selectedPost.status !== "pending" && canHide && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedPost.id, "pending")}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Dừng (Pending)
                    </button>
                  )}
                  {selectedPost.status !== "closed" && canHide && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedPost.id, "closed")}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Gỡ (Closed)
                    </button>
                  )}
                  {selectedPost.status !== "rejected" && canReject && (
                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        const reason = window.prompt("Nhập lý do từ chối bài đăng:");
                        if (reason !== null) {
                          handleUpdateStatus(selectedPost.id, "rejected", reason);
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Từ chối (Reject)
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
