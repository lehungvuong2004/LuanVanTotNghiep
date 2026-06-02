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
  const containerClass = fullScreen ? "fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm" : "";
  return (
    <div className={containerClass}>
      <Icon icon="line-md:loading-loop" className="text-6xl text-red-600 " />
    </div>
  );
};
