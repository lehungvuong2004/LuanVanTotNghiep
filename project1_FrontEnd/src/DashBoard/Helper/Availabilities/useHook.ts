import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { getMyAvailability, addMyAvailability, removeMyAvailability, clearAllMyAvailability, bulkMyAvailability } from "../../../api/helpers";
import type { HelperAvailability } from "../../../api/helpers";

// ─── Helpers ───────────────────────────────────────────────────────────────
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function localNow(): Date {
  return new Date();
}

export function isSlotPast(dateStr: string, hourStr: string): boolean {
  const [h] = hourStr.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h, 0, 0, 0);
  return d < localNow();
}

export const useHelperAvailability = () => {
  const { showToast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<HelperAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // "YYYY-MM-DD|HH:00"
  const [refreshTick, setRefreshTick] = useState(0);

  // Calendar: selected week (anchor = first day of selected week, Monday-based)
  const today = useMemo(() => new Date(), []);
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => {
    const d = new Date();
    const diff = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Bulk schedule
  const [bulkStartDate, setBulkStartDate] = useState(toDateStr(today));
  const [bulkEndDate, setBulkEndDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 29);
    return toDateStr(d);
  });
  const [bulkDays, setBulkDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [bulkTimes, setBulkTimes] = useState<string[]>(["08:00", "10:00", "14:00", "18:00"]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [activePanel, setActivePanel] = useState<"week" | "bulk">("week");
  const [bulkMode, setBulkMode] = useState<"create" | "delete">("create");

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const doFetch = async () => {
      if (alive) setLoading(true);
      try {
        const res = await getMyAvailability();
        if (alive) setSlots(res.data ?? []);
      } catch {
        if (alive) showToast("error", "Lỗi tải dữ liệu", "Không thể tải lịch rảnh.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    doFetch();
    return () => {
      alive = false;
    };
  }, [refreshTick, showToast]);

  // ── Derived: week days (7 days starting from weekAnchor) ───────────────
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekAnchor);
        d.setDate(weekAnchor.getDate() + i);
        return d;
      }),
    [weekAnchor],
  );

  // Slot lookup map: "YYYY-MM-DD|HH:00" → HelperAvailability
  const slotMap = useMemo(() => {
    const m = new Map<string, HelperAvailability>();
    slots.forEach((s) => {
      const hh = s.start_time.slice(0, 5); // "HH:MM"
      const hStr = hh.endsWith(":00") ? hh : null;
      const key = `${s.available_date}|${hStr ?? hh}`;
      m.set(key, s);
    });
    return m;
  }, [slots]);

  // ── Toggle slot ────────────────────────────────────────────────────────
  const handleToggle = async (dateStr: string, hour: string) => {
    if (isSlotPast(dateStr, hour)) {
      showToast("warning", "Không thể chỉnh sửa", "Không thể thay đổi ca làm việc trong quá khứ.");
      return;
    }
    const key = `${dateStr}|${hour}`;
    const existing = slotMap.get(key);
    setActionLoading(key);
    try {
      if (existing) {
        if (existing.status === "booked") {
          showToast("warning", "Đang có khách đặt", "Ca này đã được khách hàng đặt lịch, không thể hủy.");
          return;
        }
        await removeMyAvailability(existing.id);
      } else {
        await addMyAvailability({ available_date: dateStr, start_time: hour });
      }
      setRefreshTick((p) => p + 1);
    } catch (err: any) {
      showToast("error", "Lỗi thao tác", err?.response?.data?.message ?? "Không thể cập nhật ca.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Bulk apply ─────────────────────────────────────────────────────────
  const handleBulkApply = async () => {
    if (bulkDays.length === 0 || bulkTimes.length === 0) {
      showToast("error", "Thiếu thông tin", "Vui lòng chọn ít nhất một ngày và một khung giờ.");
      return;
    }
    const start = new Date(bulkStartDate);
    const end = new Date(bulkEndDate);
    if (start > end) {
      showToast("error", "Ngày không hợp lệ", "Ngày bắt đầu phải trước ngày kết thúc.");
      return;
    }
    setBulkSubmitting(true);
    try {
      const cur = new Date(start);
      // Safety limits
      const datesToProcess: Date[] = [];
      while (cur <= end) {
        if (bulkDays.includes(cur.getDay())) {
          datesToProcess.push(new Date(cur));
        }
        cur.setDate(cur.getDate() + 1);
      }

      if (datesToProcess.length * bulkTimes.length > 300) {
        showToast("warning", "Quá quy mô", "Số lượng ca thay đổi vượt quá 300. Vui lòng chọn khoảng thời gian ngắn hơn.");
        setBulkSubmitting(false);
        return;
      }

      const slotsToSubmit: { available_date: string; start_time: string }[] = [];

      for (const d of datesToProcess) {
        const dStr = toDateStr(d);
        for (const time of bulkTimes) {
          if (isSlotPast(dStr, time)) continue;

          if (bulkMode === "create") {
            const key = `${dStr}|${time}`;
            if (slotMap.has(key)) continue;
            slotsToSubmit.push({ available_date: dStr, start_time: time });
          } else {
            const key = `${dStr}|${time}`;
            const existing = slotMap.get(key);
            if (!existing || existing.status === "booked") continue;
            slotsToSubmit.push({ available_date: dStr, start_time: time });
          }
        }
      }

      if (slotsToSubmit.length === 0) {
        showToast("info", "Thông báo", "Không có thay đổi nào cần thiết lập.");
        setBulkSubmitting(false);
        return;
      }

      const res = await bulkMyAvailability({
        action: bulkMode,
        slots: slotsToSubmit,
      });

      const { created, ignored, deleted } = res.data;

      if (bulkMode === "create") {
        showToast("success", "Kích hoạt thành công", `Đã tạo ${created} ca. ${ignored} ca bị bỏ qua do trùng.`);
      } else {
        showToast("success", "Hủy lịch thành công", `Đã hủy thành công ${deleted} ca rảnh.`);
      }
      setRefreshTick((p) => p + 1);
    } catch (err: any) {
      showToast("error", "Lỗi hệ thống", err?.response?.data?.message ?? "Không thể cập nhật lịch hàng loạt.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // ── Clear all availability ─────────────────────────────────────────────
  const [clearingAll, setClearingAll] = useState(false);
  const handleClearAll = async () => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa toàn bộ lịch rảnh hiện tại không?\nLưu ý: Các ca làm việc đã có khách đặt lịch (màu đỏ) vẫn sẽ được giữ lại để tiếp tục phục vụ khách hàng.",
    );
    if (!confirm) return;

    setClearingAll(true);
    try {
      const res = await clearAllMyAvailability();
      const count = res?.data?.deleted_count ?? 0;
      showToast("success", "Xóa thành công", `Đã xóa toàn bộ ${count} ca rảnh khỏi lịch làm việc.`);
      setRefreshTick((p) => p + 1);
    } catch {
      showToast("error", "Lỗi hệ thống", "Không thể xóa toàn bộ lịch rảnh.");
    } finally {
      setClearingAll(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const statsThisWeek = useMemo(() => {
    const weekStrs = new Set(weekDays.map(toDateStr));
    return {
      available: slots.filter((s) => weekStrs.has(s.available_date) && s.status === "available").length,
      booked: slots.filter((s) => weekStrs.has(s.available_date) && s.status === "booked").length,
    };
  }, [slots, weekDays]);

  const totalAvailable = slots.filter((s) => s.status === "available").length;

  // ── Week navigation ────────────────────────────────────────────────────
  const prevWeek = () => {
    setWeekAnchor((p) => {
      const d = new Date(p);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };
  const nextWeek = () => {
    setWeekAnchor((p) => {
      const d = new Date(p);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };
  const goToday = () => {
    const d = new Date();
    const diff = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    setWeekAnchor(d);
  };

  const weekLabel = (() => {
    const s = weekDays[0];
    const e = weekDays[6];
    const sm = `${s.getDate()}/${s.getMonth() + 1}`;
    const em = `${e.getDate()}/${e.getMonth() + 1}/${e.getFullYear()}`;
    return `${sm} – ${em}`;
  })();

  const todayStr = toDateStr(today);

  return {
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
    clearingAll,
    statsThisWeek,
    totalAvailable,
    weekLabel,
    todayStr,
    prevWeek,
    nextWeek,
    goToday,
    handleToggle,
    handleBulkApply,
    handleClearAll,
  };
};
