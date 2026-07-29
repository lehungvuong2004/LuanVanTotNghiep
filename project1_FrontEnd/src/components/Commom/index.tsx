import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

interface LoadingProps {
  fullScreen?: boolean;
  timeout?: number;
}

export const Loading = ({ fullScreen = false, timeout }: LoadingProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (timeout && timeout > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [timeout]);

  if (!isVisible) return null;
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm gap-3 animate-fade-in"
    : "flex flex-col items-center justify-center gap-3";

  return (
    <div className={containerClass}>
      <Icon icon="line-md:loading-loop" className="text-6xl text-red-600 dark:text-teal-400" />
      <span className="text-slate-500 dark:text-slate-400 font-bold text-sm select-none tracking-medium">
        Đang tải dữ liệu...
      </span>
    </div>
  );
};
