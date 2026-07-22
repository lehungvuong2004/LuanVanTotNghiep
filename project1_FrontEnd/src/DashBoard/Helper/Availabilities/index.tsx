import { Icon } from "@iconify/react";
import { useHelperAvailability, toDateStr, isSlotPast } from "./useHook";

// All 24 hours displayed in the timeline
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
// Preset quick-select hours for bulk scheduling
const BULK_PRESETS = ["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

export const HelperAvailabilityPage = () => {
  const {
    today,
    slots,
    loading,
    actionLoading,
    weekDays,
    slotMap,
    bulkStartDate,
    setBulkStartDate,
    bulkEndDate,
    setBulkEndDate,
    bulkDays,
    setBulkDays,
    bulkTimes,
    setBulkTimes,
    bulkSubmitting,
    activePanel,
    setActivePanel,
    bulkMode,
    setBulkMode,
    statsThisWeek,
    totalAvailable,
    weekLabel,
    todayStr,
    prevWeek,
    nextWeek,
    goToday,
    handleToggle,
    handleBulkApply,
  } = useHelperAvailability();

  const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const PERIODS = [
    { label: "🌅 Sáng sớm", range: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00"] },
    { label: "☀️ Buổi sáng", range: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"] },
    { label: "🌤️ Buổi chiều", range: ["12:00", "13:00", "14:00", "15:05", "16:00", "17:00"] },
    { label: "🌙 Buổi tối", range: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"] },
  ];

  // ── Render cell component ───────────────────────────────────────────────
  const renderCell = (dateStr: string, hour: string) => {
    const key = `${dateStr}|${hour}`;
    const slot = slotMap.get(key);
    const past = isSlotPast(dateStr, hour);
    const isLoading = actionLoading === key;

    if (past) {
      return (
        <div
          key={key}
          className="h-10 rounded-xl flex items-center justify-center text-xs font-bold text-slate-300 dark:text-slate-700 bg-transparent select-none"
        >
          —
        </div>
      );
    }

    if (!slot) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => handleToggle(dateStr, hour)}
          disabled={isLoading}
          title="Bấm để mở ca rảnh này"
          className="h-10 rounded-xl border border-dashed border-slate-200 dark:border-slate-705 hover:border-teal-500 hover:bg-teal-50/60 dark:hover:bg-teal-950/20 transition-all cursor-pointer flex items-center justify-center group"
        >
          {isLoading ? (
            <Icon icon="line-md:loading-twotone-loop" className="text-sm text-teal-600" />
          ) : (
            <Icon icon="material-symbols:add" className="text-lg text-slate-400 dark:text-slate-650 group-hover:text-teal-600 transition-colors" />
          )}
        </button>
      );
    }

    if (slot.status === "booked") {
      return (
        <div
          key={key}
          title="Đã có khách đặt – không thể hủy"
          className="h-10 rounded-xl bg-rose-100 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-840 flex items-center justify-center"
        >
          <Icon icon="material-symbols:lock-outline" className="text-sm text-rose-650 dark:text-rose-400 animate-pulse" />
        </div>
      );
    }

    // Available slot
    return (
      <button
        key={key}
        type="button"
        onClick={() => handleToggle(dateStr, hour)}
        disabled={isLoading}
        title="Đang rảnh – Bấm để hủy ca"
        className="h-10 rounded-xl bg-teal-600 hover:bg-rose-600 border border-teal-650 hover:border-rose-650 transition-all cursor-pointer flex items-center justify-center group"
      >
        {isLoading ? (
          <Icon icon="line-md:loading-twotone-loop" className="text-sm text-white" />
        ) : (
          <>
            <Icon icon="material-symbols:check-rounded" className="text-base text-white group-hover:hidden" />
            <Icon icon="material-symbols:close-rounded" className="text-base text-white hidden group-hover:block" />
          </>
        )}
      </button>
    );
  };

  // ── Render Header Section (Uses CSS Grid layout) ───────────────────────────
  const renderHeader = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start xl:items-center justify-between pb-2">
      <div className="xl:col-span-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <span className="p-3 bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-2xl">
            <Icon icon="material-symbols:calendar-month" className="text-2xl" />
          </span>
          Lịch rảnh của tôi
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-1 ml-16">
          Bấm vào ô giờ để <strong className="text-teal-600">mở ca rảnh</strong> (xanh) hoặc <strong className="text-rose-500">đóng ca</strong> đã mở.
        </p>
      </div>

      <div className="xl:col-span-6 flex flex-wrap xl:justify-end gap-3 ml-16 xl:ml-0">
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl shadow-xs text-base font-bold">
          <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">Tuần này:</span>
          <span className="text-teal-600 dark:text-teal-400">{statsThisWeek.available} rảnh</span>
          {statsThisWeek.booked > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span className="text-rose-600 dark:text-rose-455 font-bold">{statsThisWeek.booked} đặt</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl shadow-xs text-base">
          <Icon icon="material-symbols:event-available-outline" className="text-teal-600 dark:text-teal-400 text-lg" />
          <span className="font-extrabold text-teal-700 dark:text-teal-400">{totalAvailable}</span>
          <span className="text-slate-550 dark:text-slate-400 font-semibold">tổng ca rảnh</span>
        </div>
      </div>
    </div>
  );

  // ── Render Tabs (Grid interface) ──────────────────────────────────────────
  const renderTabs = () => (
    <div className="inline-grid grid-cols-2 gap-2 bg-white dark:bg-slate-800 border border-slate-220 dark:border-slate-700 p-1.5 rounded-xl shadow-xs w-full sm:w-fit">
      <button
        type="button"
        onClick={() => setActivePanel("week")}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-base font-extrabold transition-all cursor-pointer ${
          activePanel === "week"
            ? "bg-teal-600 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        }`}
      >
        <Icon icon="material-symbols:calendar-view-week-outline" className="text-lg" />
        Lịch theo tuần
      </button>
      <button
        type="button"
        onClick={() => setActivePanel("bulk")}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-base font-extrabold transition-all cursor-pointer ${
          activePanel === "bulk"
            ? "bg-teal-600 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
        }`}
      >
        <Icon icon="material-symbols:electric-bolt" className="text-lg" />
        Mở lịch hàng loạt
      </button>
    </div>
  );

  // ── Render Week Panel (CSS Grid aligned) ───────────────────────────────────
  const renderWeekPanel = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
      {/* Week navigation (Grid aligned for responsive safety) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevWeek}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all"
          >
            <Icon icon="material-symbols:chevron-left-rounded" className="text-xl text-slate-600" />
          </button>
          <button
            type="button"
            onClick={nextWeek}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all"
          >
            <Icon icon="material-symbols:chevron-right-rounded" className="text-xl text-slate-600" />
          </button>
          <span className="text-base font-extrabold text-slate-700 dark:text-slate-200 ml-1">{weekLabel}</span>
        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-5">
          {/* Legends */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-teal-600 border border-teal-600 inline-flex items-center justify-center">
                <Icon icon="material-symbols:check-rounded" className="text-xs text-white" />
              </span>
              <span className="text-slate-600 dark:text-slate-350">Ca rảnh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-rose-100 dark:bg-rose-950/20 border border-rose-300 inline-flex items-center justify-center">
                <Icon icon="material-symbols:lock-outline" className="text-xs text-rose-600" />
              </span>
              <span className="text-slate-600 dark:text-slate-350">Đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 inline-flex items-center justify-center">
                <Icon icon="material-symbols:add" className="text-xs text-slate-400" />
              </span>
              <span className="text-slate-600 dark:text-slate-350">Bấm để mở</span>
            </div>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="px-4 py-2 text-sm font-extrabold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-all"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Days header row (Using 8-column grid for perfect block layout) */}
      <div className="grid grid-cols-8 text-center border-b border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/10 py-1">
        <div className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest" />
        {weekDays.map((d, idx) => {
          const ds = toDateStr(d);
          const isToday = ds === todayStr;
          const daySlots = slots.filter((s) => s.available_date === ds);
          const avCount = daySlots.filter((s) => s.status === "available").length;
          const bkCount = daySlots.filter((s) => s.status === "booked").length;
          return (
            <div key={ds} className="py-2.5 flex flex-col items-center gap-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-teal-600" : "text-slate-400"}`}>
                {DAY_LABELS[idx]}
              </span>
              <span className={`text-lg font-black w-9 h-9 flex items-center justify-center rounded-full ${
                isToday ? "bg-teal-600 text-white shadow-xs" : "text-slate-700 dark:text-slate-200"
              }`}>
                {d.getDate()}
              </span>
              {(avCount > 0 || bkCount > 0) && (
                <div className="flex gap-1 mt-0.5">
                  {avCount > 0 && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">{avCount} R</span>}
                  {bkCount > 0 && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">{bkCount} Đ</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid body */}
      <div className="overflow-y-auto max-h-[70vh] divide-y divide-slate-100 dark:divide-slate-700/60">
        {PERIODS.map((period) => (
          <div key={period.label}>
            {/* Period group label */}
            <div className="grid grid-cols-8 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/50 py-2 px-3">
              <span className="col-span-8 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {period.label}
              </span>
            </div>
            {/* Hours range inside period */}
            {period.range.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors group/row px-3 py-1.5 gap-1.5 items-center"
              >
                {/* Hour display on first col */}
                <div className="text-xs font-bold text-slate-455 dark:text-slate-500 text-right pr-4 select-none shrink-0 border-r border-slate-205 dark:border-slate-700 mr-1 pb-0.5">
                  {hour}
                </div>
                {/* Day cells for week */}
                {weekDays.map((d) => {
                  const dateStr = toDateStr(d);
                  return renderCell(dateStr, hour);
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render Bulk Panel (CSS Grid based) ───────────────────────────────────
  const renderBulkPanel = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* 2-column instructions helper card */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2.5">
            <Icon icon="material-symbols:electric-bolt" className="text-teal-600 text-xl" />
            Mở lịch nhanh hàng loạt
          </h3>
          <p className="text-base text-slate-550 dark:text-slate-400 leading-relaxed">
            Chọn <strong>khoảng thời gian</strong>, <strong>thứ trong tuần</strong> và <strong>mốc giờ</strong> rảnh của bạn. Lịch làm việc sẽ tự động sinh hàng loạt mốc mới trong Database, bảo đảm an toàn cho các ca đã được book.
          </p>
          <ul className="mt-5 space-y-3.5 text-base">
            {[
              "Chọn phạm vi ngày hoạt động (từ - đến)",
              "Tích chọn từng Thứ rảnh trong tuần",
              "Chọn mốc giờ rảnh bạn nhận việc",
              "Bấm nút Kích Hoạt để tiến hành tạo",
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-sm font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-600 dark:text-slate-350">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-teal-50/70 dark:bg-teal-950/10 border border-teal-200 dark:border-teal-900 rounded-2xl p-6 shadow-xs">
          <p className="text-xs font-black text-teal-800 dark:text-teal-400 uppercase tracking-widest mb-1.5">Lịch hoạt động Helper</p>
          <p className="text-4xl font-black text-teal-700 dark:text-teal-400">
            {totalAvailable} <span className="text-lg font-bold text-teal-600">ca rảnh tổng</span>
          </p>
          <p className="text-sm text-teal-600/70 dark:text-teal-500/80 mt-1 font-medium">sẵn sàng tiếp nhận đặt chỗ từ khách hàng</p>
        </div>
      </div>

      {/* 3-column bulk setup form (CSS Grid internals) */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Toggle Mode */}
        <div>
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
            Chế độ thiết lập hàng loạt
          </label>
          <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setBulkMode("create")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                bulkMode === "create"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400"
              }`}
            >
              <Icon icon="material-symbols:add" /> Mở lịch rảnh
            </button>
            <button
              type="button"
              onClick={() => setBulkMode("delete")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                bulkMode === "delete"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400"
              }`}
            >
              <Icon icon="material-symbols:delete-outline" /> Hủy lịch rảnh
            </button>
          </div>
        </div>

        {/* Range picker */}
        <div>
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
            Khoảng thời gian áp dụng
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <input
              type="date"
              value={bulkStartDate}
              min={toDateStr(today)}
              onChange={(e) => setBulkStartDate(e.target.value)}
              className="w-full text-base font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 text-slate-700 dark:text-slate-300 cursor-pointer"
            />
            <div className="flex items-center gap-3 w-full">
              <Icon icon="material-symbols:arrow-forward-rounded" className="text-slate-400 shrink-0 hidden sm:block" />
              <input
                type="date"
                value={bulkEndDate}
                min={bulkStartDate}
                onChange={(e) => setBulkEndDate(e.target.value)}
                className="w-full text-base font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 text-slate-700 dark:text-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Days select (uses flex & grid) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Lựa chọn thứ trong tuần
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkDays([1, 2, 3, 4, 5, 6, 0])}
                className="text-xs font-extrabold text-teal-600 hover:text-teal-700 transition cursor-pointer"
              >
                Chọn tất cả
              </button>
              <span className="text-slate-300 select-none">|</span>
              <button
                type="button"
                onClick={() => setBulkDays([])}
                className="text-xs font-extrabold text-rose-500 hover:text-rose-600 transition cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {[
              { v: 1, l: "Thứ 2" }, { v: 2, l: "Thứ 3" }, { v: 3, l: "Thứ 4" },
              { v: 4, l: "Thứ 5" }, { v: 5, l: "Thứ 6" }, { v: 6, l: "Thứ 7" },
              { v: 0, l: "Chủ Nhật" },
            ].map((d) => {
              const sel = bulkDays.includes(d.v);
              return (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => setBulkDays(sel ? bulkDays.filter((x) => x !== d.v) : [...bulkDays, d.v])}
                  className={`py-2.5 text-sm font-extrabold rounded-xl border transition-all cursor-pointer ${
                    sel
                      ? bulkMode === "create"
                        ? "bg-teal-600 text-white border-teal-650 shadow-sm"
                        : "bg-rose-600 text-white border-rose-650 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:border-teal-500"
                  }`}
                >
                  {d.l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hour presets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Lựa chọn khung giờ nhận việc
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkTimes([...ALL_HOURS])}
                className="text-xs font-extrabold text-teal-600 hover:text-teal-700 transition cursor-pointer"
              >
                Chọn tất cả
              </button>
              <span className="text-slate-300 select-none">|</span>
              <button
                type="button"
                onClick={() => setBulkTimes([])}
                className="text-xs font-extrabold text-rose-500 hover:text-rose-600 transition cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {ALL_HOURS.map((h) => {
              const sel = bulkTimes.includes(h);
              const preset = BULK_PRESETS.includes(h);
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setBulkTimes(sel ? bulkTimes.filter((x) => x !== h) : [...bulkTimes, h])}
                  className={`py-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer relative ${
                    sel
                      ? bulkMode === "create"
                        ? "bg-teal-600 text-white border-teal-650 shadow-sm"
                        : "bg-rose-600 text-white border-rose-650 shadow-sm"
                      : preset
                      ? "bg-teal-50/70 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900 hover:bg-teal-100"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-400"
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2.5">
            💡 Gợi ý: Các ô có màu xanh nhạt là khung giờ có tỉ lệ khách hàng đặt cao nhất trong ngày.
          </p>
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={bulkSubmitting || bulkDays.length === 0 || bulkTimes.length === 0}
          onClick={handleBulkApply}
          className={`w-full py-4 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
            bulkMode === "create"
              ? "bg-teal-600 hover:bg-teal-700 border border-teal-650"
              : "bg-rose-600 hover:bg-rose-700 border border-rose-650"
          }`}
        >
          {bulkSubmitting ? (
            <>
              <Icon icon="line-md:loading-twotone-loop" className="text-lg shrink-0" />
              Đang thiết lập lịch của bạn...
            </>
          ) : (
            <>
              <Icon
                icon={bulkMode === "create" ? "material-symbols:electric-bolt" : "material-symbols:delete-outline"}
                className="text-lg shrink-0"
              />
              {bulkMode === "create" ? "Kích hoạt" : "Hủy/Xóa"} {bulkDays.length > 0 && bulkTimes.length > 0
                ? `${bulkDays.length} ngày × ${bulkTimes.length} giờ`
                : "lịch hàng loạt"}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-4 md:p-6 max-w-8xl mx-auto space-y-6">
        {renderHeader()}
        {renderTabs()}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Icon icon="line-md:loading-twotone-loop" className="text-5xl text-teal-600" />
            <p className="text-base font-semibold text-slate-500">Đang tải lịch rảnh của bạn...</p>
          </div>
        ) : activePanel === "week" ? (
          renderWeekPanel()
        ) : (
          renderBulkPanel()
        )}
      </div>
    </div>
  );
};

export default HelperAvailabilityPage;
