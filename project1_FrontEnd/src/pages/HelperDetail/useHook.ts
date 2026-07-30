import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHelperPublic, type HelperProfile } from "../../api/helpers";
import { getHelperReviewsPublic, type Review, type HelperReviewsResponse } from "../../api/reviews";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { fetchFavorites, toggleFavorite } from "../../redux/favoritesSlice";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, getUserRole } from "../../constants/roles";

export const useHelperDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [helper, setHelper] = useState<HelperProfile | null>(null);
  const [reviewData, setReviewData] = useState<HelperReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const dispatch = useAppDispatch();
  const { isLoggedIn, user: currentUser } = useAuth();
  const isCustomer = isLoggedIn && getUserRole(currentUser) === ROLES.CUSTOMER;
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  useEffect(() => {
    if (isCustomer) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isCustomer]);

  const handleToggleFavorite = (helperId: number) => {
    if (!isLoggedIn) {
      navigate("/dang-nhap");
      return;
    }
    if (!isCustomer) return;
    const isCurrentlyFavorite = favoriteIds.includes(helperId);
    dispatch(toggleFavorite({ helperId, isCurrentlyFavorite }));
  };

  useEffect(() => {
    if (!id) return;
    const fetchHelper = async () => {
      setLoading(true);
      try {
        const res = await getHelperPublic(Number(id));
        setHelper(res.data);
      } catch (err) {
        // console.error("Failed to fetch helper:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHelper();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const params: any = { limit: 50 };
        const res = await getHelperReviewsPublic(Number(id), params);
        setReviewData(res);
        setReviews(res.data?.data ?? []);
      } catch (err) {
        // console.error("Failed to fetch reviews:", err);
      }
    };
    fetchReviews();
  }, [id]);

  return {
    id,
    navigate,
    t,
    helper,
    setHelper,
    reviewData,
    setReviewData,
    reviews,
    setReviews,
    loading,
    setLoading,
    ratingFilter,
    setRatingFilter,
    showServiceDropdown,
    setShowServiceDropdown,
    showAllReviews,
    setShowAllReviews,
    isLoggedIn,
    currentUser,
    isCustomer,
    favoriteIds,
    handleToggleFavorite,
  };
};
