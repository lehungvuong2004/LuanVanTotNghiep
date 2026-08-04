import { useState } from "react";
import { Icon } from "@iconify/react";

export interface CustomSelectOption {
  value: any;
  label: string;
}

export interface CustomSelectProps {
  value: any;
  onChange: (val: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  position?: "bottom" | "top";
}

export const CustomSelect = ({ value, onChange, options, placeholder = "", className = "", disabled = false, position = "bottom" }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-355 flex items-center justify-between cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-[#026E5F] dark:focus:border-teal-400 transition-all text-left disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon icon="material-symbols:keyboard-arrow-down" className={`text-xl text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Options List */}
      {isOpen && !disabled && (
        <>
          {/* Transparent Backdrop to close on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <ul
            className={`absolute left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto text-sm ${
              position === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
          >
            {options.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              const isNotLast = idx < options.length - 1;
              return (
                <li
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors font-medium flex items-center justify-between border-slate-100 dark:border-slate-700/50 ${
                    isNotLast ? "border-b" : ""
                  } ${isSelected ? "text-[#026E5F] dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 font-bold" : "text-slate-700 dark:text-slate-300"}`}
                >
                  <span className="whitespace-normal pr-4 flex-1 text-left" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                    {opt.label}
                  </span>
                  {isSelected && <Icon icon="material-symbols:check" className="text-base text-[#026E5F] dark:text-teal-400 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default CustomSelect;
