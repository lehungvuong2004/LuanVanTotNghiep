import { useState, useEffect, useCallback, useRef } from "react";
import { getReviewsAdmin, deleteReviewAdmin, updateReviewAdmin, type Review } from "../../../api/reviews";
import { getUsersAdmin, type User } from "../../../api/users";
import type { ToastProps } from "../../../types/Toast";

export const useStaffReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<ToastProps | null>(null);
  const timerRef = useRef<any>(null);

  const showToast = useCallback((type: ToastProps["type"], title: string, message?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ type, title, message });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Fetch users map for name/avatar resolving
  const fetchUsersMap = useCallback(async () => {
    try {
      const response = await getUsersAdmin({ limit: 200 });
      const usersList = response.data.data || [];
      const map: Record<number, User> = {};
      usersList.forEach((u) => {
        map[u.id] = u;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to load users map", error);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const ratingParam = ratingFilter !== "all" ? parseInt(ratingFilter) : undefined;
      const response = await getReviewsAdmin({
        page: currentPage,
        limit: itemsPerPage,
        rating: ratingParam,
      });

      setReviews(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [currentPage, ratingFilter, itemsPerPage, showToast]);

  // Load initial data
  useEffect(() => {
    let active = true;
    const init = async () => {
      await Promise.resolve();
      if (active) {
        await fetchUsersMap();
        await fetchReviews();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchUsersMap, fetchReviews]);

  // Filter reviews by helper or customer name locally if searched
  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const customer = usersMap[r.customer_id];
    const helper = usersMap[r.helper_id];
    const cName = customer?.full_name?.toLowerCase() || "";
    const hName = helper?.full_name?.toLowerCase() || "";
    const comment = r.comment?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return cName.includes(query) || hName.includes(query) || comment.includes(query);
  });

  // Action methods
  const openEditModal = (review: Review) => {
    setSelectedReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedReview(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    setSaving(true);
    try {
      await updateReviewAdmin(selectedReview.id, {
        rating: editRating,
        comment: editComment,
      });
      showToast("success", "Thành công", "Đã cập nhật đánh giá thành công.");
      closeEditModal();
      await fetchReviews();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật", error.response?.data?.message || "Không thể cập nhật đánh giá này");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa/ẩn đánh giá này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await deleteReviewAdmin(id);
      showToast("success", "Thành công", "Đã xóa đánh giá thành công.");
      await fetchReviews();
    } catch (error: any) {
      showToast("error", "Lỗi khi xóa", error.response?.data?.message || "Không thể xóa đánh giá này");
    }
  };

  return {
    reviews: filteredReviews,
    usersMap,
    loading,
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    toast,
    setToast,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    selectedReview,
    editRating,
    setEditRating,
    editComment,
    setEditComment,
    saving,
    handleUpdateReview,
    handleDeleteReview,
    itemsPerPage,
  };
};
