import { useState } from "react";
import { Icon } from "@iconify/react";

import { useServiceDetail } from "./useHook";
import { formatVietnamDateTime, getRatingNote, formatNumberVI, parseUtcDate, getRatingBadgeClass } from "../../utils";

function priceTypeLabel(pt: string) {
  if (pt === "hourly") return "giờ";
  if (pt === "daily") return "ngày";
  return "lần";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - parseUtcDate(dateStr).getTime();
  if (diff < 60000) return "Vừa xong";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

export const ServiceDetail = () => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const {
    navigate,
    t,
    detail,
    reviews,
    loading,
    activeTab,
    setActiveTab,
    currentUser,
    isCustomer,
    selectedHelperId,
    setSelectedHelperId,
    reviewStats,
    
    
    formRating,
    setFormRating,
    formComment,
    setFormComment,
    formHelperId,
    setFormHelperId,
    submitting,
    editingReviewId,
    setEditingReviewId,
    editRating,
    editComment,
    setEditComment,
    helpers,
    handleCreateReview,
    startEdit,
    handleUpdateReview,
    handleDeleteReview,

    // Booking states & functions
    isBookingModalOpen,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    bookingDate,
    setBookingDate,
    bookingTime,
    setBookingTime,
    durationHours,
    setDurationHours,
    bookingNote,
    setBookingNote,
    preferSelectedHelper,
    setPreferSelectedHelper,
    isBookingSubmitting,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddress,
    setNewAddress,
    newDistrict,
    setNewDistrict,
    newCity,
    setNewCity,
    openBookingModal,
    closeBookingModal,
    handleAddNewAddress,
    handleCreateBooking } = useServiceDetail();

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-slate-900 pt-8">
        <div className="max-w-6xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 h-96 bg-slate-200 dark:bg-slate-700 rounded-3xl" />
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-700 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!detail || !detail.data) {
    return (
      <div className="min-h-screen dark:bg-slate-900 pt-8 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="material-symbols:error-outline" className="text-6xl text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300">{t("Không tìm thấy dịch vụ")}</h2>
          <button onClick={() => navigate("/dich-vu")} className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold">
            {t("Quay lại")}
          </button>
        </div>
      </div>
    );
  }

  const service = detail.data;
  const ratingStats = detail.rating_stats;

  const statsToDisplay = reviewStats
    ? {
        avg_rating: reviewStats.rating_avg,
        total_reviews: reviewStats.total_reviews,
        rating_distribution: reviewStats.rating_distribution }
    : ratingStats;

  // ─── Render Functions ───────────────────────────────────────────

  const renderBreadcrumb = () => (
    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
      <button onClick={() => navigate("/")} className="hover:text-teal-600 transition-colors cursor-pointer">
        {t("Trang chủ")}
      </button>
      <Icon icon="material-symbols:chevron-right" className="text-base" />
      <button onClick={() => navigate("/dich-vu")} className="hover:text-teal-600 transition-colors cursor-pointer">
        {t("Dịch vụ")}
      </button>
      <Icon icon="material-symbols:chevron-right" className="text-base" />
      <span className="text-slate-800 dark:text-slate-100 font-semibold">{service.name}</span>
    </nav>
  );

  const renderHeroSection = () => {
    const selectedHelperObj = helpers.find((h) => h.id === selectedHelperId);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
        {/* Image */}
        <div className="lg:col-span-3 rounded-3xl overflow-hidden aspect-video relative group bg-slate-100 dark:bg-slate-900">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
              <Icon icon="mdi:home-heart" className="text-8xl opacity-80" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">{service.category?.name ?? "Dịch vụ"}</span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-8 flex flex-col">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">{service.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{service.description ?? t("Dịch vụ chuyên nghiệp, chất lượng cao.")}</p>

          {/* Selected Helper Info Box */}
          {selectedHelperObj && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2.5 text-left">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("Nhân viên đang chọn")}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {selectedHelperObj.experience_year} {t("năm kinh nghiệm")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  {selectedHelperObj.user?.avatar ? (
                    <img src={selectedHelperObj.user.avatar} alt={selectedHelperObj.user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {(selectedHelperObj.user?.full_name ?? "H").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedHelperObj.user?.full_name ?? `Helper #${selectedHelperObj.id}`}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Giới tính: {selectedHelperObj.gender === "male" ? t("Nam") : t("Nữ")}</span>
                    {selectedHelperObj.user?.phone && (
                      <>
                        <span>•</span>
                        <span>Số điện thoại: {selectedHelperObj.user.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedHelperObj.address && (
                <div className="flex items-start gap-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <Icon icon="material-symbols:location-on-outline" className="text-base text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Địa chỉ:{selectedHelperObj.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl p-4 text-center">
              <Icon icon="material-symbols:star" className="text-2xl text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats?.avg_rating?.toFixed(1) ?? "N/A"}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t("Đánh giá")}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 text-center">
              <Icon icon="material-symbols:group-outline" className="text-2xl text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{detail.helpers_count}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t("Nhân viên")}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-4 text-center">
              <Icon icon="material-symbols:rate-review-outline" className="text-2xl text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{ratingStats?.total_reviews ?? 0}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t("Đánh giá")}</div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t("Giá từ")}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{formatNumberVI(Number(service.base_price))}đ</span>
                  <span className="text-sm text-slate-400">/{priceTypeLabel(service.price_type)}</span>
                </div>
              </div>
              <button
                onClick={openBookingModal}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {t("Đặt ngay")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabNavigation = () => (
    <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-700/50 mb-8 w-fit">
      <button
        onClick={() => setActiveTab("helpers")}
        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
          activeTab === "helpers" ? "bg-teal-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        <Icon icon="material-symbols:group" className="inline mr-2 text-base align-text-bottom" />
        {t("Nhân viên")} ({detail.helpers_count})
      </button>
      <button
        onClick={() => setActiveTab("reviews")}
        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
          activeTab === "reviews" ? "bg-teal-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        <Icon icon="material-symbols:reviews-outline" className="inline mr-2 text-base align-text-bottom" />
        {t("Đánh giá")} ({ratingStats?.total_reviews ?? 0})
      </button>
    </div>
  );

  const renderHelpersTab = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {helpers.length > 0 ? (
        helpers.map((helper: any) => (
          <div
            key={helper.id}
            onClick={() => navigate(`/nguoi-giup-viec/${helper.user_id || helper.id}`)}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-700 group-hover:border-teal-500 transition-colors">
              {helper.user?.avatar ? (
                <img src={helper.user.avatar} alt={helper.user.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {(helper.user?.full_name ?? "H").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{helper.user?.full_name ?? `Helper #${helper.id}`}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-1">
              <Icon icon="material-symbols:star" className="text-base" />
              {Number(helper.rating_avg).toFixed(1)}
              <span className="text-slate-400 font-normal">
                ({helper.total_reviews} {t("đánh giá")})
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {helper.experience_year} {t("năm kinh nghiệm")}
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center mt-auto">
              {(helper.skills ?? []).slice(0, 2).map((skill: any) => (
                <span key={skill.id} className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                  {skill.service?.name}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-16 text-slate-400">
          <Icon icon="material-symbols:person-search-outline" className="text-5xl mb-3 mx-auto" />
          <p className="font-semibold">{t("Chưa có nhân viên nào cho dịch vụ này.")}</p>
        </div>
      )}
    </div>
  );

  const renderHelperSelector = () => {
    if (helpers.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-between shadow-sm">
        <div className="text-left sm:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{t("Xem đánh giá theo nhân viên")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("Chọn nhân viên để xem các đánh giá chi tiết từ khách hàng.")}</p>
        </div>
        <select
          value={selectedHelperId ?? ""}
          onChange={(e) => setSelectedHelperId(Number(e.target.value))}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all sm:col-span-1 w-full"
        >
          {helpers.map((h: any) => (
            <option key={h.id} value={h.id}>
              {h.user?.full_name ?? `Helper #${h.id}`}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderRatingSummary = () => {
    if (!statsToDisplay) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center shadow-sm">
        <div className="text-center md:col-span-1 w-full">
          <div className="text-5xl font-extrabold text-slate-800 dark:text-slate-100">{statsToDisplay.avg_rating ? Number(statsToDisplay.avg_rating).toFixed(1) : "0.0"}</div>
          <div className="flex justify-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                icon="material-symbols:star"
                className={`text-xl ${star <= Math.round(Number(statsToDisplay.avg_rating ?? 0)) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}`}
              />
            ))}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {statsToDisplay.total_reviews} {t("đánh giá")}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2 w-full">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = statsToDisplay.rating_distribution?.[star] ?? 0;
            const pct = statsToDisplay.total_reviews > 0 ? (count / statsToDisplay.total_reviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 w-6 text-right">{star}</span>
                <Icon icon="material-symbols:star" className="text-amber-400 text-sm" />
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReviewForm = () => {
    if (!isCustomer || helpers.length === 0) return null;
    return (
      <form onSubmit={handleCreateReview} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 space-y-4 shadow-sm text-left">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t("Viết đánh giá của bạn")}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Select Helper to Review */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Chọn nhân viên để đánh giá")}</label>
            <select
              value={formHelperId ?? ""}
              onChange={(e) => setFormHelperId(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
            >
              {helpers.map((h: any) => (
                <option key={h.id} value={h.id}>
                  {h.user?.full_name ?? `Helper #${h.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Select */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Số sao đánh giá")}</label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setFormRating(star)} className="text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer">
                  <Icon icon="material-symbols:star" className={star <= formRating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Bình luận")}</label>
          <textarea
            rows={4}
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder={t("Hãy chia sẻ trải nghiệm của bạn về nhân viên này...")}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-750 dark:text-slate-350 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-teal-600/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? t("Đang gửi...") : t("Gửi đánh giá")}
          </button>
        </div>
      </form>
    );
  };

  const renderReviewsList = () => {
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
      <div className="space-y-4">
        {displayedReviews.length > 0 ? (
          <>
            {displayedReviews.map((review) => {
              const isEditing = editingReviewId === review.id;
              const isOwner = currentUser && review.customer_id === currentUser.id;

              return (
                <div key={review.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-700">
                      {review.customer?.avatar ? (
                        <img src={review.customer.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {(review.customer?.full_name ?? "K").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-4 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Số sao đánh giá:")}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Icon key={star} icon="material-symbols:star" className={`text-lg ${star <= editRating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`} />
                              ))}
                            </div>
                          </div>

                          <textarea
                            rows={3}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            required
                          />

                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingReviewId(null)}
                              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                            >
                              {t("Hủy")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateReview(review.id)}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-teal-600/10 transition-all cursor-pointer"
                            >
                              {t("Lưu")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-800 dark:text-slate-100">{review.customer?.full_name ?? `Khách hàng #${review.customer_id}`}</h4>
                              <span className="text-xs text-slate-400">({review.created_at ? formatVietnamDateTime(review.created_at) : ""})</span>
                              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getRatingBadgeClass(review.rating)}`}>{getRatingNote(review.rating)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">{review.created_at ? timeAgo(review.created_at) : ""}</span>
                              {isOwner && (
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => startEdit(review)} className="text-slate-400 hover:text-teal-600 transition-colors cursor-pointer" title={t("Sửa đánh giá")}>
                                    <Icon icon="material-symbols:edit-outline" className="text-lg" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                                    title={t("Xóa đánh giá")}
                                  >
                                    <Icon icon="material-symbols:delete-outline" className="text-lg" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon key={star} icon="material-symbols:star" className={`text-sm ${star <= review.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}`} />
                            ))}
                          </div>
                          {review.comment && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {reviews.length > 3 && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {showAllReviews ? (
                    <>
                      {t("Thu gọn")}
                      <Icon icon="material-symbols:keyboard-arrow-up-rounded" className="text-base" />
                    </>
                  ) : (
                    <>
                      {t("Xem thêm")}
                      <Icon icon="material-symbols:keyboard-arrow-down-rounded" className="text-base" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
            <Icon icon="material-symbols:rate-review-outline" className="text-5xl mb-3 mx-auto" />
            <p className="font-semibold">{t("Chưa có đánh giá nào.")}</p>
          </div>
        )}
      </div>
    );
  };

  const renderReviewsTab = () => (
    <div className="space-y-6 text-left">
      {renderHelperSelector()}
      {renderRatingSummary()}
      {renderReviewForm()}
      {renderReviewsList()}
    </div>
  );

  const renderBookingModal = () => {
    if (!isBookingModalOpen) return null;

    const selectedHelperObj = helpers.find((h) => h.id === selectedHelperId);
    const selectedHelperName = selectedHelperObj?.user?.full_name ?? t("Nhân viên");

    const totalPrice = Number(service.base_price) * durationHours;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeBookingModal}></div>

        <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon icon="material-symbols:book-online-outline-rounded" className="text-teal-600 text-2xl" />
                {t("Đặt Lịch Dịch Vụ")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{service.name}</p>
            </div>
            <button onClick={closeBookingModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            {/* Address Selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Địa chỉ nhận việc")}</label>
                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer flex items-center gap-0.5"
                  >
                    <Icon icon="material-symbols:add" /> {t("Thêm địa chỉ mới")}
                  </button>
                )}
              </div>

              {isAddingNewAddress ? (
                <form onSubmit={handleAddNewAddress} className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("Địa chỉ cụ thể (Số nhà, đường...)")}</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder={t("Ví dụ: 123 Nguyễn Văn Cừ")}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("Quận/Huyện")}</label>
                      <select
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100"
                      >
                        {[
                          "Quận 1",
                          "Quận 3",
                          "Quận 4",
                          "Quận 5",
                          "Quận 6",
                          "Quận 7",
                          "Quận 8",
                          "Quận 10",
                          "Quận 11",
                          "Quận 12",
                          "Bình Thạnh",
                          "Gò Vấp",
                          "Tân Bình",
                          "Tân Phú",
                          "Phú Nhuận",
                          "Thủ Đức",
                          "Bình Tân",
                        ].map((d) => (
                          <option
                            key={d}
                            value={d === "Bình Thạnh" || d === "Gò Vấp" || d === "Tân Bình" || d === "Tân Phú" || d === "Phú Nhuận" || d === "Thủ Đức" || d === "Bình Tân" ? `Quận ${d}` : d}
                          >
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t("Tỉnh/Thành phố")}</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                    >
                      {t("Hủy")}
                    </button>
                    <button type="submit" className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all">
                      {t("Lưu địa chỉ")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="relative">
                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ""}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.address}, {addr.district}, {addr.city} {addr.is_default ? `(${t("Mặc định")})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                      <Icon icon="material-symbols:warning-amber-rounded" className="text-lg shrink-0" />
                      <div>
                        {t("Bạn chưa có địa chỉ nhận việc nào.")}{" "}
                        <button type="button" onClick={() => setIsAddingNewAddress(true)} className="underline font-bold hover:text-amber-700">
                          {t("Thêm địa chỉ ngay")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date & Time Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Ngày làm việc")}</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Giờ làm việc")}</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Duration Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Thời lượng làm việc")}</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                <option value={2}>2 {t("giờ")}</option>
                <option value={4}>4 {t("giờ")}</option>
                <option value={6}>6 {t("giờ")}</option>
                <option value={8}>8 {t("giờ")}</option>
              </select>
            </div>

            {/* Helper Preference */}
            {selectedHelperId && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preferSelectedHelper}
                    onChange={(e) => setPreferSelectedHelper(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500/20 border-slate-300 accent-teal-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t("Yêu cầu đích danh nhân viên")}: <span className="text-teal-600 font-extrabold">{selectedHelperName}</span>
                  </span>
                </label>
                <p className="text-xs text-slate-400 ml-6 leading-relaxed">
                  {t("Hệ thống sẽ gửi yêu cầu trực tiếp đến nhân viên này. Nếu bỏ chọn, hệ thống sẽ tự động tìm nhân viên phù hợp gần nhất.")}
                </p>
              </div>
            )}

            {/* Booking Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Ghi chú thêm")}</label>
              <textarea
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                placeholder={t("Nhập yêu cầu đặc biệt hoặc ghi chú cho nhân viên...")}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>

            {/* Price Estimation */}
            <div className="p-4 bg-teal-50/50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-900/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider">{t("Tổng cộng (tạm tính)")}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatNumberVI(Number(service.base_price))}đ x {durationHours} {t("giờ")}
                </p>
              </div>
              <p className="text-xl font-extrabold text-teal-600 dark:text-teal-400">{formatNumberVI(totalPrice)}đ</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              onClick={closeBookingModal}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-300"
            >
              {t("Hủy")}
            </button>
            <button
              onClick={handleCreateBooking}
              disabled={isBookingSubmitting}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isBookingSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("Đang đặt lịch...")}
                </>
              ) : (
                t("Xác nhận đặt lịch")
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 pt-6 pb-16">
      
      {renderBreadcrumb()}
      {renderHeroSection()}
      {renderTabNavigation()}
      {activeTab === "helpers" && renderHelpersTab()}
      {activeTab === "reviews" && renderReviewsTab()}
      {renderBookingModal()}
    </div>
  );
};

export default ServiceDetail;
