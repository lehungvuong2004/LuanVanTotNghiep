import { useState, useEffect } from "react";
import { getHelperProfileApi } from "../../../api/profileApi/profile";
import { getHelperReviewsPublic } from "../../../api/reviews";
import type { Review } from "../../../api/reviews";

export const useHelperReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingAvg, setRatingAvg] = useState<number | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // 1. Lấy thông tin hồ sơ của Helper đang đăng nhập
        const profileRes = await getHelperProfileApi();
        if (!profileRes.data) {
          setError("Bạn chưa thiết lập hồ sơ người giúp việc.");
          setLoading(false);
          return;
        }
        const helperId = profileRes.data.user_id;

        // 2. Tải danh sách đánh giá của chính Helper này
        const params: { page: number; limit: number; rating?: number } = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (ratingFilter !== "all") {
          params.rating = parseInt(ratingFilter);
        }

        const reviewsRes = await getHelperReviewsPublic(helperId, params);
        setReviews(reviewsRes.data.data);
        setTotalReviews(reviewsRes.data.total);
        setRatingAvg(reviewsRes.rating_avg);
        setRatingDistribution(reviewsRes.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải danh sách đánh giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage, ratingFilter]);

  return {
    reviews,
    totalReviews,
    ratingAvg,
    ratingDistribution,
    loading,
    error,
    currentPage,
    setCurrentPage,
    ratingFilter,
    setRatingFilter,
    itemsPerPage,
  };
};
