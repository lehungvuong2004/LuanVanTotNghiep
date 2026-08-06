import { Icon } from "@iconify/react";
import { ROLES, getUserRole } from "../constants/roles";
import i18n from "../i18n";

const numberFormatter = new Intl.NumberFormat("vi-VN");

export function formatNumberVI(value: any) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return numberFormatter.format(value);
}

export function fmtVND(value: any) {
  if (value === undefined || value === null) return "0";
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "0 ₫";
  if (num >= 1_000_000_000) {
    const ty = num / 1_000_000_000;
    const rounded = Math.round(ty * 100) / 100;
    const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2).replace(".", ",");
    return `${formatted} ${i18n.t("tỷ đ")}`;
  }
  return `${numberFormatter.format(num)} ₫`;
}

export const parseUtcDate = (dateStr: any) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+") && !dateStr.includes("T")) {
    return new Date(dateStr.replace(" ", "T") + "Z");
  }
  return new Date(dateStr);
};

export const formatDateTime = (dateStr: any) => {
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

export const formatDateTimeLong = (dateStr: any) => {
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

export function formatMoneyShortVI(value: any) {
  return fmtVND(value) || 0;
}

export const formatDate = (dateStr: any) => {
  if (!dateStr) return "";
  const d = parseUtcDate(dateStr);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatDateWithDay = (dateStr: any, locale: string = "vi-VN") => {
  if (!dateStr) return "";
  const d = parseUtcDate(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
};

export const formatTimeOnly = (date?: Date) => {
  const d = date || new Date();
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export function formatMoneyInput(value: any) {
  if (value === undefined || value === null) return "";
  const cleanVal = value.toString().replace(/\D/g, "");
  if (!cleanVal) return "";
  const num = parseInt(cleanVal, 10);
  return numberFormatter.format(num);
}

export const sortBookingsByDate = (items: any) => {
  return [...items].sort((a, b) => b.id - a.id);
};

export const formatPrice = fmtVND;

export const formatVietnamDateTime = formatDateTime;

export const getRatingNote = (rating: any) => {
  switch (rating) {
    case 5:
      return i18n.t("Xuất sắc (5/5)");
    case 4:
      return i18n.t("Tốt (4/5)");
    case 3:
      return i18n.t("Bình thường (3/5)");
    case 2:
      return i18n.t("Tệ (2/5)");
    case 1:
      return i18n.t("Rất tệ (1/5)");
    default:
      return `${rating}/5`;
  }
};

export const getRatingBadgeClass = (rating: any) => {
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

export const getInitials = (name?: any, fallback = "U") => {
  if (!name || !name.trim()) return fallback;
  return name
    .trim()
    .split(/\s+/)
    .map((n: any) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export const getRoleBadge = (role?: any) => {
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
          {i18n.t("Admin")}
        </span>
      );
    case ROLES.OPERATOR:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 whitespace-nowrap">
          {i18n.t("Vận Hành")}
        </span>
      );
    case ROLES.HELPER:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">
          {i18n.t("Người Giúp Việc")}
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-teal-50 dark:bg-teal-950/20 text-[#026E5F] dark:text-[#52c1b2] border border-teal-100 dark:border-teal-900/30 whitespace-nowrap">
          {i18n.t("Khách Hàng")}
        </span>
      );
  }
};

export const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Icon
        key={i}
        icon={i <= rating ? "material-symbols:star-rounded" : "material-symbols:star-outline-rounded"}
        className={`text-xl ${i <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
      />,
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export type BadgeType = "contact" | "helper" | "user" | "report" | "payment" | "refund";

export const getStatusBadge = (status: string, type?: BadgeType) => {
  const s = (status || "").toLowerCase();
  let text = status;
  let bgCls = "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50";
  let dotCls = "bg-slate-400";
  let pulse = false;

  if (type === "contact") {
    if (s === "pending") {
      text = "Chờ xử lý";
      bgCls = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      dotCls = "bg-amber-500";
      pulse = true;
    } else if (s === "processed") {
      text = "Đã xử lý";
      bgCls = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30";
      dotCls = "bg-emerald-500";
    }
  } else if (type === "helper") {
    if (s === "active") {
      text = "Hoạt động";
      bgCls = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      dotCls = "bg-emerald-500";
      pulse = true;
    } else if (s === "pending") {
      text = "Chờ duyệt";
      bgCls = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      dotCls = "bg-amber-500";
      pulse = true;
    } else if (s === "suspended") {
      text = "Tạm ngưng";
      bgCls = "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30";
      dotCls = "bg-rose-500";
    } else {
      text = "Từ chối";
      bgCls = "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30";
      dotCls = "bg-rose-500";
    }
  } else if (type === "user") {
    if (s === "active") {
      text = "Hoạt động";
      bgCls = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      dotCls = "bg-emerald-500";
      pulse = true;
    } else if (s === "inactive" || s === "pending") {
      text = "Tạm khóa";
      bgCls = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      dotCls = "bg-amber-500";
    } else {
      text = "Bị khóa";
      bgCls = "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30";
      dotCls = "bg-rose-500";
    }
  } else if (type === "report") {
    if (s === "pending") {
      text = "Chờ xử lý";
      bgCls = "bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30";
      dotCls = "bg-amber-500";
      pulse = true;
    } else if (s === "resolved") {
      text = "Đã giải quyết";
      bgCls = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30";
      dotCls = "bg-emerald-500";
    } else if (s === "dismissed") {
      text = "Đã bỏ qua";
      bgCls = "bg-slate-50 text-slate-650 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-205 dark:border-slate-700/50";
      dotCls = "bg-slate-400";
    }
  } else {
    // Payment or Refund (borderless, rounded-full)
    text = status.charAt(0).toUpperCase() + status.slice(1);
    if (s === "completed") {
      bgCls = "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400";
      dotCls = "bg-emerald-500";
    } else if (s === "pending") {
      bgCls = "bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400";
      dotCls = "bg-amber-500";
    } else if (s === "failed") {
      bgCls = "bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-455";
      dotCls = "bg-rose-500";
    } else if (s === "refunded") {
      bgCls = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
      dotCls = "bg-slate-400";
    } else if (s === "approved") {
      bgCls = "bg-sky-50 dark:bg-sky-955/30 text-sky-600 dark:text-sky-400";
      dotCls = "bg-sky-500";
    } else if (s === "rejected") {
      bgCls = "bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-455";
      dotCls = "bg-rose-500";
    }
  }

  const roundedCls = type === "report" || type === "payment" || type === "refund" ? "rounded-full" : "rounded-lg";
  const fontCls = type === "payment" || type === "refund" ? "font-semibold" : "font-bold";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 ${roundedCls} text-xs ${fontCls} ${bgCls} w-fit whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotCls} mr-1.5 shrink-0 ${pulse ? "animate-pulse" : ""}`} />
      {text}
    </span>
  );
};
