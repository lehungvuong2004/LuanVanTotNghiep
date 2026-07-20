export interface PriceRangeOption {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

export const DEFAULT_PRICE_OPTIONS: PriceRangeOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "under-500k", label: "Dưới 500.000đ", max: 500000 },
  { value: "500k-1m", label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
  { value: "1m-3m", label: "1.000.000đ - 3.000.000đ", min: 1000000, max: 3000000 },
  { value: "over-3m", label: "Trên 3.000.000đ", min: 3000000 },
];

export const SALARY_OPTS = DEFAULT_PRICE_OPTIONS;

export function isSalaryMatchingRange(salary: any, selectedRange: string, options = DEFAULT_PRICE_OPTIONS): boolean {
  if (!selectedRange || selectedRange === "all") return true;

  const salaryNum = typeof salary === "number" ? salary : Number(String(salary || "").replace(/\D/g, "")) || 0;
  const opt = options.find((o) => o.value === selectedRange);
  if (!opt) return true;

  if (opt.min !== undefined && opt.max !== undefined) {
    return salaryNum >= opt.min && salaryNum <= opt.max;
  }
  if (opt.min !== undefined) return salaryNum >= opt.min;
  if (opt.max !== undefined) return salaryNum <= opt.max;

  return true;
}

export function getPriceRangeValues(selectedRange: string, options = DEFAULT_PRICE_OPTIONS) {
  if (!selectedRange || selectedRange === "all") {
    return { min_price: undefined, max_price: undefined };
  }
  const opt = options.find((o) => o.value === selectedRange);
  if (!opt) return { min_price: undefined, max_price: undefined };

  return { min_price: opt.min, max_price: opt.max };
}
