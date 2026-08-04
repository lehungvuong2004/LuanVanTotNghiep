import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export const ExpandToggleButton = ({
  isExpanded,
  onClick,
  expandText,
  collapseText,
  className = "",
}: any) => {
  const { t } = useTranslation();

  const label = isExpanded ? (collapseText ?? t("Thu gọn")) : (expandText ?? t("Xem thêm"));
  const icon = isExpanded ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear";
  const iconClass = isExpanded ? "text-base" : "text-base animate-bounce";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-6 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-750/30 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer shadow-xs active:scale-95 ${className}`}
    >
      {label}
      <Icon icon={icon} className={iconClass} />
    </button>
  );
};
