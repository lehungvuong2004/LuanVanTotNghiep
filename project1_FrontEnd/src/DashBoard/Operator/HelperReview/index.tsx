import { Icon } from "@iconify/react";
import { useHelperReview } from "./useHook";
import { Pagination } from "../../../components/Pagination";

import { getInitials } from "../../../utils";

export const HelperReview = () => {
  const {
    helpers,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
    stats,
    selectedHelper,
    isDetailModalOpen,
    openDetailModal,
    closeDetailModal,
    isVerifyModalOpen,
    openVerifyModal,
    closeVerifyModal,
    verifyStatus,
    verifyNote,
    setVerifyNote,
    handleVerifyHelper,
    isStatusModalOpen,
    openStatusModal,
    closeStatusModal,
    newStatus,
    setNewStatus,
    statusReason,
    setStatusReason,
    handleSaveStatus,
  } = useHelperReview();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Hoạt động
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ duyệt
          </span>
        );
      case "suspended":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 border border-slate-200 dark:border-slate-700/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-450"></span>
            Tạm ngưng
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Từ chối
          </span>
        );
    }
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Icon icon="material-symbols:how-to-reg-rounded" className="text-[#026E5F] text-3xl" />
          Kiểm Duyệt Hồ Sơ & Dịch Vụ
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Duyệt danh sách người giúp việc đăng ký, thẩm định kỹ năng chuyên môn trước khi hiển thị cho Khách hàng đặt lịch.</p>
      </div>
    </div>
  );

  const renderKPIs = () => {
    const totalCount = stats?.total || 0;
    const pendingCount = stats?.pending || 0;
    const activeCount = stats?.active || 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Tổng số thợ</p>
            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:engineering-outline" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between ring-2 ring-amber-500/20">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Hồ sơ chờ xét duyệt</p>
            <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-450">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl animate-pulse">
            <Icon icon="material-symbols:pending-actions" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-450">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
            <Icon icon="material-symbols:check-circle-outline-rounded" />
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md w-full">
        <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        <input
          type="text"
          placeholder="Tìm kiếm theo họ tên, email, sđt helper..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/35 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider shrink-0">Bộ lọc:</label>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
          {["Pending", "Active", "Suspended", "Rejected", "All"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === status
                  ? "bg-white dark:bg-slate-800 text-[#026E5F] dark:text-[#52c1b2] shadow-xs"
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {status === "All" ? "Tất Cả" : status === "Pending" ? "Chờ Duyệt" : status === "Active" ? "Hoạt Động" : status === "Suspended" ? "Tạm Ngưng" : "Từ Chối"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="w-12 h-12 border-4 border-[#026E5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải danh sách người giúp việc...</p>
        </div>
      );
    }

    if (helpers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 text-4xl mb-4">
            <Icon icon="material-symbols:sentiment-dissatisfied-outline" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy đối tác nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Không có dữ liệu phù hợp với trạng thái hoặc từ khóa tìm kiếm này.</p>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-4xl">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-700 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-5">Người Giúp Việc</th>
                <th className="py-3 px-5">Số Điện Thoại</th>
                <th className="py-3 px-5">Kinh Nghiệm</th>
                <th className="py-3 px-5">Đánh Giá</th>
                <th className="py-3 px-5">Trạng Thái Hồ Sơ</th>
                <th className="py-3 px-5">Ngày Sinh</th>
                <th className="py-3 px-5 text-right">Kiểm Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
              {helpers.map((helper) => {
                const name = helper.user?.full_name || "N/A";
                const email = helper.user?.email || "Chưa thiết lập";
                const phone = helper.user?.phone || "Chưa thiết lập";

                return (
                  <tr key={helper.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {helper.user?.avatar ? (
                          <img src={helper.user.avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#026E5F]/10 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] font-bold text-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            {getInitials(name)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{name}</h4>
                          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">{email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      <span className="font-medium text-slate-655 dark:text-slate-350">{phone}</span>
                    </td>

                    <td className="py-3 px-5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{helper.experience_year} năm</span>
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        <Icon icon="material-symbols:star-rounded" className="text-amber-500 text-base" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">{Number(helper.rating_avg || 0).toFixed(1)}</span>
                        <span className="text-xs text-slate-450 dark:text-slate-500">({helper.total_reviews} đánh giá)</span>
                      </div>
                    </td>

                    <td className="py-3 px-5">{getStatusBadge(helper.status)}</td>

                    <td className="py-3 px-5 text-xs text-slate-550 dark:text-slate-400">
                      {helper.birthday
                        ? new Date(helper.birthday).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailModal(helper.id)}
                          className="p-2 rounded-xl text-slate-550 hover:text-[#026E5F] hover:bg-teal-50 dark:text-slate-400 dark:hover:text-[#52c1b2] dark:hover:bg-teal-950/30 transition-all cursor-pointer"
                          title="Thẩm định hồ sơ & bộ kỹ năng"
                        >
                          <Icon icon="material-symbols:folder-open-outline" className="text-lg" />
                        </button>

                        {(helper.status === "pending" || helper.status === "rejected") && (
                          <button
                            onClick={() => openVerifyModal(helper, "approved")}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                            title="Phê duyệt hồ sơ"
                          >
                            <Icon icon="material-symbols:check-circle-outline" className="text-lg" />
                          </button>
                        )}

                        {(helper.status === "pending" || helper.status === "active") && (
                          <button
                            onClick={() => openVerifyModal(helper, "rejected")}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                            title="Từ chối hồ sơ"
                          >
                            <Icon icon="material-symbols:cancel-outline" className="text-lg" />
                          </button>
                        )}

                        <button
                          onClick={() => openStatusModal(helper)}
                          className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 transition-all cursor-pointer"
                          title="Tạm ngưng/Mở khóa hoạt động"
                        >
                          <Icon icon="material-symbols:shield-lock-outline-rounded" className="text-lg" />
                        </button>
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
    if (!isDetailModalOpen || !selectedHelper) return null;

    const name = selectedHelper.user?.full_name || "N/A";
    const email = selectedHelper.user?.email || "Chưa thiết lập";
    const phone = selectedHelper.user?.phone || "Chưa thiết lập";
    const accountStatus = selectedHelper.user?.status || "active";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeDetailModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-5/6">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Icon icon="material-symbols:contact-page-outline-rounded" className="text-[#026E5F] text-xl" />
              Thẩm Định Hồ Sơ Đối Tác
            </h3>
            <button onClick={closeDetailModal} className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-250 cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-700/80">
              {selectedHelper.user?.avatar ? (
                <img src={selectedHelper.user.avatar} alt={name} className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#026E5F]/15 dark:bg-[#026E5F]/20 text-[#026E5F] dark:text-[#52c1b2] font-bold text-xl flex items-center justify-center border border-slate-200">
                  {getInitials(name)}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{name}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
                  {email} | {phone}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-xxs px-2 py-0.5 font-bold rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    ID Tài khoản: {selectedHelper.user_id}
                  </span>
                  <span className="text-xxs px-2 py-0.5 font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                    ID Hồ sơ: {selectedHelper.id}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-center sm:items-end">
                <span className="text-xxs text-slate-400 dark:text-slate-500 uppercase font-semibold">Tài khoản</span>
                <span
                  className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${accountStatus === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                >
                  {accountStatus === "active" ? "Active" : "Locked"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700/80 rounded-xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-[#52c1b2] flex items-center justify-center text-lg shrink-0">
                  <Icon icon="material-symbols:history-edu-outline-rounded" />
                </div>
                <div>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Kinh nghiệm</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedHelper.experience_year} năm</p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700/80 rounded-xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-lg shrink-0">
                  <Icon icon="material-symbols:star-rounded" />
                </div>
                <div>
                  <p className="text-xxs text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Đánh giá chung</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{Number(selectedHelper.rating_avg || 0).toFixed(1)} ★</p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700/80 rounded-xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg shrink-0">
                  <Icon icon="material-symbols:person-play-outline-rounded" />
                </div>
                <div>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Trạng thái hồ sơ</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">{selectedHelper.status}</p>
                </div>
              </div>
            </div>

            {selectedHelper.bio && (
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô tả giới thiệu bản thân (Bio)</h5>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-700/80 text-sm italic text-slate-655 dark:text-slate-300 leading-relaxed">
                  "{selectedHelper.bio}"
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bộ Kỹ Năng / Dịch Vụ Đăng Ký ({selectedHelper.skills?.length || 0})</h5>
              <div className="flex flex-wrap gap-2">
                {selectedHelper.skills && selectedHelper.skills.length > 0 ? (
                  selectedHelper.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/50 dark:bg-teal-950/20 text-[#026E5F] dark:text-[#52c1b2] rounded-xl text-xs font-bold border border-teal-100 dark:border-teal-900/30 shadow-xs"
                    >
                      <Icon icon="material-symbols:check-circle-rounded" className="text-sm shrink-0" />
                      {skill.service?.name} (Từ {skill.service?.base_price.toLocaleString("vi-VN")}đ)
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-slate-400 dark:text-slate-600">Chưa khai báo kỹ năng dịch vụ nào</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khu Vực Đăng Ký Hoạt Động ({selectedHelper.workingAreas?.length || 0})</h5>
              <div className="flex flex-wrap gap-2">
                {selectedHelper.workingAreas && selectedHelper.workingAreas.length > 0 ? (
                  selectedHelper.workingAreas.map((area) => (
                    <span
                      key={area.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900/30 shadow-xs"
                    >
                      <Icon icon="material-symbols:location-on-outline" className="text-sm shrink-0" />
                      {area.district}, {area.city}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-slate-400 dark:text-slate-600">Chưa đăng ký khu vực làm việc</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lịch Sử Kiểm Duyệt Của Nhân Viên</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedHelper.verifications && selectedHelper.verifications.length > 0 ? (
                  selectedHelper.verifications.map((v) => (
                    <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-900/35 rounded-xl border border-slate-200/50 dark:border-slate-700 flex items-center justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                              v.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : v.status === "rejected" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {v.status === "approved" ? "Đã duyệt" : v.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                          </span>
                          <span className="text-slate-450 dark:text-slate-500 font-semibold">{new Date(v.created_at).toLocaleString("vi-VN")}</span>
                        </div>
                        {v.note && <p className="text-slate-600 dark:text-slate-350 mt-1 italic font-medium">Lý do/Ghi chú: {v.note}</p>}
                      </div>
                      {v.admin_id && <span className="text-xxs font-bold text-slate-400 dark:text-slate-500">ID Nhân viên: {v.admin_id}</span>}
                    </div>
                  ))
                ) : (
                  <div className="text-xs italic text-slate-400 dark:text-slate-600">Chưa có lịch sử kiểm duyệt nào</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3">
            <button
              onClick={closeDetailModal}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Đóng lại
            </button>
            {selectedHelper.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    closeDetailModal();
                    openVerifyModal(selectedHelper, "rejected");
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => {
                    closeDetailModal();
                    openVerifyModal(selectedHelper, "approved");
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Phê duyệt
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVerifyModal = () => {
    if (!isVerifyModalOpen || !selectedHelper) return null;

    const name = selectedHelper.user?.full_name || "GV";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeVerifyModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Icon
                icon={verifyStatus === "approved" ? "material-symbols:check-circle-outline" : "material-symbols:cancel-outline"}
                className={verifyStatus === "approved" ? "text-emerald-500" : "text-rose-500"}
              />
              Xác Nhận Kiểm Duyệt Hồ Sơ
            </h3>
            <button onClick={closeVerifyModal} className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-255 cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm font-semibold text-slate-655 dark:text-slate-300">
              Bạn có chắc chắn muốn <span className="font-extrabold">{verifyStatus === "approved" ? "PHÊ DUYỆT" : "TỪ CHỐI"}</span> hồ sơ đăng ký dịch vụ của thợ giúp việc{" "}
              <span className="text-[#026E5F] font-extrabold">"{name}"</span>?
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Lý do / Phản hồi của nhân viên</label>
              <textarea
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder="Nhập phản hồi gửi đến thợ (lý do từ chối hoặc lời chúc duyệt thành công)..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all resize-none text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 mt-4">
              <button
                onClick={closeVerifyModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
              >
                Hủy
              </button>
              <button
                onClick={handleVerifyHelper}
                className={`flex items-center justify-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md active:scale-98 transition-all cursor-pointer ${
                  verifyStatus === "approved" ? "bg-emerald-600 hover:bg-emerald-700 animate-pulse" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusModal = () => {
    if (!isStatusModalOpen || !selectedHelper) return null;

    const name = selectedHelper.user?.full_name || "GV";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeStatusModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Icon icon="material-symbols:shield-lock-outline-rounded" className="text-amber-500" />
              Đổi Trạng Thái Đối Tác
            </h3>
            <button onClick={closeStatusModal} className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-250 cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đang thay đổi quyền hoạt động của: <span className="font-extrabold text-[#026E5F]">{name}</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setNewStatus("active")}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                  newStatus === "active"
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-655"
                }`}
              >
                <Icon icon="material-symbols:check-circle-outline-rounded" className="text-xl" />
                <span className="text-xs font-bold mt-1">Hoạt động (Active)</span>
              </div>

              <div
                onClick={() => setNewStatus("suspended")}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center select-none ${
                  newStatus === "suspended"
                    ? "border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-850 dark:text-slate-200"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-655"
                }`}
              >
                <Icon icon="material-symbols:block-rounded" className="text-xl" />
                <span className="text-xs font-bold mt-1">Tạm ngưng (Suspended)</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Lý do thay đổi</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Nhập lý do thay đổi trạng thái..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden focus:border-blue-500 transition-all resize-none text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 mt-4">
              <button
                onClick={closeStatusModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveStatus}
                className="flex items-center justify-center gap-2 bg-[#026E5F] hover:bg-[#025a4e] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md active:scale-98 transition-all cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
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
      {renderTable()}
      {renderDetailModal()}
      {renderVerifyModal()}
      {renderStatusModal()}
    </div>
  );
};
