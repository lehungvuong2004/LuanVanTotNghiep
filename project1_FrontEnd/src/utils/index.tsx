import { ROLES, getUserRole } from "../constants/roles";

const numberFormatter = new Intl.NumberFormat("vi-VN");

export function formatNumberVI(value: number | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return numberFormatter.format(value);
}

export function fmtVND(value: number | string | null | undefined): string {
  if (value === undefined || value === null) return "0 ₫";
  const num = typeof value === "string" ? Number(value) : value;
  return `${numberFormatter.format(num)} ₫`;
}

export const parseUtcDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+") && !dateStr.includes("T")) {
    return new Date(dateStr.replace(" ", "T") + "Z");
  }
  return new Date(dateStr);
};

export const formatDateTime = (dateStr: string | null | undefined): any => {
  if (!dateStr) return dateStr === null ? null : "";
  const d = parseUtcDate(dateStr);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
};

export const formatDateTimeLong = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const d = parseUtcDate(dateStr);
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateStr;
  }
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
    return `${formatted} tỷ`;
  }
  if (num >= 1_000_000) {
    const tr = num / 1_000_000;
    const rounded = Math.round(tr * 10) / 10;
    const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1).replace(".", ",");
    return `${formatted} triệu`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)} nghìn`;
  }
  return `${num}`;
}

export const formatDate = (dateStr): any => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function formatMoneyInput(value: string | number | null | undefined) {
  if (value === undefined || value === null) return "";
  const cleanVal = value.toString().replace(/\D/g, "");
  if (!cleanVal) return "";
  const num = parseInt(cleanVal, 10);
  return numberFormatter.format(num);
}

export const sortBookingsByDate = (items: any[]) => {
  return [...items].sort((a, b) => b.id - a.id);
};

export const formatVietnamDateTime = formatDateTime;

export const getRatingNote = (rating) => {
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

export const getInitials = (name?: string | null, fallback: string = "U"): string => {
  if (!name || !name.trim()) return fallback;
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export const getRoleBadge = (role?: number | string | any) => {
  if (!role) return null;
  let roleNum: number;
  if (typeof role === "object") {
    roleNum = getUserRole(role) || ROLES.CUSTOMER;
  } else if (typeof role === "string") {
    roleNum = getUserRole({ role: { name: role } }) || ROLES.CUSTOMER;
  } else {
    roleNum = Number(role);
  }

  switch (roleNum) {
    case ROLES.ADMIN:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 whitespace-nowrap">
          Admin
        </span>
      );
    case ROLES.OPERATOR:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 whitespace-nowrap">
          Vận Hành
        </span>
      );
    case ROLES.HELPER:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">
          Người Giúp Việc
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-teal-50 dark:bg-teal-950/20 text-[#026E5F] dark:text-[#52c1b2] border border-teal-100 dark:border-teal-900/30 whitespace-nowrap">
          Khách Hàng
        </span>
      );
  }
};
