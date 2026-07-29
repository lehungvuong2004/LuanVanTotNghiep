import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { fetchFavorites, toggleFavorite } from "../../redux/favoritesSlice";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, getUserRole } from "../../constants/roles";
import type { RootState } from "../../redux/store";
import type { FavoriteItem } from "../../api/favorites";

export const useHook = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoggedIn, user: currentUser } = useAuth();

  const { items, loading, error } = useAppSelector((state: RootState) => state.favorites);
  const [searchTerm, setSearchTerm] = useState("");

  const isCustomer = isLoggedIn && getUserRole(currentUser) === ROLES.CUSTOMER;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/dang-nhap");
      return;
    }
    if (!isCustomer) {
      navigate("/");
      return;
    }
    dispatch(fetchFavorites());
  }, [dispatch, isLoggedIn, isCustomer, navigate]);

  const handleRemoveFavorite = (helperId: number) => {
    dispatch(toggleFavorite({ helperId, isCurrentlyFavorite: true }));
  };

  const filteredItems = items.filter((item: FavoriteItem) => {
    const profile = item.helper_profile;
    if (!profile) return false;

    const name = (profile as any).user?.full_name?.toLowerCase() || "";
    const bio = profile.bio?.toLowerCase() || "";
    const skills = profile.skills?.map((s: any) => s.service?.name?.toLowerCase() || "").join(" ") || "";
    const search = searchTerm.toLowerCase();

    return name.includes(search) || bio.includes(search) || skills.includes(search);
  });

  return {
    t,
    navigate,
    items,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleRemoveFavorite,
    filteredItems,
  };
};
