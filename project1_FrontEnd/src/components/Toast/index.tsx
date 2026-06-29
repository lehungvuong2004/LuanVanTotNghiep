import { Icon } from "@iconify/react";
import type { ToastProps } from "../../types/Toast";

const toastConfig = {
  success: {
    icon: "material-symbols:check-circle-outline-rounded",
    cardBg: "bg-emerald-50/95 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-900 dark:text-emerald-250",
    messageColor: "text-emerald-750 dark:text-emerald-450",
  },
  error: {
    icon: "material-symbols:error-outline-rounded",
    cardBg: "bg-red-50/95 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-250",
    messageColor: "text-red-750 dark:text-red-450",
  },
  warning: {
    icon: "material-symbols:warning-outline-rounded",
    cardBg: "bg-amber-50/95 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-900 dark:text-amber-250",
    messageColor: "text-amber-750 dark:text-amber-400",
  },
  info: {
    icon: "material-symbols:info-outline-rounded",
    cardBg: "bg-sky-50/95 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-900/50",
    iconColor: "text-sky-600 dark:text-sky-400",
    titleColor: "text-sky-900 dark:text-sky-250",
    messageColor: "text-sky-750 dark:text-sky-450",
  },
};

export const Toast = ({ type = "success", title, message, onClose }: ToastProps) => {
  const config = toastConfig[type];

  return (
    <div
      className={`fixed top-6 right-6 z-50 w-120 max-w-[calc(100vw-2rem)] rounded-2xl border ${config.border} ${config.cardBg} shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] px-5 py-4 flex gap-4 transition-all duration-300 hover:scale-[1.01]`}
    >
      <Icon icon={config.icon} className={`text-2xl mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 text-left">
        <h3 className={`text-base font-bold ${config.titleColor}`}>{title}</h3>
        {message && <p className={`mt-1 text-sm font-medium ${config.messageColor}`}>{message}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className={`shrink-0 ${config.iconColor} opacity-60 hover:opacity-100 transition-opacity cursor-pointer h-6 w-6 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5`}
      >
        <Icon icon="mdi:close" className="text-lg" />
      </button>
    </div>
  );
};
