import { Icon } from "@iconify/react";
import type { ToastProps } from "../../types/Toast";

const toastConfig = {
  success: {
    icon: "mdi:success",
    color: "border-green-500 bg-green-50 dark:bg-green-500/10",
  },
  error: {
    icon: "material-symbols:error-outline",
    color: "border-red-500 bg-red-50 dark:bg-red-500/10",
  },
  warning: {
    icon: "material-symbols:warning-outline",
    color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10",
  },
  info: {
    icon: "material-symbols:info",
    color: "border-blue-500 bg-blue-50 dark:bg-blue-500/10",
  },
};
export const Toast = ({ type = "success", title, message, onClose }: ToastProps) => {
  const config = toastConfig[type];
  // console.log(config);
  return (
    <div className="fixed top-6 right-6 z-50 w-120 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] px-5 py-4 flex gap-4 transition-colors duration-300">
      <Icon icon={config.icon} className={`text-2xl mt-0.5 ${config.color}`} />
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {message && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
      </div>
      <button type="button" onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
        <Icon icon="mdi:close" className="text-xl" />
      </button>
    </div>
  );
};
