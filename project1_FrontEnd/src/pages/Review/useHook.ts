import { useState, useCallback } from "react";
import { createReviewCustomer, updateReviewCustomer, deleteReviewCustomer, getHelperReviewsPublic, type Review, type HelperReviewsResponse } from "../../api/reviews";

export interface ReviewForm {
  rating: number;
  comment: string;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export const useReview = () => {
  // ── Form state ─────────────────────────────────────────
  const [reviewForm, setReviewForm] = useState<ReviewForm>({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Edit state ──────────────────────────────────────────
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState<ReviewForm>({ rating: 5, comment: "" });
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ── Delete state ────────────────────────────────────────
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Helper reviews state ────────────────────────────────
  const [helperReviews, setHelperReviews] = useState<HelperReviewsResponse | null>(null);
  const [isLoadingHelperReviews, setIsLoadingHelperReviews] = useState(false);

  // ── Toast ────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  // ── Submit new review ────────────────────────────────────
  const handleSubmitReview = useCallback(
    async (params: { helper_id: number; booking_id?: number | null; job_post_id?: number | null; onSuccess?: () => void }) => {
      if (reviewForm.rating < 1 || reviewForm.rating > 5) return;
      setIsSubmitting(true);
      try {
        await createReviewCustomer({
          helper_id: params.helper_id,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim() || null,
          booking_id: params.booking_id ?? null,
          job_post_id: params.job_post_id ?? null,
        });
        showToast("Cảm ơn bạn đã đánh giá người giúp việc!", "success");
        setReviewForm({ rating: 5, comment: "" });
        params.onSuccess?.();
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Gửi đánh giá thất bại. Vui lòng thử lại.";
        showToast(msg, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reviewForm],
  );

  // ── Open edit modal ──────────────────────────────────────
  const openEditReview = useCallback((review: Review) => {
    setEditingReview(review);
    setEditForm({ rating: review.rating, comment: review.comment ?? "" });
    setIsEditOpen(true);
  }, []);

  const closeEditReview = useCallback(() => {
    setIsEditOpen(false);
    setEditingReview(null);
  }, []);

  // ── Submit edit ──────────────────────────────────────────
  const handleUpdateReview = useCallback(
    async (onSuccess?: () => void) => {
      if (!editingReview) return;
      setIsSubmitting(true);
      try {
        await updateReviewCustomer(editingReview.id, {
          rating: editForm.rating,
          comment: editForm.comment.trim() || null,
        });
        showToast("Cập nhật đánh giá thành công!", "success");
        closeEditReview();
        onSuccess?.();
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
        showToast(msg, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingReview, editForm, closeEditReview],
  );

  // ── Delete confirm ───────────────────────────────────────
  const openDeleteConfirm = useCallback((reviewId: number) => {
    setDeletingReviewId(reviewId);
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeletingReviewId(null);
  }, []);

  const handleDeleteReview = useCallback(
    async (onSuccess?: () => void) => {
      if (!deletingReviewId) return;
      setIsDeleting(true);
      try {
        await deleteReviewCustomer(deletingReviewId);
        showToast("Đã xóa đánh giá thành công!", "success");
        closeDeleteConfirm();
        onSuccess?.();
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Xóa đánh giá thất bại.";
        showToast(msg, "error");
      } finally {
        setIsDeleting(false);
      }
    },
    [deletingReviewId, closeDeleteConfirm],
  );

  // ── Load helper reviews ──────────────────────────────────
  const loadHelperReviews = useCallback(async (helperId: number, params?: { page?: number; rating?: number }) => {
    setIsLoadingHelperReviews(true);
    try {
      const data = await getHelperReviewsPublic(helperId, params);
      setHelperReviews(data);
    } catch {
      setHelperReviews(null);
    } finally {
      setIsLoadingHelperReviews(false);
    }
  }, []);

  return {
    // Form
    reviewForm,
    setReviewForm,
    isSubmitting,
    handleSubmitReview,
    // Edit
    editingReview,
    editForm,
    setEditForm,
    isEditOpen,
    openEditReview,
    closeEditReview,
    handleUpdateReview,
    // Delete
    deletingReviewId,
    isDeleteConfirmOpen,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteReview,
    // Helper reviews
    helperReviews,
    isLoadingHelperReviews,
    loadHelperReviews,
    // Toast
    toast,
    setToast,
  };
};
