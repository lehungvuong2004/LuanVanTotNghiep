import { DEFAULT_PRICE_OPTIONS, getPriceRangeValues } from "./useHook";

export interface PriceFilterProps {
  title?: string;
  selectedValue?: string;
  minPrice?: number;
  maxPrice?: number;
  options?: any[];
  onChangeSelectedValue?: (value: string) => void;
  onChangeRange?: (min?: number, max?: number, rangeKey?: string) => void;
  t?: (key: string) => string;
  nameGroup?: string;
  showCustomRange?: boolean;
}

export const PriceFilter = ({
  title = "Mức giá",
  selectedValue,
  minPrice,
  maxPrice,
  options = DEFAULT_PRICE_OPTIONS,
  onChangeSelectedValue,
  onChangeRange,
  t = (s) => s,
  nameGroup = "price_filter_radio",
}: PriceFilterProps) => {
  const currentSelectedValue = (() => {
    if (selectedValue !== undefined) return selectedValue;
    if (minPrice === undefined && maxPrice === undefined) return "all";
    const found = options.find((opt: any) => opt.min === minPrice && opt.max === maxPrice);
    return found ? found.value : "all";
  })();

  const handleRadioChange = (optValue: string) => {
    if (onChangeSelectedValue) {
      onChangeSelectedValue(optValue);
    }
    if (onChangeRange) {
      const { min_price, max_price } = getPriceRangeValues(optValue, options);
      onChangeRange(min_price, max_price, optValue);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {title && <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{t(title)}</h4>}
      <div className="flex flex-col gap-2.5">
        {options.map((opt: any) => {
          const isChecked = currentSelectedValue === opt.value;
          return (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={nameGroup}
                checked={isChecked}
                onChange={() => handleRadioChange(opt.value)}
                className="rounded-full border-slate-300 dark:border-slate-650 text-teal-600 focus:ring-teal-500 dark:bg-slate-900 cursor-pointer h-4 w-4 accent-teal-600"
              />
              <span
                className={`text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors font-medium ${
                  isChecked ? "text-teal-600 dark:text-teal-400 font-bold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {t(opt.label)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PriceFilter;
