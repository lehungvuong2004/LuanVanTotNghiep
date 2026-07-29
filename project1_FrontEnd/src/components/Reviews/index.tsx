import { Icon } from "@iconify/react";
import { getInitials, formatDate, formatVietnamDateTime, getRatingBadgeClass, getRatingNote, renderStars } from "../../utils";
import { useReviewCard } from "./useHook";

export const RatingDistributionRow = ({ star, count, total, colorClass = "bg-amber-400", onClick = undefined, isActive = false, showPercentText = false }: any) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const percentStr = `${Math.round(pct)}%`;

  const content = (
    <>
      <div className="flex items-center gap-1 w-10 shrink-0 select-none text-left">
        <span className="text-xs font-bold text-slate-650 dark:text-slate-350">{star}</span>
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

export const ReviewCard = (props: any) => {
  const {
    review,
    isOwner = false,
    isEditing = false,
    editComment = "",
    onStartEdit = () => {},
    onCancelEdit = () => {},
    onSaveEdit = () => {},
    onChangeEditComment = () => {},
    onDelete = () => {},
    variant = "card",
  } = props;
  const { timeAgo, translate } = useReviewCard();

  const renderEditing = () => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm grid grid-cols-[auto_1fr] gap-4 text-left">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-700">
          {review.customer?.avatar ? (
            <img src={review.customer.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-450 to-purple-500 flex items-center justify-center text-white font-bold">
              {getInitials(review.customer?.full_name || "Customer")}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{translate("Số sao đánh giá:")}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon key={star} icon="material-symbols:star" className={`text-lg ${star <= review.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`} />
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={editComment}
            onChange={(e) => onChangeEditComment?.(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            required
          />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              {translate("Hủy")}
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-teal-600/10 transition-all cursor-pointer"
            >
              {translate("Lưu")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-205 dark:border-slate-700 shadow-sm grid grid-cols-1 gap-4 hover:shadow-md transition-shadow text-left">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
          {review.customer?.avatar ? (
            <img src={review.customer.avatar} alt={review.customer.full_name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xl border border-slate-100">
              {getInitials(review.customer?.full_name || "Customer")}
            </div>
          )}
          <div>
            <h4 className="text-xl font-bold text-slate-890 dark:text-slate-150 leading-tight">{review.customer?.full_name || "Khách hàng ẩn danh"}</h4>
            <span className="text-base text-slate-400 dark:text-slate-505 font-medium">{formatDate(review.created_at)}</span>
          </div>
          <div className="justify-self-end">{renderStars(review.rating, "text-sm")}</div>
        </div>
        <p className="text-xl text-slate-650 dark:text-slate-200 italic leading-relaxed pl-1 pt-1">"{review.comment || "Không có nội dung lời nhắn"}"</p>
      </div>
    );
  };

  const renderCard = () => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm grid grid-cols-[auto_1fr] gap-4 text-left">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700">
          {review.customer?.avatar ? (
            <img src={review.customer.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(review.customer?.full_name || "Customer")}
            </div>
          )}
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">{review.customer?.full_name || `${translate("Khách hàng")} #${review.customer_id}`}</h4>
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${getRatingBadgeClass(review.rating)}`}>{getRatingNote(review.rating)}</span>
            </div>
            <div className="flex items-center gap-3 sm:justify-self-end">
              <span className="text-xs text-slate-400">{review.created_at ? timeAgo(review.created_at) : ""}</span>
              {isOwner && (
                <div className="flex items-center gap-1.5">
                  <button onClick={onStartEdit} className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer" title={translate("Sửa đánh giá")}>
                    <Icon icon="material-symbols:edit-outline" className="text-lg" />
                  </button>
                  <button onClick={onDelete} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer" title={translate("Xóa đánh giá")}>
                    <Icon icon="material-symbols:delete-outline" className="text-lg" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(review.rating, "text-sm")}
            <span className="text-xs text-slate-400">({review.created_at ? formatVietnamDateTime(review.created_at) : ""})</span>
          </div>
          {review.comment && <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">{review.comment}</p>}
        </div>
      </div>
    );
  };

  const renderLine = () => {
    return (
      <div className="border-b border-slate-100 dark:border-slate-700/50 pb-5 last:border-b-0 last:pb-0 text-left grid grid-cols-[auto_1fr] gap-4">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700">
          {review.customer?.avatar ? (
            <img src={review.customer.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(review.customer?.full_name || "Customer")}
            </div>
          )}
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">{review.customer?.full_name || `${translate("Khách hàng")} #${review.customer_id}`}</h4>
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${getRatingBadgeClass(review.rating)}`}>{getRatingNote(review.rating)}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">({review.created_at ? formatVietnamDateTime(review.created_at) : ""})</span>
            </div>
            <div className="flex items-center gap-3 sm:justify-self-end">
              <span className="text-xs text-slate-400">{review.created_at ? timeAgo(review.created_at) : ""}</span>
              {isOwner && (
                <div className="flex items-center gap-1.5">
                  <button onClick={onStartEdit} className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer" title={translate("Sửa đánh giá")}>
                    <Icon icon="material-symbols:edit-outline" className="text-lg" />
                  </button>
                  <button onClick={onDelete} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer" title={translate("Xóa đánh giá")}>
                    <Icon icon="material-symbols:delete-outline" className="text-lg" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">{renderStars(review.rating, "text-sm")}</div>
          {review.comment && <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">{review.comment}</p>}
        </div>
      </div>
    );
  };

  if (isEditing) return renderEditing();
  if (variant === "dashboard") return renderDashboard();
  if (variant === "line") return renderLine();
  return renderCard();
};
