import { useState, useEffect, useCallback, useRef } from "react";
import { getReviewsAdmin, createReviewAdmin, updateReviewAdmin, deleteReviewAdmin, type Review } from "../../../api/reviews";
import { getUsersAdmin, type User } from "../../../api/users";
import type { ToastProps } from "../../../types/Toast";
import { RATING_COLORS, SEMANTIC_COLORS } from "../../../utils/colors";

export const useAdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [ratingStats, setRatingStats] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
    setSelectedIds([]);
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
      if (response.rating_stats) {
        setRatingStats(response.rating_stats);
      }
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

  const handleCreateReview = async (data: {
    customer_id: number;
    helper_id: number;
    rating: number;
    comment?: string | null;
  }) => {
    try {
      await createReviewAdmin(data);
      showToast("success", "Thêm đánh giá thành công", "Đã thêm đánh giá mới!");
      await fetchReviews();
    } catch (error: any) {
      showToast("error", "Lỗi thêm đánh giá", error.response?.data?.message || "Không thể thêm đánh giá");
      throw error;
    }
  };

  const handleUpdateReview = async (id: number, data: { rating?: number; comment?: string | null }) => {
    try {
      await updateReviewAdmin(id, data);
      showToast("success", "Cập nhật đánh giá thành công", "Đã cập nhật nội dung đánh giá!");
      await fetchReviews();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật đánh giá", error.response?.data?.message || "Không thể cập nhật đánh giá");
      throw error;
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) return;
    try {
      await deleteReviewAdmin(id);
      showToast("success", "Xóa đánh giá thành công", "Đã xóa đánh giá khỏi hệ thống!");
      await fetchReviews();
    } catch (error: any) {
      showToast("error", "Lỗi xóa đánh giá", error.response?.data?.message || "Không thể xóa đánh giá");
    }
  };

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

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredReviews.length ? [] : filteredReviews.map((r) => r.id)
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} đánh giá đã chọn?`)) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await deleteReviewAdmin(id);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast("success", "Xóa thành công", `Đã xóa vĩnh viễn ${successCount} đánh giá.`);
    }
    if (failCount > 0) {
      showToast("error", "Lỗi xóa", `Thất bại khi xóa ${failCount} đánh giá.`);
    }

    setSelectedIds([]);
    await fetchReviews();
  };

  // ECharts Configurations
  const getRatingDistributionOption = () => {
    const counts = {
      5: ratingStats[5] || 0,
      4: ratingStats[4] || 0,
      3: ratingStats[3] || 0,
      2: ratingStats[2] || 0,
      1: ratingStats[1] || 0,
    };

    const data = [
      { value: counts[5], name: "5 Sao", itemStyle: { color: RATING_COLORS[5] } },
      { value: counts[4], name: "4 Sao", itemStyle: { color: RATING_COLORS[4] } },
      { value: counts[3], name: "3 Sao", itemStyle: { color: RATING_COLORS[3] } },
      { value: counts[2], name: "2 Sao", itemStyle: { color: RATING_COLORS[2] } },
      { value: counts[1], name: "1 Sao", itemStyle: { color: RATING_COLORS[1] } },
    ].filter((item) => item.value > 0);

    if (data.length === 0) {
      data.push({ value: 1, name: "Chưa có đánh giá", itemStyle: { color: SEMANTIC_COLORS.gray } });
    }

    return {
      title: {
        text: "Tỷ Lệ Phân Bố Đánh Giá",
        left: "center",
        textStyle: {
          fontSize: 15,
          fontWeight: "bold",
          color: "#475569",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: <b>{c}</b> ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: "0",
        textStyle: {
          color: "#64748b",
        },
      },
      series: [
        {
          name: "Đánh Giá",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };
  };

  const getRatingBarOption = () => {
    const counts = {
      5: ratingStats[5] || 0,
      4: ratingStats[4] || 0,
      3: ratingStats[3] || 0,
      2: ratingStats[2] || 0,
      1: ratingStats[1] || 0,
    };

    return {
      title: {
        text: "Số Lượng Đánh Giá Chi Tiết",
        left: "center",
        textStyle: {
          fontSize: 15,
          fontWeight: "bold",
          color: "#475569",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "8%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: ["1 Sao", "2 Sao", "3 Sao", "4 Sao", "5 Sao"],
          axisTick: {
            alignWithLabel: true,
          },
          axisLabel: {
            color: "#64748b",
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          minInterval: 1,
          axisLabel: {
            color: "#64748b",
          },
        },
      ],
      series: [
        {
          name: "Số lượng",
          type: "bar",
          barWidth: "45%",
          data: [
            { value: counts[1], itemStyle: { color: RATING_COLORS[1] } },
            { value: counts[2], itemStyle: { color: RATING_COLORS[2] } },
            { value: counts[3], itemStyle: { color: RATING_COLORS[3] } },
            { value: counts[4], itemStyle: { color: RATING_COLORS[4] } },
            { value: counts[5], itemStyle: { color: RATING_COLORS[5] } },
          ],
        },
      ],
    };
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
    itemsPerPage,
    toast,
    setToast,
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
    ratingStats,
    getRatingDistributionOption,
    getRatingBarOption,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
  };
};
