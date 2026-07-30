import { useState } from "react";
import { Icon } from "@iconify/react";

import { useServiceDetail } from "./useHook";
import { formatNumberVI } from "../../utils";
import { RatingDistributionRow, ReviewCard, ReviewFilters } from "../../components/Reviews";

function priceTypeLabel(pt: string, t: any) {
  if (pt === "hourly") return t("giờ");
  if (pt === "daily") return t("ngày");
  return t("lần");
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  className?: string;
}

const CustomSelect = ({ value, onChange, options, placeholder, className = "" }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-705 dark:text-slate-350 flex items-center justify-between cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-left"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon icon="material-symbols:keyboard-arrow-down" className={`text-xl text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <ul className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto text-sm">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(String(opt.value));
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors font-medium flex items-center justify-between ${
                    isSelected ? "text-teal-650 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 font-bold" : "text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Icon icon="material-symbols:check" className="text-base text-teal-600 dark:text-teal-400" />}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export const ServiceDetail = () => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
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
    submitting,
    editingReviewId,
    setEditingReviewId,
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
    handleCreateBooking,
  } = useServiceDetail();

  const selectedHelperObj = helpers.find((h: any) => h.id === selectedHelperId);

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-slate-900 pt-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 animate-pulse space-y-6">
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
        rating_distribution: reviewStats.rating_distribution,
      }
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
            <span className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">{service.category?.name ? t(service.category.name) : t("Dịch vụ")}</span>
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
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("Nhân viên đang chọn")}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
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
                    <span className="font-semibold">
                      {t("Giới tính")}: {selectedHelperObj.gender === "male" ? t("Nam") : t("Nữ")}
                    </span>
                    {selectedHelperObj.user?.phone && (
                      <>
                        <span>•</span>
                        <span>
                          {t("Số điện thoại")}: {selectedHelperObj.user.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedHelperObj.address && (
                <div className="flex items-start gap-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <Icon icon="material-symbols:location-on-outline" className="text-base text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {t("Địa chỉ")}: {selectedHelperObj.address}
                  </span>
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t("Giá từ")}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{formatNumberVI(Number(service.base_price))}đ</span>
                  <span className="text-sm text-slate-400">/{priceTypeLabel(service.price_type, t)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* 
                  Code cũ nút Nhắn tin (đã ghi chú lại, không xóa):
                  {selectedHelperObj && (
                    <button
                      onClick={() => {
                        const helperUserId = selectedHelperObj.user?.id || selectedHelperObj.user_id;
                        if (helperUserId) {
                          navigate(`/messages/${helperUserId}`);
                        }
                      }}
                      className="flex-1 sm:flex-initial bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-2xl font-bold hover:border-teal-500 hover:text-teal-600 transition-all cursor-pointer flex items-center justify-center gap-2 text-base shadow-sm"
                    >
                      <Icon icon="material-symbols:chat-outline" className="text-xl" />
                      {t("Nhắn tin")}
                    </button>
                  )}
                */}
                {selectedHelperObj && (
                  <a
                    href={selectedHelperObj.user?.phone ? `tel:${selectedHelperObj.user.phone}` : "javascript:void(0)"}
                    onClick={(e) => {
                      if (!selectedHelperObj.user?.phone) {
                        e.preventDefault();
                        alert(t("Nhân viên này chưa cập nhật số điện thoại."));
                      }
                    }}
                    className="flex-1 sm:flex-initial bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-2xl font-bold hover:border-teal-500 hover:text-teal-600 transition-all cursor-pointer flex items-center justify-center gap-2 text-base shadow-sm"
                  >
                    <Icon icon="material-symbols:call-outline" className="text-xl text-teal-600" />
                    {t("Liên hệ")}
                  </a>
                )}
                {detail.helpers_count > 0 ? (
                  <button
                    onClick={openBookingModal}
                    className={`flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:shadow-teal-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                      !selectedHelperObj ? "w-full" : ""
                    }`}
                  >
                    {t("Đặt ngay")}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 sm:flex-initial bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 px-6 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon icon="material-symbols:info-outline" className="text-lg" />
                    {t("TẠM NGƯNG NHẬN ĐƠN (Chưa có nhân viên)")}
                  </button>
                )}
              </div>
            </div>
            {detail.helpers_count === 0 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-sm font-medium">
                <Icon icon="material-symbols:warning-outline" className="text-xl shrink-0 text-amber-500" />
                <span>{t("Dịch vụ này hiện chưa có Người giúp việc sẵn sàng nhận ca. Hệ thống đang tích cực bổ sung nhân sự, vui lòng quay lại sau!")}</span>
              </div>
            )}
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
                  {t(skill.service?.name)}
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
        <CustomSelect
          value={selectedHelperId ?? ""}
          onChange={(val) => setSelectedHelperId(Number(val))}
          options={helpers.map((h: any) => ({
            value: h.id,
            label: h.user?.full_name ?? `Helper #${h.id}`,
          }))}
          className="sm:col-span-1"
        />
      </div>
    );
  };

  const renderRatingSummary = () => {
    if (!statsToDisplay) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center shadow-sm">
        <div className="text-center md:col-span-1 w-full">
          <div className="text-5xl font-extrabold text-teal-800 dark:text-teal-400">{statsToDisplay.avg_rating ? Number(statsToDisplay.avg_rating).toFixed(1) : "0.0"}</div>
          <div className="flex justify-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                icon="material-symbols:star"
                className={`text-xl ${star <= Math.round(Number(statsToDisplay.avg_rating ?? 0)) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}`}
              />
            ))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {t("Dựa trên")} {statsToDisplay.total_reviews} {t("đánh giá")}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2.5 w-full">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingDistributionRow key={star} star={star} count={statsToDisplay.rating_distribution?.[star] ?? 0} total={statsToDisplay.total_reviews} colorClass="bg-teal-600 dark:bg-teal-400" />
          ))}
        </div>
      </div>
    );
  };

  const renderReviewFilters = () => <ReviewFilters ratingFilter={ratingFilter} setRatingFilter={setRatingFilter} t={t} />;

  const renderReviewForm = () => {
    if (!isCustomer || helpers.length === 0) return null;
    const selectedHelperObj = helpers.find((h: any) => h.id === selectedHelperId);
    const helperName = selectedHelperObj?.user?.full_name ?? `Helper #${selectedHelperId}`;

    return (
      <form onSubmit={handleCreateReview} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 space-y-4 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t("Viết đánh giá của bạn")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("Đánh giá này sẽ được gửi trực tiếp cho nhân viên:")}{" "}
              <span className="font-bold text-teal-600 dark:text-teal-400">{helperName}</span>
            </p>
          </div>

          {/* Rating Select */}
          <div className="text-left shrink-0">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Số sao đánh giá")}</label>
            <div className="flex items-center gap-1.5">
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
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-750 dark:text-slate-350 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
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
    let filtered = reviews;
    if (ratingFilter !== "all") {
      filtered = filtered.filter((r) => r.rating === ratingFilter);
    }

    const displayedReviews = showAllReviews ? filtered : filtered.slice(0, 3);

    return (
      <div className="space-y-4 mt-6">
        {displayedReviews.length > 0 ? (
          <>
            {displayedReviews.map((review) => {
              const isEditing = editingReviewId === review.id;
              const isOwner = currentUser && review.customer_id === currentUser.id;

              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwner={isOwner}
                  isEditing={isEditing}
                  editComment={editComment}
                  onStartEdit={() => startEdit(review)}
                  onCancelEdit={() => setEditingReviewId(null)}
                  onSaveEdit={() => handleUpdateReview(review.id)}
                  onChangeEditComment={setEditComment}
                  onDelete={() => handleDeleteReview(review.id)}
                  variant="card"
                  t={t}
                />
              );
            })}

            {filtered.length > 3 && (
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
      {renderReviewFilters()}
      {renderReviewForm()}
      {renderReviewsList()}
    </div>
  );

  const renderBookingModal = () => {
    if (!isBookingModalOpen) return null;

    const isHourly = service.price_type === "hourly";
    const totalPrice = isHourly ? Number(service.base_price) * durationHours : Number(service.base_price);

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
                      <CustomSelect
                        value={newDistrict}
                        onChange={setNewDistrict}
                        options={[
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
                        ].map((d) => ({
                          value: d === "Bình Thạnh" || d === "Gò Vấp" || d === "Tân Bình" || d === "Tân Phú" || d === "Phú Nhuận" || d === "Thủ Đức" || d === "Bình Tân" ? `Quận ${d}` : d,
                          label: t(d),
                        }))}
                      />
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
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      {t("Hủy")}
                    </button>
                    <button type="submit" className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
                      {t("Lưu địa chỉ")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="relative">
                  {addresses.length > 0 ? (
                    <CustomSelect
                      value={selectedAddressId || ""}
                      onChange={(val) => setSelectedAddressId(Number(val))}
                      options={addresses.map((addr) => ({
                        value: addr.id,
                        label: `${addr.address}, ${addr.district ? (typeof addr.district === "object" ? (addr.district as any).name : addr.district) : ""}, ${addr.city ? (typeof addr.city === "object" ? (addr.city as any).name : addr.city) : ""} ${addr.is_default ? `(${t("Mặc định")})` : ""}`,
                      }))}
                    />
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                      <Icon icon="material-symbols:warning-amber-rounded" className="text-lg shrink-0" />
                      <div>
                        {t("Bạn chưa có địa chỉ nhận việc nào.")}{" "}
                        <button type="button" onClick={() => setIsAddingNewAddress(true)} className="underline font-bold hover:text-amber-700 cursor-pointer">
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

            {/* Helper's Registered Free Slots suggestion */}
            {selectedHelperObj && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <Icon icon="material-symbols:event-available-outline-rounded" className="text-emerald-500 text-base" />
                  <span>
                    {t("Lịch rảnh của")} {selectedHelperObj.user?.full_name || t("Người giúp việc")}
                  </span>
                </div>
                {(() => {
                  const daySlots = (selectedHelperObj.availabilities || []).filter((av: any) => av.available_date === bookingDate && av.status === "available");

                  if (daySlots.length === 0) {
                    return (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                        ⚠️ {t("Người giúp việc chưa mở ca rảnh trong ngày này. Bạn hãy thử chọn ngày khác mà họ có lịch rảnh.")}
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t("Chọn nhanh khung giờ rảnh đã đăng ký:")}</p>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((av: any) => {
                          const timeStr = av.start_time.substring(0, 5); // "08:00:00" -> "08:00"
                          const isSelected = bookingTime === timeStr;
                          return (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => setBookingTime(timeStr)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                  : "bg-white dark:bg-slate-800 border-slate-205 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50"
                              }`}
                            >
                              {timeStr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Duration Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Thời lượng làm việc")}</label>
              <CustomSelect
                value={durationHours}
                onChange={(val) => setDurationHours(Number(val))}
                options={[
                  { value: 2, label: `2 ${t("giờ")}` },
                  { value: 4, label: `4 ${t("giờ")}` },
                  { value: 6, label: `6 ${t("giờ")}` },
                  { value: 8, label: `8 ${t("giờ")}` },
                ]}
              />
            </div>

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
                  {isHourly ? `${formatNumberVI(Number(service.base_price))}đ x ${durationHours} ${t("giờ")}` : `${formatNumberVI(Number(service.base_price))}đ (${t("Trọn gói")})`}
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
    <div className="min-h-screen dark:bg-slate-900 py-8">
      <div className="max-w-8xl">
        {renderBreadcrumb()}
        {renderHeroSection()}
        {renderTabNavigation()}
        {activeTab === "helpers" && renderHelpersTab()}
        {activeTab === "reviews" && renderReviewsTab()}
      </div>
      {renderBookingModal()}
    </div>
  );
};

export default ServiceDetail;
