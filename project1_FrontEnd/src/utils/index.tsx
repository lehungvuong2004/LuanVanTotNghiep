export const waitFor = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const ceilDiv = (a: number, b: number) => Math.floor((a + b - 1) / b);

export function formatNumberVI(value: number | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Intl.NumberFormat("vi-VN").format(value);
}

export const parseUtcDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+") && !dateStr.includes("T")) {
    return new Date(dateStr.replace(" ", "T") + "Z");
  }
  return new Date(dateStr);
};

export const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return null;
  const d = parseUtcDate(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
};

export const getRootFontSizePx = () => {
  if (typeof window === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
};

export function formatMoneyShortVI(value: number | string | null | undefined): string {
  if (value === undefined || value === null) return "";
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "";

  if (num >= 1_000_000_000) {
    const ty = num / 1_000_000_000;
    const rounded = Math.round(ty * 10) / 10;
    const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1).replace(".", ",");
    return `${formatted} tỷ ₫`;
  }
  if (num >= 1_000_000) {
    const tr = num / 1_000_000;
    const rounded = Math.round(tr * 10) / 10;
    const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1).replace(".", ",");
    return `${formatted} triệu ₫`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)} nghìn ₫`;
  }
  return `${num} ₫`;
}

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function formatMoneyInput(value: string | number | null | undefined){
  if (value === undefined || value === null) return "";
  const cleanVal = value.toString().replace(/\D/g, "");
  if (!cleanVal) return "";
  const num = parseInt(cleanVal, 10);
  return new Intl.NumberFormat("vi-VN").format(num);
}

export const sortBookingsByDate = (items: any[]) => {
  return [...items].sort((a, b) => b.id - a.id);
};

export const formatVietnamDateTime = (dateStr: string | null | undefined)=> {
  if (!dateStr) return "";
  const d = parseUtcDate(dateStr);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
};

export const getRatingNote = (rating)=> {
  switch (rating) {
    case 5:
      return "Xuất sắc (5/5)";
    case 4:
      return "Tốt (4/5)";
    case 3:
      return "Bình thường (3/5)";
    case 2:
      return "Tệ (2/5)";
    case 1:
      return "Rất tệ (1/5)";
    default:
      return `${rating}/5`;
  }
};

export const getRatingBadgeClass = (rating) => {
  switch (rating) {
    case 5:
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";
    case 4:
      return "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400";
    case 3:
      return "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
    case 2:
      return "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400";
    case 1:
      return "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400";
    default:
      return "bg-slate-50 text-slate-600 dark:bg-slate-950/40 dark:text-slate-400";
  }
};
