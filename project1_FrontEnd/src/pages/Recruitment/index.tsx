import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import {
  useRecruitment,
  CATEGORIES,
  SALARY_OPTS,
  URGENCY_OPTS,
  CATEGORY_META,
} from "./useHook";
// JobItem,
import type {  HeroProps, SidebarProps, JobListProps, JobCardProps } from "./useHook";



/* ─────────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────────── */
const HeroSection = ({ t }: HeroProps) => (
  <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-900 dark:via-teal-800 dark:to-emerald-900 text-white pt-12 pb-16 px-6 md:px-14 shadow-xl">
    {/* decorative blobs */}
    <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-emerald-400/10 blur-2xl" />

    <div className="relative z-10 max-w-2xl">
      <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
        <Icon icon="material-symbols:work-outline" className="text-sm" />
        {t("Cơ hội nghề nghiệp")}
      </span>
      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
        {t("Gia Nhập Đội Ngũ")}<br />
        <span className="text-emerald-200">{t("Gia Đình Việt")}</span>
      </h1>
      <p className="text-base text-teal-100/90 max-w-lg leading-relaxed">
        {t("Tìm kiếm công việc giúp việc, trông trẻ, chăm sóc người già phù hợp với năng lực của bạn từ các gia đình uy tín nhất.")}
      </p>
    </div>

    <div className="relative z-10 mt-10 flex flex-wrap gap-6">
      {[
        { icon: "material-symbols:work-outline",   label: "Việc mới mỗi ngày",  value: "50+" },
        { icon: "material-symbols:group-outline",  label: "Ứng viên đã khớp",   value: "2,400+" },
        { icon: "material-symbols:thumb-up-outline", label: "Tỷ lệ hài lòng",  value: "97%" },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/15">
          <Icon icon={s.icon} className="text-2xl text-emerald-200 shrink-0" />
          <div>
            <div className="text-xl font-extrabold leading-none">{s.value}</div>
            <div className="text-xs text-teal-100/80 mt-0.5">{t(s.label)}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
const SidebarFilter = ({ t }: SidebarProps) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm sticky top-24 flex flex-col divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4">
      <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-sm">
        <Icon icon="material-symbols:tune" className="text-lg text-teal-600" />
        {t("Bộ lọc")}
      </span>
      <button className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">
        {t("Xóa tất cả")}
      </button>
    </div>

    {/* Category */}
    <div className="px-5 py-4 flex flex-col gap-2.5">
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{t("Loại công việc")}</p>
      {CATEGORIES.map((cat, index) => (
        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            defaultChecked={index === 0}
            className="rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 dark:bg-slate-900 cursor-pointer"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-medium">
            {t(cat)}
          </span>
        </label>
      ))}
    </div>

    {/* Salary */}
    <div className="px-5 py-4 flex flex-col gap-2.5">
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{t("Mức lương")}</p>
      {SALARY_OPTS.map((opt, index) => (
        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="salary"
            defaultChecked={index === 0}
            className="rounded-full border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 dark:bg-slate-900 cursor-pointer"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-medium">
            {t(opt.label)}
          </span>
        </label>
      ))}
    </div>

    {/* Urgency */}
    <div className="px-5 py-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{t("Độ khẩn cấp")}</p>
      <div className="flex flex-wrap gap-2">
        {URGENCY_OPTS.map((opt, index) => (
          <button
            key={opt.value}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              index === 0
                ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-500 hover:text-teal-600"
            }`}
          >
            {t(opt.label)}
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   JOB CARD
───────────────────────────────────────────────────────────── */
const JobCard = ({ t, job }: JobCardProps) => {
  const meta = CATEGORY_META[job.category] ?? { icon: "material-symbols:work-outline", color: "text-teal-500" };
  return (
    <article className="relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* top accent stripe */}
      <div className="h-1 w-full bg-linear-to-r from-teal-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col flex-grow p-6">
        {/* badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 ${meta.color}`}>
            <Icon icon={meta.icon} className="text-sm" />
            {t(job.category)}
          </span>
          {job.isUrgent && (
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <Icon icon="material-symbols:bolt" className="text-sm" />
              {t("Cần gấp")}
            </span>
          )}
        </div>

        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {job.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-5 flex-grow">
          {job.description}
        </p>

        {/* meta info */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Icon icon="material-symbols:payments-outline" className="text-teal-500 text-base shrink-0" />
            {job.salary}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Icon icon="material-symbols:location-on-outline" className="text-base shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 col-span-2">
            <Icon icon="material-symbols:schedule-outline" className="text-base shrink-0" />
            {job.postedTime}
          </div>
        </div>

        {/* CTA */}
        <button className="mt-auto w-full py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer">
          {t("Ứng Tuyển Ngay")}
        </button>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────
   JOB LIST PANEL  (toolbar + grid + empty state)
───────────────────────────────────────────────────────────── */
const JobListPanel = ({ t, jobs }: JobListProps) => (
  <div className="flex flex-col gap-5">
    {/* toolbar */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 px-5 py-3.5 shadow-sm">
      <div className="relative flex-grow max-w-sm">
        <Icon icon="material-symbols:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        <input
          type="text"
          placeholder={t("Tìm kiếm công việc...")}
          className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
        />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
          {jobs.length} {t("kết quả")}
        </span>
        <select className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition">
          <option value="Mới nhất">{t("Mới nhất")}</option>
          <option value="Lương cao nhất">{t("Lương cao nhất")}</option>
          <option value="Cần gấp nhất">{t("Cần gấp nhất")}</option>
        </select>
      </div>
    </div>

    {/* grid */}
    {jobs.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => (
          <JobCard key={job.id} t={t} job={job} />
        ))}
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────────────────────── */
export const Recruitment = () => {
  const { t } = useTranslation();
  const { jobs } = useRecruitment();

  return (
    <div className="min-h-screen dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-8">
      {/* hero */}
      <HeroSection t={t} />

      {/* two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mt-8">
        <aside className="lg:col-span-3">
          <SidebarFilter t={t} />
        </aside>

        <main className="lg:col-span-9">
          <JobListPanel t={t} jobs={jobs} />
        </main>
      </div>
    </div>
  );
};

export default Recruitment;