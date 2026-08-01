import { Icon } from "@iconify/react";
import { useHook } from "./useHook";
import type { FavoriteItem } from "../../api/favorites";

export const Favorites = () => {
  const {
    t,
    navigate,
    items,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleRemoveFavorite,
    filteredItems,
  } = useHook();

  const renderHelperAvatar = (url?: string, name?: string) => {
    if (url) {
      return <img src={url} alt={name} className="w-full h-full object-cover" />;
    }
    return (
      <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-black text-2xl">
        {name ? name.charAt(0).toUpperCase() : "H"}
      </div>
    );
  };

  const renderHelperCard = (item: FavoriteItem) => {
    const profile = item.helper_profile;
    if (!profile) return null;
    const user = (profile as any).user;
    const cleanName = user?.full_name ?? `Helper #${profile.id}`;
    const skills = profile.skills ?? [];
    const rawAreas = (profile as any).working_areas ?? profile.workingAreas ?? [];
    
    const areaLabel = rawAreas.length > 0
      ? rawAreas.map((a: any) => {
          const distName = a.district?.name ?? a.district;
          return t(distName);
        }).filter(Boolean).slice(0, 2).join(", ")
      : t("TP.HCM");

    return (
      <div
        key={item.id}
        onClick={() => navigate(`/nguoi-giup-viec/${profile.user_id}`)}
        className="col-span-12 sm:col-span-6 lg:col-span-4 relative p-0.5 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
      >
        {/* Dynamic border gradient background on hover */}
        <div className="absolute inset-[-150%] animate-border-spin bg-conic-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

        {/* Inner Card Content */}
        <div className="relative bg-white dark:bg-slate-850 rounded-3xl p-6 flex flex-col w-full h-full z-10">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700 group-hover:border-teal-500 dark:group-hover:border-teal-400 transition-colors duration-300 shrink-0">
              {renderHelperAvatar(user?.avatar, cleanName)}
            </div>
            {/* Name and Rating */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate mb-0.5">{cleanName}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-505 dark:text-slate-200 font-bold mb-1">
                <Icon icon="material-symbols:star" className="text-amber-400 text-sm" />
                <span>{Number(profile.rating_avg).toFixed(1)}</span>
                <span className="text-slate-350 dark:text-slate-300 font-normal">
                  ({profile.total_reviews} {t("đánh giá")})
                </span>
              </div>
              <span className="text-xs text-teal-655 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                {profile.experience_year} {t("năm kinh nghiệm")}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-505 dark:text-slate-200 mt-2 space-y-2 leading-relaxed flex-1">
            {profile.bio && (
              <p className="line-clamp-2 italic text-slate-450 dark:text-slate-305">
                "{profile.bio}"
              </p>
            )}
            {/* Skills tags */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.slice(0, 3).map((s: any) => (
                  <span
                    key={s.id}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    {s.service?.name}
                  </span>
                ))}
              </div>
            )}
            {/* Location info */}
            <div className="flex items-center gap-1 text-base font-bold text-slate-400 dark:text-slate-300 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Icon icon="material-symbols:location-on" className="text-sm text-slate-400" />
              <span className="truncate">{areaLabel}</span>
            </div>
          </div>

          {/* Card Actions */}
          <div className="flex items-center justify-end mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(profile.id);
              }}
              className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-955/20 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl border border-rose-100/50 dark:border-rose-955/20 transition-all duration-300 cursor-pointer shadow-xs active:scale-95 z-10"
              title={t("Bỏ yêu thích")}
            >
              <Icon icon="material-symbols:favorite" className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-850">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="material-symbols:favorite text-rose-500 animate-pulse" />
            <span>{t("Người giúp việc yêu thích")}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-305 mt-2">
            {t("Danh sách chuyên viên xuất sắc bạn đã lưu để đặt lịch nhanh chóng.")}
          </p>
        </div>
        
        {/* Quick Stats Cards */}
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl px-5 py-3 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-955/40 text-rose-500 flex items-center justify-center">
              <Icon icon="material-symbols:favorite" className="text-xl" />
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-305 block font-bold uppercase tracking-wider">{t("Tổng số")}</span>
              <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{items.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSearchFilter = () => {
    if (items.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Icon icon="material-symbols:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-400 text-xl" />
          <input
            type="text"
            placeholder={t("Tìm kiếm theo tên hoặc dịch vụ...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-300 whitespace-nowrap">
          {t("Hiển thị {{count}} kết quả", { count: filteredItems.length })}
        </div>
      </div>
    );
  };

  const renderSkeletonLoading = () => {
    return (
      <div className="grid grid-cols-12 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-3xl p-6 flex flex-col items-center animate-pulse gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-705" />
            <div className="h-5 bg-slate-100 dark:bg-slate-705 rounded w-2/3" />
            <div className="h-4 bg-slate-100 dark:bg-slate-705 rounded w-1/2" />
            <div className="flex gap-2 w-full mt-4">
              <div className="h-10 bg-slate-100 dark:bg-slate-705 rounded-xl flex-1" />
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-705 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderErrorMessage = () => {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs">
        <Icon icon="mdi:alert-circle-outline" className="text-5xl text-rose-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t("Đã xảy ra lỗi")}</h3>
        <p className="text-sm text-slate-450 dark:text-slate-300 mt-1">{error}</p>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-3xl shadow-sm">
        <Icon icon="material-symbols:favorite-outline" className="text-6xl text-slate-350 dark:text-slate-450 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t("Chưa lưu người giúp việc nào")}</h2>
        <p className="text-slate-450 dark:text-slate-305 mt-2 max-w-sm mx-auto text-sm">
          {t("Lưu các người giúp việc bạn thích bằng cách nhấn vào biểu tượng Trái tim để quản lý ở đây.")}
        </p>
        <button
          onClick={() => navigate("/dich-vu")}
          className="mt-6 px-7 py-3 bg-teal-600 hover:bg-teal-750 text-white rounded-full font-bold shadow-md hover:shadow-teal-600/10 active:scale-95 transition-all cursor-pointer"
        >
          {t("Tìm người giúp việc ngay")}
        </button>
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-12 gap-6">
        {filteredItems.map(renderHelperCard)}
      </div>
    );
  };

  const renderMainContent = () => {
    if (loading && items.length === 0) {
      return renderSkeletonLoading();
    }
    if (error) {
      return renderErrorMessage();
    }
    if (filteredItems.length > 0) {
      return renderGrid();
    }
    return renderEmptyState();
  };

  return (
    <div className="max-w-8xl py-16 min-h-screen dark:bg-slate-900 text-slate-805 dark:text-slate-100">
      {renderHeader()}
      {renderSearchFilter()}
      {renderMainContent()}
    </div>
  );
};

export default Favorites;
