import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../utils/images";

export const ImageUpload = ({ label, value = "", onChange = () => {}, onUpload = async () => ({}), error = "", placeholder, aspectRatio = "video", disabled = false }: any) => {
  const { t } = useTranslation();
  const displayLabel = label !== undefined ? label : t("Hình Ảnh");
  const displayPlaceholder = placeholder !== undefined ? placeholder : t("Nhập link ảnh hoặc chọn file tải lên...");
  const [loading, setLoading] = useState(false);

  // Xử lý upload file ảnh
  const handleFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await onUpload(file);
      const imgUrl = res?.url || res?.data?.url || res?.path || res?.data?.path || "";
      if (imgUrl) onChange(imgUrl);
    } catch {
      console.error("Lỗi upload ảnh");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // Tỉ lệ khung hình (Khối vuông / Video / Banner)
  const aspectClass = aspectRatio === "square" ? "aspect-square max-w-40" : aspectRatio === "banner" ? "aspect-[21/9]" : "aspect-video";

  return (
    <div className="space-y-1.5">
      {displayLabel && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{displayLabel}</label>}

      {/* Input và Nút chọn ảnh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ""}
            placeholder={displayPlaceholder}
            disabled={disabled || loading}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-hidden"
          />
          {value && !loading && (
            <button type="button" onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
              ✕
            </button>
          )}
        </div>

        <label
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-200 transition-all shrink-0 ${
            disabled || loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Icon icon={loading ? "line-md:loading-loop" : "solar:camera-bold"} className="text-lg" />
          <span>{loading ? t("Đang tải...") : t("Tải ảnh")}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={disabled || loading} />
        </label>
      </div>

      {/* Báo lỗi */}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Khung ảnh xem trước */}
      {value && (
        <div className={`mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 ${aspectClass}`}>
          <img
            src={getImageUrl(value)}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e: any) => {
              e.target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=" + encodeURIComponent(t("Ảnh lỗi"));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
