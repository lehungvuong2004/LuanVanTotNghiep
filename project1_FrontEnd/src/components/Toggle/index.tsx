import { useTranslation } from "react-i18next";

export const Toggle = ({
  checked,
  onChange,
  disabled = false,
  activeLabel,
  inactiveLabel,
}) => {
  const { t } = useTranslation();
  const displayActive = activeLabel ?? t("Hoạt động");
  const displayInactive = inactiveLabel ?? t("Tạm ngưng");

  return (
    <div className="flex items-center gap-2 select-none">
      <label className={`relative inline-flex items-center ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-500"></div>
      </label>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-16">
        {checked ? displayActive : displayInactive}
      </span>
    </div>
  );
};

export default Toggle;
