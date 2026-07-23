import { Icon } from "@iconify/react";

export const RatingDistributionRow = ({ star, count, total, colorClass = "bg-amber-400", onClick = undefined, isActive = false, showPercentText = false }: any) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const percentStr = `${Math.round(pct)}%`;

  const content = (
    <>
      <div className="flex items-center gap-1 w-10 shrink-0 select-none text-left">
        <span className="text-xs font-bold text-slate-650 dark:text-slate-305">{star}</span>
        <Icon icon="material-symbols:star-rounded" className="text-amber-450 text-base" />
      </div>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 w-16 text-right shrink-0">
        {count} {showPercentText && <span className="text-slate-450 dark:text-slate-500 font-normal">({percentStr})</span>}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`flex items-center gap-2.5 w-full cursor-pointer rounded-xl px-2.5 py-1.5 transition-all text-left ${
          isActive ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30" : "hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border border-transparent"
        }`}
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-2.5 w-full px-2.5 py-1">{content}</div>;
};
