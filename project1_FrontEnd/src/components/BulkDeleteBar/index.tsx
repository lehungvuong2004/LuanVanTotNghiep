import { Icon } from "@iconify/react";

export interface BulkDeleteBarProps {
  /** Danh sách id đang được chọn */
  selectedIds: (string | number)[];
  /** Tổng số bản ghi đang hiển thị */
  totalCount: number;
  /** Callback bật/tắt chọn-tất-cả */
  onToggleAll: () => void;
  /** Callback xóa toàn bộ các id đã chọn */
  onDeleteSelected: () => void;
  /** Callback bỏ chọn tất cả */
  onClear: () => void;
  /** Đang trong quá trình xóa */
  loading?: boolean;
}

export const BulkDeleteBar = ({
  selectedIds,
  totalCount,
  onToggleAll,
  onDeleteSelected,
  onClear,
  loading = false }: BulkDeleteBarProps) => {
  const allSelected = selectedIds.length > 0 && selectedIds.length === totalCount;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const count = selectedIds.length;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
        count > 0
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 shadow-xs"
          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50"
      }`}
    >
      {/* Checkbox select-all */}
      <button
        type="button"
        onClick={onToggleAll}
        title={allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        className={`flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-all shrink-0 focus:outline-none ${
          allSelected || someSelected
            ? "border-cyan-700 dark:border-cyan-600"
            : "border-slate-400 dark:border-slate-500"
        } ${
          allSelected
            ? "bg-cyan-700 dark:bg-cyan-600"
            : someSelected
            ? "bg-cyan-100 dark:bg-cyan-950/40"
            : "bg-transparent"
        }`}
      >
        {allSelected && <Icon icon="material-symbols:check-small-rounded" className="text-white text-base" />}
        {someSelected && <Icon icon="material-symbols:remove-rounded" className="text-cyan-700 dark:text-cyan-400 text-sm" />}
      </button>

      {/* Label */}
      <span
        className={`text-xs font-semibold select-none ${
          count > 0 ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {count > 0 ? `Đã chọn ${count} mục` : "Chọn để xóa hàng loạt"}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons — chỉ hiện khi có chọn */}
      {count > 0 && (
        <div className="flex items-center gap-2">
          {/* Clear */}
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Icon icon="material-symbols:close-rounded" className="text-base" />
            Bỏ chọn
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon icon="material-symbols:delete-outline-rounded" className="text-base" />
            )}
            Xóa {count} mục
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkDeleteBar;
