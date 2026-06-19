import { Icon } from "@iconify/react";
import type { Pagination as PaginationType } from "../../types/tableData";

interface PaginationProps {
  pagination?: PaginationType;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  pagination,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) => {
  // Extract values, falling back to flat props if pagination object is not passed
  const activePage = pagination ? pagination.pageNumber : (currentPage ?? 1);
  const itemsCount = pagination ? pagination.countItems : (totalItems ?? 0);
  const size = pagination ? pagination.pageSize : (itemsPerPage ?? 10);
  const pagesCount = pagination ? pagination.countPages : (Math.ceil(itemsCount / size) || 1);

  if (itemsCount === 0) return null;

  const startIndex = (activePage - 1) * size + 1;
  const endIndex = Math.min(activePage * size, itemsCount);
  const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/50">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex}-{endIndex}</span> của{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{itemsCount}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => activePage > 1 && onPageChange(activePage - 1)}
          disabled={activePage === 1}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
            activePage === 1
              ? "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <Icon icon="material-symbols:chevron-left" className="text-lg" />
        </button>

        {/* Page Numbers */}
        {pages.map((page) => {
          const isActive = page === activePage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#026E5F] text-white shadow-xs"
                  : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => activePage < pagesCount && onPageChange(activePage + 1)}
          disabled={activePage === pagesCount}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
            activePage === pagesCount
              ? "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <Icon icon="material-symbols:chevron-right" className="text-lg" />
        </button>
      </div>
    </div>
  );
};
