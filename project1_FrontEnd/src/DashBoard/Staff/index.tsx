import React from "react";
import { Icon } from "@iconify/react";
import { useStaffRecruitment } from "./useHook";
import { Toast } from "../../components/Toast";
import { Pagination } from "../../components/Pagination";

export const StaffRecruitmentDashboard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    jobPosts,
    applications,
    loading,
    actionLoading,
    searchQuery,
    setSearchQuery,
    cityFilter,
    setCityFilter,
    districtFilter,
    setDistrictFilter,
    setMinSalary,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    selectedPost,
    setSelectedPost,
    selectedApp,
    setSelectedApp,
    isApplyOpen,
    setIsApplyOpen,
    applyMessage,
    setApplyMessage,
    applyProposedPrice,
    setApplyProposedPrice,
    handleApply,
    handleWithdraw,
    handleRespond,
    toast,
    setToast,
  } = useStaffRecruitment();

  const formatPrice = (price: number | string | null) => {
    if (!price) return "Thỏa thuận";
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: string }> = {
      pending: { label: "Chờ phản hồi", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-600 dark:text-amber-400", icon: "material-symbols:hourglass-empty-rounded" },
      confirmed: { label: "Chờ xác nhận của bạn", bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-600 dark:text-blue-400", icon: "material-symbols:priority-high-rounded" },
      paid: { label: "Đã thanh toán (Chờ làm)", bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-600 dark:text-emerald-450", icon: "material-symbols:check-circle-outline-rounded" },
      rejected: { label: "Bị từ chối", bg: "bg-rose-50 dark:bg-rose-955/20", text: "text-rose-600 dark:text-rose-400", icon: "material-symbols:block-outline-rounded" },
      withdrawn: { label: "Đã rút hồ sơ", bg: "bg-slate-105 dark:bg-slate-900/50", text: "text-slate-500 dark:text-slate-400", icon: "material-symbols:undo-rounded" },
      completed: { label: "Hoàn thành", bg: "bg-teal-50 dark:bg-teal-950/20", text: "text-teal-600 dark:text-teal-400", icon: "material-symbols:task-alt-rounded" },
    };

    const cfg = configs[status] || { label: status, bg: "bg-slate-50", text: "text-slate-600", icon: "material-symbols:help-outline" };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border border-current/10`}>
        <Icon icon={cfg.icon} className="text-sm shrink-0" />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full font-sans">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
            Kênh Tuyển Dụng & Việc Làm
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">
            Tìm kiếm các công việc tự do đăng từ khách hàng và gửi hồ sơ ứng tuyển trực tiếp.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === "browse"
                ? "bg-white dark:bg-slate-700 text-[#026E5F] dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Icon icon="material-symbols:search-find-outline-rounded" className="text-lg" />
            Tìm Việc Làm
          </button>
          <button
            onClick={() => setActiveTab("my-applications")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === "my-applications"
                ? "bg-white dark:bg-slate-700 text-[#026E5F] dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Icon icon="material-symbols:work-outline" className="text-lg" />
            Việc Đã Ứng Tuyển
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "browse" ? (
        <div className="space-y-6">
          {/* Filters Banner */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 text-lg">
                <Icon icon="material-symbols:search-rounded" />
              </span>
              <input
                type="text"
                placeholder="Tìm việc theo tên, từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-900/40 text-slate-805 dark:text-slate-100 placeholder-slate-450 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">Thành phố:</span>
                <input
                  type="text"
                  placeholder="Hồ Chí Minh, Hà Nội..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider shrink-0">Quận/Huyện:</span>
                <input
                  type="text"
                  placeholder="Quận 1, Bình Thạnh..."
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all"
                />
              </div>

              <button
                onClick={() => {
                  setCityFilter("");
                  setDistrictFilter("");
                  setMinSalary(undefined);
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-205"
              >
                Đặt lại
              </button>
            </div>
          </div>

          {/* Job posts List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 mt-4 font-medium">Đang tải danh sách công việc...</p>
            </div>
          ) : !jobPosts.length ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
              <Icon icon="material-symbols:work-off-outline" className="text-5xl text-slate-350 dark:text-slate-550 mb-3 animate-pulse" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Chưa có tin tuyển dụng phù hợp</h3>
              <p className="text-sm text-slate-450 dark:text-slate-500 mt-1 max-w-sm">Hiện tại không có tin đăng tuyển dụng nào trực tuyến trùng khớp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badge / Category */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-bold bg-[#026E5F]/10 text-[#026E5F] dark:bg-emerald-950/40 dark:text-emerald-400 uppercase">
                        <Icon icon="material-symbols:category-outline" />
                        Tìm giúp việc
                      </span>

                      {/* Title */}
                      <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg mt-3 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      {/* Salary */}
                      <div className="flex items-center gap-2 mt-4 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 w-fit">
                        <Icon icon="material-symbols:attach-money" className="text-emerald-600 text-lg" />
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          {formatPrice(post.salary)}
                        </span>
                      </div>

                      {/* Detail metadata list */}
                      <ul className="space-y-2 mt-4 text-xs text-slate-550 dark:text-slate-400">
                        <li className="flex items-start gap-2">
                          <Icon icon="material-symbols:location-on-outline" className="text-slate-400 text-base shrink-0 mt-0.5" />
                          <span className="line-clamp-2">Địa điểm: {post.address}, {post.district}, {post.city}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="material-symbols:alarm-outline" className="text-slate-400 text-base shrink-0" />
                          <span>Làm việc: {post.working_time || "N/A"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="material-symbols:hourglass-bottom-rounded" className="text-slate-400 text-base shrink-0" />
                          <span>Hạn nộp: {formatDate(post.expired_at)}</span>
                        </li>
                      </ul>

                      {/* Description preview */}
                      {post.description && (
                        <p className="text-xs text-slate-500 mt-4 line-clamp-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 leading-relaxed italic">
                          "{post.description}"
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-600 cursor-pointer text-center"
                      >
                        Chi Tiết
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsApplyOpen(true);
                        }}
                        className="flex-1 py-2.5 bg-[#026E5F] hover:bg-[#015C4F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                      >
                        Ứng Tuyển Ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        /* My Applications Tab */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 mt-4 font-medium">Đang tải hồ sơ của bạn...</p>
            </div>
          ) : !applications.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Icon icon="material-symbols:work-outline" className="text-5xl text-slate-350 dark:text-slate-550 mb-3" />
              <h3 className="font-bold text-slate-805 dark:text-slate-200 text-lg">Bạn chưa ứng tuyển công việc nào</h3>
              <p className="text-sm text-slate-450 dark:text-slate-500 mt-1 max-w-sm">Hãy chuyển sang tab "Tìm Việc Làm" để ứng tuyển vào các cơ hội phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-4xl">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-5">Công Việc</th>
                    <th className="py-4 px-5">Lương Đề Xuất</th>
                    <th className="py-4 px-5">Ngày Ứng Tuyển</th>
                    <th className="py-4 px-5">Trạng Thái</th>
                    <th className="py-4 px-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-850 dark:text-slate-100">{app.job_post?.title || `Công việc #${app.job_post_id}`}</div>
                        <div className="text-xs text-slate-450 dark:text-slate-500 mt-1 line-clamp-1">
                          {app.job_post?.address}, {app.job_post?.district}, {app.job_post?.city}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200">
                        {app.proposed_price ? formatPrice(app.proposed_price) : "Theo thỏa thuận gốc"}
                      </td>
                      <td className="py-4 px-5">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="py-4 px-5">
                        {renderStatusBadge(app.status)}
                      </td>
                      <td className="py-4 px-5 text-right flex items-center justify-end gap-2 h-14">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-105 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-655 dark:text-slate-200 text-xs font-bold rounded-lg transition-all border border-slate-200 dark:border-slate-600 cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        
                        {app.status === "pending" && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleWithdraw(app.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-bold rounded-lg transition-all border border-rose-100 dark:border-rose-900/35 cursor-pointer"
                          >
                            Rút hồ sơ
                          </button>
                        )}

                        {app.status === "confirmed" && (
                          <div className="flex gap-1.5">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRespond(app.id, "accept")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Nhận việc
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRespond(app.id, "reject")}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal for Job Post */}
      {selectedPost && !isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden my-8 text-left">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-2">
                  <Icon icon="material-symbols:work-outline" className="text-[#026E5F] dark:text-emerald-450" />
                  Chi Tiết Tin Tuyển Dụng
                </h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Icon icon="material-symbols:close-rounded" className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 leading-snug">{selectedPost.title}</h2>
                <div className="flex items-center gap-2 mt-3 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 w-fit">
                  <Icon icon="material-symbols:attach-money" className="text-emerald-600 text-lg" />
                  <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    Lương: {formatPrice(selectedPost.salary)}
                  </span>
                </div>
              </div>

              {/* Attributes Card */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Icon icon="material-symbols:location-on-outline" className="text-slate-450 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block text-xxs uppercase">Địa chỉ thực hiện</span>
                    <span className="text-slate-750 dark:text-slate-205">{selectedPost.address}, {selectedPost.district}, {selectedPost.city}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Icon icon="material-symbols:alarm-outline" className="text-slate-455 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block text-xxs uppercase">Giờ làm việc</span>
                    <span className="text-slate-750 dark:text-slate-205">{selectedPost.working_time || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Icon icon="material-symbols:hourglass-bottom-rounded" className="text-slate-455 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-400 block text-xxs uppercase">Hạn ứng tuyển</span>
                    <span className="text-slate-750 dark:text-slate-205">{formatDate(selectedPost.expired_at)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedPost.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mô tả chi tiết</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedPost.description}
                  </div>
                </div>
              )}

              {/* Associated Services */}
              {selectedPost.services && selectedPost.services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Yêu cầu dịch vụ</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.services.map((svc) => (
                      <span
                        key={svc.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <Icon icon="material-symbols:check-box-outline-blank-rounded" className="text-[#026E5F] dark:text-emerald-400" />
                        {svc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex gap-2 justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2.5 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsApplyOpen(true)}
                className="px-5 py-2.5 bg-[#026E5F] hover:bg-[#015C4F] text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                Ứng Tuyển Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Overlay Modal */}
      {isApplyOpen && selectedPost && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-150 dark:border-slate-700 overflow-hidden my-8 text-left">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-2">
                  <Icon icon="material-symbols:edit-document-outline" className="text-[#026E5F] dark:text-emerald-450" />
                  Nộp Hồ Sơ Ứng Tuyển
                </h3>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Icon icon="material-symbols:close-rounded" className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-4">
                <span className="block text-xxs font-bold text-slate-400 uppercase">Ứng tuyển cho công việc</span>
                <span className="font-bold text-slate-800 dark:text-slate-205">{selectedPost.title}</span>
              </div>

              {/* Proposed Price Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Đề xuất mức lương (VNĐ) <span className="text-slate-400 font-normal">(Nếu khác giá gốc: {formatPrice(selectedPost.salary)})</span></label>
                <input
                  type="number"
                  placeholder="Ví dụ: 150000"
                  value={applyProposedPrice || ""}
                  onChange={(e) => setApplyProposedPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/40 text-slate-805 dark:text-slate-100 placeholder-slate-450 text-sm px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-705 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Lời nhắn tới khách hàng</label>
                <textarea
                  placeholder="Viết lời nhắn ngắn gọn giới thiệu kinh nghiệm làm việc của bạn..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/40 text-slate-805 dark:text-slate-100 placeholder-slate-455 text-sm px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-705 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-105 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex gap-2 justify-end">
              <button
                disabled={actionLoading}
                onClick={() => setIsApplyOpen(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Hủy
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleApply(selectedPost.id)}
                className="px-5 py-2.5 bg-[#026E5F] hover:bg-[#015C4F] text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Xác nhận ứng tuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Submitted Application */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden my-8 text-left">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-lg flex items-center gap-2">
                  <Icon icon="material-symbols:info-outline" className="text-[#026E5F] dark:text-emerald-450" />
                  Chi Tiết Hồ Sơ Ứng Tuyển
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Icon icon="material-symbols:close-rounded" className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Application Details */}
              <div className="space-y-4">
                <div>
                  <span className="block text-xxs font-bold text-slate-400 uppercase mb-1">Công việc tuyển dụng</span>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-snug">
                    {selectedApp.job_post?.title || `Công việc #${selectedApp.job_post_id}`}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xxs font-bold text-slate-400 uppercase mb-1">Lương đề xuất</span>
                    <span className="text-sm font-bold text-[#026E5F] dark:text-emerald-400">
                      {selectedApp.proposed_price ? formatPrice(selectedApp.proposed_price) : "Theo thỏa thuận gốc"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xxs font-bold text-slate-400 uppercase mb-1">Ngày nộp</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(selectedApp.created_at)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xxs font-bold text-slate-400 uppercase mb-1">Trạng thái</span>
                  <div>{renderStatusBadge(selectedApp.status)}</div>
                </div>

                {selectedApp.message && (
                  <div>
                    <span className="block text-xxs font-bold text-slate-400 uppercase mb-1">Lời nhắn của bạn</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/50 text-sm text-slate-655 dark:text-slate-305 italic">
                      "{selectedApp.message}"
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Prompt if Confirmed */}
              {selectedApp.status === "confirmed" && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-sm space-y-2">
                  <div className="font-bold text-blue-650 dark:text-blue-400 flex items-center gap-1.5">
                    <Icon icon="material-symbols:priority-high-rounded" />
                    Khách hàng đã lựa chọn bạn!
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Vui lòng xác nhận sự sẵn sàng của bạn để bắt đầu làm việc. Nếu đồng ý, hệ thống sẽ xác nhận lịch trình. Nếu từ chối, công việc sẽ được trả lại cho các ứng viên khác.
                  </p>
                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespond(selectedApp.id, "reject")}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespond(selectedApp.id, "accept")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Đồng ý nhận việc
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
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
