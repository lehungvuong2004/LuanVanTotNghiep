export const waitFor = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const ceilDiv = (a: number, b: number) => Math.floor((a + b - 1) / b);

export function formatNumberVI(value: number | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Intl.NumberFormat("vi-VN").format(value);
}


export const getRootFontSizePx = () => {
  if (typeof window === 'undefined') return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
};

export function formatMoneyShortVI(value: number | string | null | undefined): string {
  if (value === undefined || value === null) return "";
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "";

  if (num >= 1_000_000_000) {
    const ty = num / 1_000_000_000;
    const rounded = Math.round(ty * 10) / 10;
    const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1).replace(".", ",");
    return `${formatted} tỷ ₫`;
  }
  if (num >= 1_000_000) {
    const tr = num / 1_000_000;
    const rounded = Math.round(tr * 10) / 10;
    const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1).replace(".", ",");
    return `${formatted} triệu ₫`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)} nghìn ₫`;
  }
  return `${num} ₫`;
}

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function formatMoneyInput(value: string | number | null | undefined): string {
  if (value === undefined || value === null) return "";
  const cleanVal = value.toString().replace(/\D/g, "");
  if (!cleanVal) return "";
  const num = parseInt(cleanVal, 10);
  return new Intl.NumberFormat("vi-VN").format(num);
}