import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useRecruitment, SALARY_OPTS, URGENCY_OPTS } from "./useHook";
import { Pagination } from "../../components/Pagination";
import { formatDateTime } from "../../utils";

import { Link } from "react-router-dom";

export const Recruitment = () => {
  const { t } = useTranslation();
  const {
    jobs,
    totalItems,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedCategories,
    setSelectedCategories,
    selectedSalary,
    setSelectedSalary,
    selectedUrgency,
    setSelectedUrgency,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    clearFilters,
    categories,
    isLoading,
    
    
    applyJob,
    appliedJobIds } = useRecruitment();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const isHelper = currentUser?.role_id === 3;
  const isCustomer = currentUser?.role_id === 4;

  const renderSidebarFilter = () => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm sticky top-24 flex flex-col divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-sm">
            <Icon icon="material-symbols:tune" className="text-lg text-[#026E5F] dark:text-teal-400" />
            {t("Bộ lọc")}
          </span>
          <button onClick={clearFilters} className="text-xs font-semibold text-[#026E5F] dark:text-teal-400 hover:underline cursor-pointer">
            {t("Xóa tất cả")}
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2.5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{t("Loại công việc")}</p>
          {categories.length > 0 ? (
            <select
              value={selectedCategories[0] || "all"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setSelectedCategories([]);
                } else if (val === "other") {
                  setSelectedCategories(["other"]);
                } else {
                  setSelectedCategories([Number(val)]);
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all cursor-pointer font-medium"
            >
              <option value="all">{t("Tất cả")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.name)}
                </option>
              ))}
              <option value="other">{t("Khác")}</option>
            </select>
          ) : (
            <p className="text-xs text-gray-400 italic">{t("Đang tải danh mục...")}</p>
          )}
        </div>

        <div className="px-5 py-4 flex flex-col gap-2.5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{t("Mức lương")}</p>
          {SALARY_OPTS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="salary"
                checked={selectedSalary === opt.value}
                onChange={() => setSelectedSalary(opt.value)}
                className="rounded-full border-slate-300 dark:border-slate-650 text-[#026E5F] focus:ring-[#026E5F] dark:bg-slate-900 cursor-pointer h-4 w-4 accent-[#026E5F]"
              />
              <span
                className={`text-sm group-hover:text-[#026E5F] dark:group-hover:text-teal-400 transition-colors font-medium ${
                  selectedSalary === opt.value ? "text-[#026E5F] dark:text-teal-400 font-bold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {t(opt.label)}
              </span>
            </label>
          ))}
        </div>

        {/* Urgency */}
        <div className="px-5 py-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{t("Độ khẩn cấp")}</p>
          <div className="flex flex-wrap gap-2">
            {URGENCY_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedUrgency(opt.value)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  selectedUrgency === opt.value
                    ? "border-[#026E5F] bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#026E5F] hover:text-[#026E5F]"
                }`}
              >
                {t(opt.label)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 3. RENDER JOB CARD
  const renderJobCard = (job: any) => {
    return (
      <article
        key={job.id}
        className="relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#026E5F] dark:hover:border-[#026E5F]/50 transition-all duration-300 group"
      >
        <div className="flex flex-col grow p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 ${job.categoryColor}`}
            >
              <Icon icon={job.categoryIcon} className="text-sm" />
              {t(job.category)}
            </span>
            {job.isUrgent && (
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 animate-pulse">
                <Icon icon="material-symbols:bolt" className="text-sm" />
                {t("Cần gấp")}
              </span>
            )}
          </div>

          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug mb-2 line-clamp-2 group-hover:text-[#026E5F] dark:group-hover:text-teal-400 transition-colors">
            {job.title}
          </h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 grow">{job.description}</p>

          {job.services && job.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {job.services.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded"
                >
                  {srv}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 mb-5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#026E5F] dark:text-teal-400">
              <Icon icon="material-symbols:payments-outline" className="text-[#026E5F] dark:text-teal-400 text-base shrink-0" />
              {job.salary}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-650 dark:text-slate-400">
              <Icon icon="material-symbols:location-on-outline" className="text-base shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            {job.workingTime && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 col-span-2">
                <Icon icon="material-symbols:calendar-month-outline" className="text-base shrink-0 text-[#026E5F] dark:text-teal-400" />
                <span className="truncate">
                  {t("Lịch làm việc")}: {job.workingTime}
                </span>
              </div>
            )}
            {job.expirationDate && (
              <div className="flex items-center gap-1.5 text-xs col-span-2 font-semibold text-rose-600 dark:text-rose-400">
                <Icon icon="material-symbols:event-busy-outline" className="text-base shrink-0" />
                <span>
                  {t("Hết hạn")}: {formatDateTime(job.expirationDate)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Icon icon="material-symbols:schedule-outline" className="text-base shrink-0" />
              {job.postedTime}
            </div>
            {job.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <Icon icon="material-symbols:calendar-add-on-outline" className="text-base shrink-0" />
                <span>{formatDateTime(job.createdAt)?.split(" ")[1] ?? ""}</span>
              </div>
            )}
          </div>

          {isHelper ? (
            appliedJobIds.includes(job.id) ? (
              <button
                disabled
                className="mt-auto w-full py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed select-none"
              >
                {t("Đã Ứng Tuyển")}
              </button>
            ) : (
              <button
                onClick={() => applyJob(job.id)}
                className="mt-auto w-full py-2.5 bg-[#026E5F] hover:bg-[#01564a] active:scale-95 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-teal-600/10 transition-all cursor-pointer"
              >
                {t("Ứng Tuyển Ngay")}
              </button>
            )
          ) : currentUser ? (
            <div className="mt-auto w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-sm font-semibold rounded-xl text-center select-none">
              {t("Chỉ người giúp việc mới được ứng tuyển")}
            </div>
          ) : (
            <Link
              to="/dang-nhap"
              className="mt-auto w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer text-center block"
            >
              {t("Đăng nhập để ứng tuyển")}
            </Link>
          )}
        </div>
      </article>
    );
  };

  // 4. RENDER JOB LIST PANEL
  const renderJobListPanel = () => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 px-5 py-3.5 shadow-sm">
        <div className="relative grow max-w-sm">
          <Icon icon="material-symbols:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Tìm kiếm công việc...")}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#026E5F] focus:ring-1 focus:ring-[#026E5F] transition"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block font-medium">
            {totalItems} {t("kết quả")}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold text-slate-700 dark:text-slate-350 cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-[#026E5F] transition"
          >
            <option value="Mới nhất">{t("Mới nhất")}</option>
            <option value="Lương cao nhất">{t("Lương cao nhất")}</option>
            <option value="Cần gấp nhất">{t("Cần gấp nhất")}</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-[#026E5F]" />
          <p className="text-sm text-gray-500">{t("Đang tải dữ liệu tuyển dụng...")}</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{jobs.map((job) => renderJobCard(job))}</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-12 text-center shadow-sm">
          <Icon icon="material-symbols:search-off" className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">{t("Không tìm thấy kết quả phù hợp")}</h3>
          <p className="text-sm text-slate-400 mt-1">{t("Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.")}</p>
        </div>
      )}
      {!isLoading && totalItems > 0 && <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />}
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-8">
      {/* Title Header */}
      <div className="text-left mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t("Sàn Tuyển Dụng Việc Làm")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("Kết nối người giúp việc uy tín và khách hàng nhanh chóng.")}</p>
        </div>
        {isCustomer && (
          <Link
            to="/dang-bai-tuyen"
            className="px-5 py-2.5 bg-[#026E5F] text-white font-bold rounded-xl shadow-sm hover:bg-[#01564a] active:scale-95 transition flex items-center gap-2 self-start"
          >
            <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
            {t("Đăng bài tuyển dụng")}
          </Link>
        )}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mt-2">
        <aside className="lg:col-span-3">{renderSidebarFilter()}</aside>
        <main className="lg:col-span-9">{renderJobListPanel()}</main>
      </div>

      
    </div>
  );
};

export default Recruitment;
