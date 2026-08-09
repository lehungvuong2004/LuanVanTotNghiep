import { Icon } from "@iconify/react";
import { ReviewCard, RatingDistributionRow, ReviewFilters } from "../../components/Reviews";
import { useHelperDetail } from "./useHook";
import { ExpandToggleButton } from "../../components/ExpandToggleButton";
import { Loading } from "../../components/Commom";

export const HelperDetail = () => {
  const {
    navigate,
    t,
    helper,
    reviewData,
    reviews,
    loading,
    ratingFilter,
    setRatingFilter,
    showAllReviews,
    setShowAllReviews,
    favoriteIds,
    isCustomer,
    handleToggleFavorite,
    showServiceDropdown,
    setShowServiceDropdown,
  } = useHelperDetail();

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-slate-900 pt-8">
        <Loading />
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="min-h-screen dark:bg-slate-900 pt-8 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="material-symbols:person-off-outline" className="text-6xl text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300">{t("Không tìm thấy nhân viên")}</h2>
          <button onClick={() => navigate("/dich-vu")} className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold cursor-pointer">
            {t("Quay lại")}
          </button>
        </div>
      </div>
    );
  }

  const user = (helper as any).user;
  const skills = helper.skills ?? [];
  const rawAreas = (helper as any).working_areas ?? helper.workingAreas ?? [];
  const ratingDist = reviewData?.rating_distribution ?? {};

  const renderBreadcrumb = () => (
    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
      <button onClick={() => navigate("/")} className="hover:text-teal-600 cursor-pointer">
        {t("Trang chủ")}
      </button>
      <Icon icon="material-symbols:chevron-right" className="text-base" />
      <button onClick={() => navigate("/dich-vu")} className="hover:text-teal-600 cursor-pointer">
        {t("Dịch vụ")}
      </button>
      <Icon icon="material-symbols:chevron-right" className="text-base" />
      <span className="text-slate-800 dark:text-slate-100 font-semibold">{user?.full_name ?? `Helper #${helper.id}`}</span>
    </nav>
  );

  const renderProfileHeader = () => (
    <div className="bg-transparent dark:bg-transparent md:bg-white md:dark:bg-slate-800 rounded-3xl border-0 md:border border-slate-100 dark:border-slate-700/50 p-0 md:p-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500/20 shadow-xl">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-4xl">
                {(user?.full_name ?? "H").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100">{user?.full_name ?? `Helper #${helper.id}`}</h1>
            {isCustomer && (
              <button
                type="button"
                onClick={() => handleToggleFavorite(helper.id)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-705 rounded-full border border-slate-200/50 dark:border-slate-700 transition-all duration-300 hover:scale-110 cursor-pointer shadow-xs active:scale-95 group/heart"
              >
                <Icon
                  icon={favoriteIds.includes(helper.id) ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                  className={`text-2xl transition-colors ${favoriteIds.includes(helper.id) ? "text-rose-500 fill-rose-500" : "text-slate-400 group-hover/heart:text-rose-550"}`}
                />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Icon icon="material-symbols:star" className="text-amber-400 text-lg" />
              <span className="font-bold">{Number(helper.rating_avg).toFixed(1)}</span>
              <span className="text-slate-400">
                ({helper.total_reviews} {t("đánh giá")})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Icon icon="material-symbols:work-history-outline" className="text-blue-500 text-lg" />
              <span>
                {helper.experience_year} {t("năm kinh nghiệm")}
              </span>
            </div>
            {helper.gender && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <Icon icon={helper.gender === "female" ? "material-symbols:female" : "material-symbols:male"} className="text-pink-500 text-lg" />
                <span>{helper.gender === "female" ? t("Nữ") : t("Nam")}</span>
              </div>
            )}
          </div>

          {helper.bio && <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 max-w-2xl">{helper.bio}</p>}

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <span key={skill.id} className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Icon icon="material-symbols:check-circle" className="text-sm text-teal-500" />
                {skill.service?.name ?? `Kỹ năng #${skill.service_id}`}
              </span>
            ))}
          </div>

          {/* Working Areas */}
          {rawAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rawAreas.map((area: any) => (
                <span key={area.id} className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Icon icon="material-symbols:location-on-outline" className="text-sm" />
                  {area.district?.name ?? area.district}, {area.city?.name ?? area.city}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="flex flex-col gap-3 min-w-48 w-full md:w-auto relative">
          <button
            onClick={() => {
              if (skills.length === 0) {
                alert(t("Nhân viên này chưa đăng ký kỹ năng dịch vụ nào."));
                return;
              }
              if (skills.length === 1) {
                const skill = skills[0];
                navigate(`/dich-vu/${skill.service_id}?helperId=${helper.id}`);
                return;
              }
              setShowServiceDropdown((prev) => !prev);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-teal-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 w-full text-sm"
          >
            <Icon icon="material-symbols:calendar-add-on-outline" className="text-xl" />
            {t("Đặt lịch")}
          </button>

          {/* Dropdown to select service if helper has multiple skills */}
          {showServiceDropdown && skills.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("Chọn dịch vụ đặt lịch")}</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setShowServiceDropdown(false);
                      navigate(`/dich-vu/${skill.service_id}?helperId=${helper.id}`);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex justify-between items-center cursor-pointer"
                  >
                    <span>{skill.service?.name ?? `Dịch vụ #${skill.service_id}`}</span>
                    <Icon icon="material-symbols:chevron-right" className="text-slate-400 text-base" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <a
            href={user?.phone ? `tel:${user.phone}` : "javascript:void(0)"}
            onClick={(e) => {
              if (!user?.phone) {
                e.preventDefault();
                alert(t("Nhân viên này chưa cập nhật số điện thoại."));
              }
            }}
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl font-bold hover:border-teal-500 hover:text-teal-600 transition-all cursor-pointer flex items-center justify-center gap-2 w-full text-sm"
          >
            <Icon icon="material-symbols:call-outline" className="text-xl text-teal-600" />
            {t("Liên hệ")}
          </a>
        </div>
      </div>
    </div>
  );

  const renderReviewsSection = () => (
    <div className="bg-transparent dark:bg-transparent md:bg-white md:dark:bg-slate-800 rounded-3xl border-0 md:border border-slate-100 dark:border-slate-700/50 p-0 md:p-8">
      <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <Icon icon="material-symbols:reviews-outline" className="text-2xl text-teal-600" />
        {t("Đánh giá từ khách hàng")}
        {reviewData && (
          <span className="text-sm font-normal text-slate-400 ml-2">
            ({reviewData.total_reviews} {t("đánh giá")})
          </span>
        )}
      </h2>

      {/* Rating Summary */}
      {reviewData && reviewData.total_reviews > 0 && (
        <div className="flex flex-col md:flex-row gap-8 items-center mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
          <div className="text-center min-w-32">
            <div className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{reviewData.rating_avg?.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon key={star} icon="material-symbols:star" className={`text-lg ${star <= Math.round(reviewData.rating_avg ?? 0) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}`} />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingDistributionRow
                key={star}
                star={star}
                count={ratingDist[star] ?? 0}
                total={reviewData.total_reviews}
                isActive={ratingFilter === star}
                onClick={() => {
                  setRatingFilter(ratingFilter === star ? "all" : star);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Review Filters */}
      <ReviewFilters ratingFilter={ratingFilter} setRatingFilter={setRatingFilter} t={t} />

      <div className="space-y-4 mt-8">
        {(() => {
          let filtered = reviews;
          if (ratingFilter !== "all") {
            filtered = filtered.filter((r) => r.rating === ratingFilter);
          }
          const displayedReviews = showAllReviews ? filtered : filtered.slice(0, 3);

          return displayedReviews.length > 0 ? (
            displayedReviews.map((review) => <ReviewCard key={review.id} review={review} variant="line" t={t} />)
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Icon icon="material-symbols:rate-review-outline" className="text-4xl mb-2 mx-auto" />
              <p className="font-semibold">{ratingFilter !== "all" ? t("Không có đánh giá nào phù hợp với bộ lọc.") : t("Chưa có đánh giá nào.")}</p>
            </div>
          );
        })()}

        {reviews.length > 3 && (
          <div className="flex justify-center pt-2">
            <ExpandToggleButton isExpanded={showAllReviews} onClick={() => setShowAllReviews(!showAllReviews)} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-slate-900 pt-6 pb-16">
      <div className="max-w-8xl">
        {renderBreadcrumb()}
        <div className="grid grid-cols-1 gap-8">
          {renderProfileHeader()}
          {renderReviewsSection()}
        </div>
      </div>
    </div>
  );
};

export default HelperDetail;
