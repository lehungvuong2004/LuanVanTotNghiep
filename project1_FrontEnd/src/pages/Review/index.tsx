import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useReview } from "./useHook";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  helperId: number;
  helperName: string;
  helperAvatar?: string;
  bookingId?: number | null;
  jobPostId?: number | null;
  onSuccess?: () => void;
}

export const ReviewModal = ({ isOpen, onClose, helperId, helperName, helperAvatar, bookingId, jobPostId, onSuccess }: ReviewModalProps) => {
  const { t } = useTranslation();
  const { reviewForm, setReviewForm, isSubmitting, handleSubmitReview } = useReview();

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleStarClick = (rating: number) => {
    setReviewForm((prev) => ({ ...prev, rating }));
  };

  const handleStarMouseEnter = (rating: number) => {
    setHoverRating(rating);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmitReview({
      helper_id: helperId,
      booking_id: bookingId,
      job_post_id: jobPostId,
      onSuccess: () => {
        if (onSuccess) onSuccess();
        onClose();
      },
    });
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop";
  const avatarUrl = helperAvatar ? (helperAvatar.startsWith("http") ? helperAvatar : `http://localhost:8000${helperAvatar}`) : defaultAvatar;

  const renderHeader = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
      <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
        <Icon icon="material-symbols:star-outline-rounded" className="text-2xl text-[#026E5F] dark:text-teal-400" />
        {t("review.title")}
      </h3>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
      >
        <Icon icon="material-symbols:close" className="text-xl" />
      </button>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5 text-center">
      <div className="flex flex-col items-center gap-2">
        <img src={avatarUrl} alt={helperName} className="w-20 h-20 rounded-full object-cover border-4 border-[#026E5F]/10 dark:border-teal-500/20 shadow-md" />
        <span className="text-base font-bold text-slate-800 dark:text-slate-100">{helperName}</span>
        <p className="text-xs text-slate-400 max-w-xs">{t("review.description")}</p>
      </div>

      {/* Stars Selection */}
      <div className="flex items-center justify-center gap-2 my-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = hoverRating !== null ? star <= hoverRating : star <= reviewForm.rating;
          return (
            <button
              type="button"
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarMouseEnter(star)}
              onMouseLeave={handleStarMouseLeave}
              className="p-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none hover:scale-125 transition-transform duration-150 cursor-pointer"
            >
              <Icon
                icon={isFilled ? "material-symbols:star-rounded" : "material-symbols:star-outline-rounded"}
                className={`text-4xl ${isFilled ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}`}
              />
            </button>
          );
        })}
      </div>

      {/* Rating explanation text */}
      <div className="text-xs font-bold text-[#026E5F] dark:text-teal-400 h-4">
        {reviewForm.rating === 1 && t("review.rating_1")}
        {reviewForm.rating === 2 && t("review.rating_2")}
        {reviewForm.rating === 3 && t("review.rating_3")}
        {reviewForm.rating === 4 && t("review.rating_4")}
        {reviewForm.rating === 5 && t("review.rating_5")}
      </div>

      {/* Comment Area */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("review.comment_label")}</label>
        <textarea
          value={reviewForm.comment}
          onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
          placeholder={t("review.comment_placeholder")}
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-[#026E5F] dark:focus:border-teal-500 focus:outline-none transition resize-none leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition cursor-pointer text-sm"
        >
          {t("Hủy")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#026E5F] hover:bg-[#01564a] text-white font-bold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Icon icon="line-md:loading-twotone-loop" className="text-lg" />
              {t("Đang gửi...")}
            </>
          ) : (
            t("Gửi đánh giá")
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-850 w-full max-w-md rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {renderHeader()}
        {renderForm()}
      </div>
    </div>
  );
};
