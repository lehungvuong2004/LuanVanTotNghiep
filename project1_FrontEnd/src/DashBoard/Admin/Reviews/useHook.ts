import { useState, useEffect, useCallback, useRef } from "react";
import { getReviewsAdmin, type Review } from "../../../api/reviews";
import { getUsersAdmin, type User } from "../../../api/users";
import type { ToastProps } from "../../../types/Toast";

export const useAdminReviews = () => {
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
    itemsPerPage,
    toast,
    setToast,
  };
};
