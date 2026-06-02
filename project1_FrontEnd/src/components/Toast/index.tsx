import { Icon } from "@iconify/react";
import type { ToastProps } from "../../types/Toast";

const toastConfig = {
  success: {
    icon: "mdi:success",
    color: "border-green-500 bg-green-50",
  },
  error: {
    icon: "material-symbols:error-outline",
    color: "border-red-500 bg-red-50",
  },
  warning: {
    icon: "material-symbols:warning-outline",
    color: "border-yellow-500 bg-yellow-50",
  },
  info: {
    icon: "material-symbols:info",
    color: "border-blue-500 bg-blue-50",
  },
};
export const Toast = ({ type = "success", title, message, onClose }: ToastProps) => {
  const config = toastConfig[type];
  // console.log(config);
  return (
    <div className="fixed top-6 right-6 z-50 w-120 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-lg px-5 py-4 flex gap-4">
      <Icon icon={config.icon} className={`text-2xl mt-0.5 ${config.color}`} />
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
      </div>
      <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
        <Icon icon="mdi:close" className="text-xl" />
      </button>
    </div>
  );
};
