import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { useHistory } from "./useHook";
import type { Booking, StatusFilter } from "./useHook";
import { useRecruitment } from "../Recruitment/useHook";
import { Pagination } from "../../components/Pagination";

import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { formatDateTime } from "../../utils";
import { PaymentReceipt } from "../../components/PaymentReceipt";
import { ReviewModal } from "../Review";
import { createReportApi } from "../../api/reports";
import { useToast } from "../../contexts/ToastContext";

export const HistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── History hook (direct bookings) ───────────────────────
  const {
    setStatusFilter,
    currentPage,
    setCurrentPage,
    paginatedBookings,
    totalItems,
    itemsPerPage,
    handleCancelBooking,
    handleStartMoving,
    handleCheckin,
    handleCheckout,
    handleRespondToSelection,
    handleConfirmCashPayment,

    isLoading,
    isHelper,
    refreshBookings,
    applications,
    isApplicationsLoading,
    // Inline payment
    showPaymentModal,
    paymentBooking,
    paymentMethod,
    setPaymentMethod,
    isPaymentProcessing,
    openPaymentModal,
    closePaymentModal,
    handlePayBooking,
    reviewedBookingIds,
    reportedBookingIds,
    markAsReviewed,
    markAsReported,
  } = useHistory();

  // ── Recruitment hook (job postings) ──────────────────────
  const {
    myJobPosts,
    myPostsLoading,
    selectedJobPost,
    applicants,
    applicantsLoading,
    showApplicationsModal,
    openApplications,
    closeApplications,
    acceptHelper,
    rejectHelper,
    deleteJobPost,
    editingJobPost,
    isEditModalOpen,
    closeEditJobPost,
    updateJobPost,
    helperProfile,
    helperProfileLoading,
    showHelperProfile,
    viewHelperProfile,
    closeHelperProfile,
    setActiveTab,
    fetchMyJobPosts,
  } = useRecruitment();

  // ── Local state for phone reveal in applicant list ───────
  const [revealedPhones, setRevealedPhones] = useState({});
  const [activeMainTab, setActiveMainTab] = useState<"bookings" | "job-posts" | "helper-applications">("bookings");

  // ── Report Modal states & handlers ────────────────────────
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportBooking, setReportBooking] = useState<Booking | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const { showToast } = useToast();

  // ── Review states ────────────────────────────────────────
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);
  const handleOpenReportModal = (booking: Booking) => {
    setReportBooking(booking);
    setReportReason("");
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportBooking(null);
    setReportReason("");
    setIsReporting(false);
  };

  const handleSubmitReport = async () => {
    if (!reportBooking) return;
    if (!reportReason.trim()) {
      showToast("error", t("Lỗi nhập liệu"), t("Vui lòng nhập lý do báo cáo vi phạm."));
      return;
    }
    if (!reportBooking.helper?.id) {
      showToast("error", t("Lỗi dữ liệu"), t("Không xác định được người giúp việc cần báo cáo."));
      return;
    }

    setIsReporting(true);
    try {
      await createReportApi({
        booking_id: reportBooking.idRaw,
        reported_user_id: reportBooking.helper.id,
        reason: reportReason.trim(),
      });
      showToast("success", t("Gửi báo cáo thành công"), t("Báo cáo vi phạm đã được gửi đến ban quản trị để xử lý."));
      markAsReported(reportBooking.idRaw);
      handleCloseReportModal();
      refreshBookings();
    } catch (err: any) {
      showToast("error", t("Lỗi gửi báo cáo"), err.response?.data?.message || t("Không thể gửi báo cáo vi phạm. Vui lòng thử lại."));
    } finally {
      setIsReporting(false);
    }
  };
  const [currentTab, setCurrentTab] = useState<string>("bookings");
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");

  useEffect(() => {
    Promise.resolve().then(() => {
      if (tabParam === "job-posts" || tabParam === "my-posts") {
        setCurrentTab("job-posts");
        setActiveMainTab("job-posts");
      } else if (tabParam === "helper-applications") {
        setCurrentTab("helper-applications");
        setActiveMainTab("helper-applications");
      } else if (tabParam && ["all", "completed", "cancelled"].includes(tabParam)) {
        setCurrentTab(tabParam);
        setActiveMainTab("bookings");
        setStatusFilter(tabParam as StatusFilter);
      } else {
        setCurrentTab("bookings");
        setActiveMainTab("bookings");
        setStatusFilter("all");
      }
    });
  }, [tabParam, setStatusFilter]);

  useEffect(() => {
    if (activeMainTab === "job-posts") {
      Promise.resolve().then(() => {
        setActiveTab("my-posts");
        fetchMyJobPosts();
      });
    }
  }, [activeMainTab, setActiveTab, fetchMyJobPosts]);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    salary: "",
    address: "",
    district: "",
    city: "",
    working_time: "",
    expired_at: "",
  });

  // Keep editForm synced with currently editing job post
  useEffect(() => {
    if (editingJobPost) {
      let cleanDesc = editingJobPost.description || "";
      cleanDesc = cleanDesc.replace(/^\[Danh mục:\s*[^\]]+\]\s*/, "");
      cleanDesc = cleanDesc.replace(/^\[Dịch vụ:\s*[^\]]+\]\s*/, "");

      const formatToDateTimeLocal = (dateStr: string | null) => {
        if (!dateStr) return "";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "";
          const tzoffset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
        } catch {
          return "";
        }
      };

      Promise.resolve().then(() => {
        setEditForm({
          title: editingJobPost.title || "",
          description: cleanDesc,
          salary: editingJobPost.salary ? String(editingJobPost.salary) : "",
          address: editingJobPost.address || "",
          district: editingJobPost.district || "",
          city: editingJobPost.city || "",
          working_time: formatToDateTimeLocal(editingJobPost.working_time),
          expired_at: formatToDateTimeLocal(editingJobPost.expired_at),
        });
      });
    }
  }, [editingJobPost]);

  const togglePhoneReveal = (helperId: number) => {
    setRevealedPhones((prev) => ({
      ...prev,
      [helperId]: !prev[helperId],
    }));
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "";
    return phone.substring(0, 3) + "***" + phone.substring(phone.length - 3);
  };

  // Helper: Get icon for specific service
  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case "Dọn dẹp nhà cửa":
        return "material-symbols:home-outline";
      case "Vệ sinh máy lạnh":
        return "material-symbols:ac-unit";
      case "Tổng vệ sinh nhà cửa":
        return "material-symbols:cleaning-services-outline";
      case "Nấu ăn gia đình":
        return "material-symbols:restaurant";
      case "Giặt ủi":
        return "material-symbols:local-laundry-service-outline";
      case "Chăm sóc người già":
        return "material-symbols:medical-services-outline";
      case "Trông trẻ em":
        return "material-symbols:child-care";
      default:
        return "material-symbols:cleaning-services-outline";
    }
  };

  // Helper: Get diverse color configurations for service badges
  const getServiceColorConfig = (serviceName: string) => {
    switch (serviceName) {
      case "Dọn dẹp nhà cửa":
      case "Vệ sinh máy lạnh":
      case "Tổng vệ sinh nhà cửa":
        return {
          bg: "bg-teal-100/80 dark:bg-teal-950/45",
          text: "text-teal-800 dark:text-teal-300",
          border: "border-teal-200 dark:border-teal-900/60",
        };
      case "Nấu ăn gia đình":
        return {
          bg: "bg-amber-100/80 dark:bg-amber-950/45",
          text: "text-amber-850 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-900/60",
        };
      case "Giặt ủi":
        return {
          bg: "bg-purple-100/80 dark:bg-purple-950/45",
          text: "text-purple-850 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-900/60",
        };
      case "Chăm sóc người già":
        return {
          bg: "bg-sky-100/80 dark:bg-sky-950/45",
          text: "text-sky-850 dark:text-sky-300",
          border: "border-sky-200 dark:border-sky-900/60",
        };
      case "Trông trẻ em":
        return {
          bg: "bg-rose-100/80 dark:bg-rose-950/45",
          text: "text-rose-850 dark:text-rose-300",
          border: "border-rose-200 dark:border-rose-900/60",
        };
      default:
        return {
          bg: "bg-slate-50/70 dark:bg-slate-800/40",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-100 dark:border-slate-700/50",
        };
    }
  };

  const renderHeader = () => (
    <div className="text-left mb-2">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
        {activeMainTab === "bookings" ? t("Lịch sử đặt lịch") : activeMainTab === "job-posts" ? t("Bài đăng tuyển dụng của tôi") : t("Đơn ứng tuyển của tôi")}
      </h1>
      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
        {activeMainTab === "bookings"
          ? t("Quản lý và xem lại các dịch vụ bạn đã sử dụng.")
          : activeMainTab === "job-posts"
            ? t("Quản lý và xem danh sách ứng tuyển cho các bài đăng tìm người giúp việc.")
            : t("Xem danh sách công việc bạn đã ứng tuyển và phản hồi yêu cầu nhận việc.")}
      </p>
    </div>
  );

  const renderTabs = () => {
    const tabs = [
      { label: "Lịch đặt dịch vụ", value: "bookings", icon: "material-symbols:calendar-today-outline" },
      ...(!isHelper
        ? [{ label: "Bài đăng tuyển dụng", value: "job-posts", icon: "material-symbols:assignment-ind-outline-rounded" }]
        : [{ label: "Đơn ứng tuyển", value: "helper-applications", icon: "material-symbols:assignment-ind-outline-rounded" }]),
      { label: "Tất cả", value: "all", icon: "material-symbols:list-alt-outline" },
      { label: "Đã hoàn thành", value: "completed", icon: "material-symbols:event-available" },
      { label: "Đã hủy", value: "cancelled", icon: "material-symbols:event-busy" },
    ];

    const handleTabClick = (val: string) => {
      setCurrentTab(val);
      if (val === "job-posts" || val === "helper-applications") {
        setActiveMainTab(val as any);
      } else {
        setActiveMainTab("bookings");
        if (val === "bookings" || val === "all") {
          setStatusFilter("all");
        } else {
          setStatusFilter(val as StatusFilter);
        }
      }
    };

    return (
      <div className="flex border-b border-gray-200 dark:border-gray-700/60 overflow-x-auto pb-px scrollbar-none mb-6">
        <div className="flex gap-1 md:gap-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabClick(tab.value)}
                className={`py-3 px-4 md:px-5 text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 md:gap-2 ${
                  isActive
                    ? "border-[#026E5F] text-[#026E5F] dark:border-teal-400 dark:text-teal-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <Icon icon={tab.icon} className="text-lg shrink-0" />
                {t(tab.label)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTableHead = () => (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Mã đặt lịch")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Dịch vụ")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">
          {isHelper ? t("Khách hàng") : t("Nhân viên")}
        </th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Ngày / Giờ")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Tổng tiền")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Trạng thái")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Thanh toán")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-center">{t("Thao tác")}</th>
      </tr>
    </thead>
  );

  const renderBookingStatusBadge = (booking: Booking) => {
    switch (booking.statusRaw) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            {t("Chờ thanh toán")}
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#026E5F] dark:bg-teal-950/20 dark:text-teal-450 border border-teal-100 dark:border-teal-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#026E5F] mr-1.5" />
            {t("Chưa di chuyển")}
          </span>
        );
      case "on_the_way":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-450 border border-blue-100 dark:border-blue-900/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
            {t("Đang di chuyển")}
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-755 dark:bg-indigo-955/20 dark:text-indigo-450 border border-indigo-100 dark:border-indigo-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5" />
            {t("Đang thực hiện")}
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-450 border border-green-100 dark:border-green-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            {t("Hoàn thành")}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-450 border border-red-100 dark:border-red-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
            {t("Đã hủy")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
            {t(booking.statusRaw || "Không rõ")}
          </span>
        );
    }
  };

  const renderTableRow = (booking: Booking) => {
    const config = getServiceColorConfig(booking.serviceName);

    return (
      <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors duration-200">
        {/* Booking ID */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{booking.id}</span>
        </td>

        {/* Service Name */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${config.text} border ${config.border}`}>
              <Icon icon={getServiceIcon(booking.serviceName)} className="text-base" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-250">{t(booking.serviceName)}</span>
          </div>
        </td>

        {/* Employee / Customer */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <div className="flex items-center gap-3">
            <img
              src={booking.helper.avatar}
              alt={booking.helper.name || (isHelper ? t("Khách hàng") : t("Người giúp việc"))}
              className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-750 dark:text-slate-300">{booking.helper.name || (isHelper ? t("Khách hàng") : t("Người giúp việc"))}</span>
              {booking.helper.phone ? (
                <span className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <Icon icon="material-symbols:phone-enabled" className="text-xs text-[#026E5F] dark:text-teal-400 animate-pulse" />
                  {booking.helper.phone}
                </span>
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                  <Icon icon="material-symbols:phone-enabled" className="text-xs text-slate-300 dark:text-slate-655" />
                  {t("Chưa cập nhật SĐT")}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Date / Time */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <div className="flex flex-col text-sm text-left">
            <span className="font-semibold text-slate-750 dark:text-slate-300">{booking.date}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{booking.time}</span>
          </div>
        </td>

        {/* Price */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <span className="text-sm font-extrabold text-[#026E5F] dark:text-teal-400">{booking.totalPrice}</span>
        </td>

        {/* Status */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">{renderBookingStatusBadge(booking)}</td>

        {/* Payment Status */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          {booking.paymentStatus === "completed" && (
            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30">
                <Icon icon="material-symbols:check-circle" className="mr-1 text-emerald-600 dark:text-emerald-450" />
                {t("Đã thanh toán")}
              </span>
              <button
                onClick={() => openPaymentModal(booking)}
                title={t("Xem hóa đơn")}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold bg-[#026E5F]/10 text-[#026E5F] dark:bg-teal-500/10 dark:text-teal-400 hover:bg-[#026E5F]/20 transition-all cursor-pointer border border-[#026E5F]/20 hover:scale-105"
              >
                <Icon icon="material-symbols:receipt-long-outline" className="text-xs" />
                <span>{t("Hóa đơn")}</span>
              </button>
            </div>
          )}
          {booking.paymentStatus === "pending" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100/90 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30">
              <Icon icon="material-symbols:hourglass-empty" className="mr-1 text-amber-600 dark:text-amber-400" />
              {t("Chờ xử lý")}
            </span>
          )}
          {booking.paymentStatus === "failed" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100/90 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/30">
              <Icon icon="material-symbols:error" className="mr-1 text-red-600 dark:text-red-400" />
              {t("Lỗi thanh toán")}
            </span>
          )}
          {booking.paymentStatus === "refunded" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100/90 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/30">
              <Icon icon="material-symbols:replay" className="mr-1 text-purple-600 dark:text-purple-400" />
              {t("Đã hoàn tiền")}
            </span>
          )}
          {(booking.paymentStatus === "unpaid" || !booking.paymentStatus) &&
            (!isHelper ? (
              <button
                onClick={() => openPaymentModal(booking)}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100/90 text-[#026E5F] hover:bg-slate-200 dark:bg-slate-950/40 dark:text-teal-400 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-900/30 transition-all cursor-pointer hover:scale-105"
              >
                <Icon icon="material-symbols:payment" className="mr-1 text-[#026E5F] dark:text-teal-400" />
                {t("Thanh toán")}
              </button>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100/90 text-slate-805 dark:bg-slate-950/40 dark:text-slate-300 border border-slate-200 dark:border-slate-900/30">
                <Icon icon="material-symbols:payment" className="mr-1 text-slate-400" />
                {t("Chưa thanh toán")}
              </span>
            ))}
        </td>

        {/* Action buttons */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750 text-center">
          <div className="flex items-center justify-center gap-2">
            {!isHelper ? (
              // Customer actions
              <div className="flex items-center justify-center gap-2">
                {["pending", "confirmed"].includes(booking.statusRaw) && (
                  <button
                    onClick={() => handleCancelBooking(booking)}
                    title={t("Hủy lịch")}
                    className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-650 transition-all cursor-pointer dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 hover:scale-105"
                  >
                    <Icon icon="material-symbols:cancel-outline" className="text-lg" />
                  </button>
                )}
                {booking.statusRaw === "completed" &&
                  (reviewedBookingIds.includes(booking.idRaw) ? (
                    <button
                      disabled
                      title={t("Đã đánh giá")}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 font-bold rounded-lg text-xs flex items-center gap-1 cursor-not-allowed border border-slate-200/80 dark:border-slate-700/60 opacity-80"
                    >
                      <Icon icon="material-symbols:star-rounded" className="text-sm text-amber-400/80" />
                      <span>{t("Đã đánh giá")}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setReviewTargetBooking(booking);
                        setIsReviewModalOpen(true);
                      }}
                      title={t("Đánh giá")}
                      className="px-3 py-1.5 bg-[#026E5F] hover:bg-[#01564a] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                    >
                      <Icon icon="material-symbols:star-outline" className="text-sm" />
                      <span>{t("Đánh giá")}</span>
                    </button>
                  ))}
                {["confirmed", "on_the_way", "in_progress", "completed"].includes(booking.statusRaw) &&
                  booking.helper?.id &&
                  (reportedBookingIds.includes(booking.idRaw) ? (
                    <button
                      disabled
                      title={t("Đã báo cáo vi phạm")}
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 cursor-not-allowed border border-slate-200/80 dark:border-slate-700/60 opacity-60"
                    >
                      <Icon icon="material-symbols:report-outline" className="text-lg text-amber-500/50" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReportModal(booking)}
                      title={t("Báo cáo vi phạm")}
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 transition-all cursor-pointer dark:bg-amber-950/30 dark:hover:bg-amber-900/45 dark:text-amber-400 hover:scale-105"
                    >
                      <Icon icon="material-symbols:report-outline" className="text-lg" />
                    </button>
                  ))}
                {!["pending", "confirmed", "on_the_way", "in_progress", "completed"].includes(booking.statusRaw) && <span className="text-xs text-slate-400 italic">{t("Không có thao tác")}</span>}
              </div>
            ) : (
              // Helper actions
              <>
                {booking.statusRaw === "confirmed" && (
                  <button
                    onClick={() => handleStartMoving(booking.idRaw)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                  >
                    <Icon icon="material-symbols:local-shipping" className="text-sm" />
                    <span>{t("Bắt đầu đi")}</span>
                  </button>
                )}
                {booking.statusRaw === "on_the_way" && (
                  <button
                    onClick={() => handleCheckin(booking.idRaw)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                  >
                    <Icon icon="material-symbols:check-circle-outline" className="text-sm" />
                    <span>{t("Đã đến nơi")}</span>
                  </button>
                )}
                {booking.statusRaw === "in_progress" && (
                  <button
                    onClick={() => handleCheckout(booking.idRaw)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                  >
                    <Icon icon="material-symbols:task-alt" className="text-sm" />
                    <span>{t("Hoàn thành")}</span>
                  </button>
                )}
                {booking.statusRaw === "completed" && booking.paymentStatus !== "completed" && (
                  <button
                    onClick={() => handleConfirmCashPayment(booking)}
                    className="px-3 py-1.5 bg-[#026E5F] hover:bg-[#01564a] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 shadow-sm"
                  >
                    <Icon icon="material-symbols:payments" className="text-sm" />
                    <span>{t("Xác nhận nhận tiền")}</span>
                  </button>
                )}
                {!["confirmed", "on_the_way", "in_progress"].includes(booking.statusRaw) && !(booking.statusRaw === "completed" && booking.paymentStatus !== "completed") && (
                  <span className="text-xs text-slate-400 italic">{t("Không có thao tác")}</span>
                )}
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTable = () => (
    <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-750 shadow-md overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-4xl">
          {renderTableHead()}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-750">{paginatedBookings.map((booking) => renderTableRow(booking))}</tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-750 px-6 py-4">
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );

  const renderReportModal = () => {
    if (!showReportModal || !reportBooking) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-850 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <Icon icon="material-symbols:warning-amber-rounded" className="text-2xl text-amber-500" />
                {t("Báo cáo vi phạm")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{t("Báo cáo người giúp việc của đơn đặt lịch này")}</p>
            </div>
            <button
              onClick={handleCloseReportModal}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 space-y-2 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Mã đặt lịch")}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{reportBooking.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Người giúp việc")}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{reportBooking.helper?.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-left">
                {t("Lý do báo cáo vi phạm")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={t("Vui lòng mô tả chi tiết vi phạm của người giúp việc (ví dụ: đến trễ, hành vi không đúng mực, tự ý bỏ về...)")}
                rows={4}
                disabled={isReporting}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition disabled:opacity-60 resize-none text-left"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleCloseReportModal}
              disabled={isReporting}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {t("Hủy")}
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={isReporting || !reportReason.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold transition active:scale-95 cursor-pointer disabled:pointer-events-none shadow-sm"
            >
              {isReporting ? <Icon icon="mynaui:send-solid" className="text-lg" /> : <Icon icon="material-symbols:send-rounded" className="text-lg" />}
              {t("Gửi báo cáo")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmpty = () => (
    <div className="py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-100 dark:border-slate-700/30">
        <Icon icon="material-symbols:calendar-today-outline-rounded" className="text-3xl" />
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">{t("Không tìm thấy lịch đặt lịch nào")}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-normal">{t("Vui lòng thử lại với các tiêu chí hoặc bộ lọc trạng thái khác.")}</p>
    </div>
  );

  // ── Recruitment renders (My Job Posts) ──────────────────
  const renderMyJobPostsSection = () => {
    if (myPostsLoading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-[#026E5F]" />
          <p className="text-sm text-gray-500">{t("Đang tải danh sách bài đăng...")}</p>
        </div>
      );
    }

    if (myJobPosts.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-16 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-4">
            <Icon icon="material-symbols:work-outline" className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-750 dark:text-slate-200">{t("Bạn chưa đăng bài tuyển dụng nào")}</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm">{t("Hãy tạo bài đăng tuyển dụng để tìm người giúp việc phù hợp với nhu cầu của bạn.")}</p>
          <Link
            to="/dang-bai-tuyen"
            className="px-6 py-3 bg-[#026E5F] text-white font-bold rounded-2xl shadow-md hover:bg-[#01564a] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon icon="material-symbols:add-circle-outline-rounded" className="text-xl" />
            {t("Đăng bài ngay")}
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {myJobPosts.map((post) => {
          const isExpired = post.expired_at && new Date(post.expired_at).getTime() < Date.now();
          const isClosed = post.status === "closed";
          return (
            <div
              key={post.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col gap-2 max-w-xl text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-450 dark:text-slate-500">#{post.id}</span>
                  {isExpired ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                      {t("Đã hết hạn")}
                    </span>
                  ) : isClosed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                      {t("Đã kết thúc")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-450 border border-teal-100 dark:border-teal-900/30 animate-pulse">
                      {t("Đang nhận hồ sơ")}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 line-clamp-2">{post.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-450 dark:text-slate-550 items-center">
                  <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/30 px-2.5 py-1 rounded-lg">
                    <Icon icon="material-symbols:payments-outline" className="text-sm text-slate-400" />
                    {post.salary ? `${Number(post.salary).toLocaleString()} VNĐ` : "Thỏa thuận"}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/30 px-2.5 py-1 rounded-lg">
                    <Icon icon="material-symbols:location-on-outline" className="text-sm text-slate-400" />
                    {post.district}, {post.city}
                  </span>
                </div>

                <div className="mt-2.5">
                  {isExpired ? (
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">{t("Đã hết hạn lúc")}</div>
                      <div className="text-sm font-extrabold mt-0.5 flex items-center gap-1">
                        <Icon icon="material-symbols:event-busy-outline" className="text-base text-rose-500" />
                        {post.expired_at ? formatDateTime(post.expired_at) : "N/A"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-450 font-medium">
                      <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">{t("Hết hạn lúc")}</div>
                      <div className="text-sm font-extrabold mt-0.5 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Icon icon="material-symbols:calendar-month-outline" className="text-base text-[#026E5F] dark:text-teal-400" />
                        {post.expired_at ? formatDateTime(post.expired_at) : "N/A"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => openApplications(post)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#026E5F] dark:hover:border-teal-500 hover:text-[#026E5F] dark:hover:text-teal-400 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Icon icon="material-symbols:group-outline" className="text-lg" />
                  {t("Xem ứng viên")}
                  {post.active_applications_count !== undefined && post.active_applications_count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-extrabold rounded-full bg-[#026E5F] text-white dark:bg-teal-500 dark:text-slate-900">{post.active_applications_count}</span>
                  )}
                </button>
                {isExpired && (
                  <button
                    onClick={() => navigate("/dang-bai-tuyen", { state: { prefilledPost: post } })}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5"
                  >
                    <Icon icon="material-symbols:autorenew" className="text-lg" />
                    {t("Đăng lại")}
                  </button>
                )}
                <button
                  onClick={() => deleteJobPost(post.id)}
                  className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:border-red-500 hover:text-red-500 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                  title={t("Xóa bài đăng")}
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="text-lg" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderApplicationsModal = () => {
    if (!showApplicationsModal || !selectedJobPost) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-850 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <Icon icon="material-symbols:person-search-outline-rounded" className="text-2xl text-[#026E5F]" />
                {t("Hồ sơ ứng tuyển")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedJobPost.title}</p>
            </div>
            <button
              onClick={closeApplications}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {applicantsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-[#026E5F]" />
                <p className="text-sm text-gray-500">{t("Đang tải danh sách hồ sơ...")}</p>
              </div>
            ) : applicants.length === 0 ? (
              <div className="py-16 text-center">
                <Icon icon="material-symbols:person-search" className="text-5xl text-slate-355 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-semibold">{t("Chưa có người giúp việc nào ứng tuyển công việc này.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applicants.map((app) => {
                  const hasDetails = !!app.profile;
                  const helperName = app.helper?.full_name || t("Người giúp việc");
                  const helperAvatar = app.helper?.avatar
                    ? app.helper.avatar.startsWith("http")
                      ? app.helper.avatar
                      : `http://localhost:8000${app.helper.avatar}`
                    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop";

                  return (
                    <div
                      key={app.id}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-[#026E5F] dark:hover:border-teal-500 transition-colors"
                    >
                      <div>
                        <div className="flex items-start gap-4 text-left">
                          <img src={helperAvatar} alt={helperName} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-850 shadow-sm shrink-0" />
                          <div className="flex flex-col grow min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{helperName}</span>
                              {app.status === "accepted" && (
                                <span className="px-2 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-full border border-emerald-250 dark:border-emerald-900/30 whitespace-nowrap shrink-0">
                                  {t("Đã chấp nhận")}
                                </span>
                              )}
                              {app.status === "rejected" && (
                                <span className="px-2 py-0.5 text-xs font-extrabold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 rounded-full border border-rose-250 dark:border-rose-900/30 whitespace-nowrap shrink-0">
                                  {t("Đã từ chối")}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 mt-0.5 truncate">{app.helper?.email}</span>
                            {app.helper?.phone && (
                              <div className="text-xs text-slate-600 dark:text-slate-350 font-bold mt-1.5 flex items-center gap-1.5">
                                <Icon icon="material-symbols:phone-enabled" className="text-sm text-[#026E5F]" />
                                <span>{revealedPhones[app.helper_id] ? app.helper.phone : maskPhone(app.helper.phone)}</span>
                                <button
                                  type="button"
                                  onClick={() => togglePhoneReveal(app.helper_id)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-[#026E5F] cursor-pointer"
                                  title={revealedPhones[app.helper_id] ? t("Ẩn số điện thoại") : t("Hiện số điện thoại")}
                                >
                                  <Icon icon={revealedPhones[app.helper_id] ? "lucide:eye-off" : "lucide:eye"} className="text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {hasDetails && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-left">
                            <div className="flex items-center gap-3.5 mb-2.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30 text-xs font-bold">
                                <Icon icon="material-symbols:star-rounded" className="text-sm" />
                                {Number(app.profile.rating_avg) > 0 ? `${Number(app.profile.rating_avg).toFixed(1)} / 5.0` : "Chưa có đánh giá"}
                                {app.profile.total_reviews > 0 && ` (${app.profile.total_reviews})`}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-450 border border-blue-100 dark:border-blue-900/30 text-xs font-bold">
                                <Icon icon="material-symbols:history" className="text-sm" />
                                {app.profile.experience_year} {t("năm k.nghiệm")}
                              </span>
                            </div>

                            {app.profile.bio && <p className="text-xs text-slate-500 dark:text-slate-455 line-clamp-2 italic">"{app.profile.bio}"</p>}

                            {app.profile.skills && app.profile.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {app.profile.skills.slice(0, 3).map((sk: any, idx: number) => (
                                  <span key={idx} className="px-1.5 py-0.5 text-xs font-bold bg-slate-200 dark:bg-slate-850 text-slate-650 dark:text-slate-400 rounded">
                                    {sk.service?.name}
                                  </span>
                                ))}
                                {app.profile.skills.length > 3 && (
                                  <span className="px-1.5 py-0.5 text-xs font-bold bg-slate-200 dark:bg-slate-850 text-slate-650 dark:text-slate-400 rounded">+{app.profile.skills.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-5">
                        <button
                          onClick={() => viewHelperProfile(app.helper_id)}
                          className="w-full py-2.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#026E5F] dark:hover:border-teal-500 hover:text-[#026E5F] dark:hover:text-teal-400 text-slate-700 dark:text-slate-350 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Icon icon="solar:user-speak-bold-duotone" className="text-sm text-[#026E5F] dark:text-teal-400" />
                          {t("Xem hồ sơ đầy đủ")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHelperProfileModal = () => {
    if (!showHelperProfile) return null;

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-end bg-black/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-850 w-full max-w-md h-full shadow-2xl border-l border-slate-150 dark:border-slate-800/80 flex flex-col animate-in slide-in-from-right duration-250">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Icon icon="material-symbols:account-circle-outline-rounded" className="text-xl text-[#026E5F]" />
              {t("Hồ sơ người giúp việc")}
            </h3>
            <button
              onClick={closeHelperProfile}
              className="w-8.5 h-8.5 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-lg" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 text-left">
            {helperProfileLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-[#026E5F]" />
                <p className="text-sm text-gray-500">{t("Đang tải hồ sơ...")}</p>
              </div>
            ) : !helperProfile ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-450 italic">{t("Không tìm thấy thông tin hồ sơ.")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-2 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <img
                    src={
                      helperProfile.user?.avatar
                        ? helperProfile.user.avatar.startsWith("http")
                          ? helperProfile.user.avatar
                          : `http://localhost:8000${helperProfile.user.avatar}`
                        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop"
                    }
                    alt={helperProfile.user?.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md mb-2"
                  />
                  <h4 className="text-base font-bold text-slate-850 dark:text-slate-100">{helperProfile.user?.full_name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{helperProfile.user?.email}</p>
                  {helperProfile.user?.phone && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-bold bg-[#026E5F]/10 dark:bg-teal-500/10 text-[#026E5F] dark:text-teal-400 px-3 py-1 rounded-full mt-1.5 flex items-center gap-1.5">
                      <Icon icon="material-symbols:phone-enabled" />
                      <span>{revealedPhones[helperProfile.user.id] ? helperProfile.user.phone : maskPhone(helperProfile.user.phone)}</span>
                      <button
                        type="button"
                        onClick={() => togglePhoneReveal(helperProfile.user.id)}
                        className="p-0.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full transition-colors text-[#026E5F] dark:text-teal-400 cursor-pointer"
                        title={revealedPhones[helperProfile.user.id] ? t("Ẩn") : t("Hiện")}
                      >
                        <Icon icon={revealedPhones[helperProfile.user.id] ? "lucide:eye-off" : "lucide:eye"} className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">{t("Giới thiệu bản thân")}</h5>
                    <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      {helperProfile.bio || t("Chưa có thông tin tự giới thiệu.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-xs font-bold text-slate-400 block mb-0.5">{t("Kinh nghiệm")}</span>
                      <span className="text-sm font-extrabold text-slate-750 dark:text-slate-100">
                        {helperProfile.experience_year} {t("năm")}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-xs font-bold text-slate-400 block mb-0.5">{t("Đánh giá trung bình")}</span>
                      <span className="text-sm font-extrabold text-amber-600 flex items-center gap-1 mt-0.5">
                        <Icon icon="material-symbols:star-rounded" className="text-base" />
                        {Number(helperProfile.rating_avg) > 0 ? `${Number(helperProfile.rating_avg).toFixed(1)} / 5.0` : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t("Dịch vụ chuyên môn")}</h5>
                    <div className="flex flex-wrap gap-2">
                      {helperProfile.skills && helperProfile.skills.length > 0 ? (
                        helperProfile.skills.map((sk: any) => (
                          <span
                            key={sk.id}
                            className="px-3 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold rounded-lg"
                          >
                            {sk.service?.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-450 italic">{t("Chưa cập nhật kỹ năng.")}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t("Khu vực hoạt động")}</h5>
                    <div className="flex flex-wrap gap-2">
                      {helperProfile.workingAreas && helperProfile.workingAreas.length > 0 ? (
                        helperProfile.workingAreas.map((wa: any) => (
                          <span
                            key={wa.id}
                            className="px-3 py-1 bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-450 border border-blue-100 dark:border-blue-900/30 text-xs font-bold rounded-lg"
                          >
                            {wa.district}, {wa.city}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-450 italic">{t("Chưa cập nhật khu vực làm việc.")}</p>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const matchingApp = applicants.find((a) => a.helper_id === helperProfile.user?.id);
                    if (!matchingApp || selectedJobPost?.status !== "open" || matchingApp.status !== "pending") {
                      return null;
                    }
                    return (
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                        <button
                          onClick={() => rejectHelper(selectedJobPost.id, helperProfile.user.id)}
                          className="flex-1 py-3 text-sm font-bold border border-red-200 dark:border-red-900/50 hover:border-red-500 hover:text-red-500 text-slate-505 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Icon icon="solar:close-circle-bold-duotone" className="text-lg text-red-500" />
                          {t("Từ chối")}
                        </button>
                        <button
                          onClick={() => acceptHelper(selectedJobPost.id, helperProfile.user.id)}
                          className="flex-1 py-3 text-sm font-bold bg-[#026E5F] hover:bg-[#01564a] text-white rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Icon icon="solar:check-circle-bold-duotone" className="text-lg" />
                          {t("Chấp nhận")}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEditJobPostModal = () => {
    if (!isEditModalOpen || !editingJobPost) return null;

    const handleSubmit = (e) => {
      e.preventDefault();

      let prefix = "";
      if (editingJobPost.description) {
        const catMatch = editingJobPost.description.match(/^(\[Danh mục:\s*[^\]]+\]\s*)/);
        if (catMatch) prefix += catMatch[1];
        const serviceMatch = editingJobPost.description.replace(/^\[Danh mục:\s*[^\]]+\]\s*/, "").match(/^(\[Dịch vụ:\s*[^\]]+\]\s*)/);
        if (serviceMatch) prefix += serviceMatch[1];
      }

      const finalDescription = prefix ? `${prefix}${editForm.description}` : editForm.description;

      updateJobPost(editingJobPost.id, {
        title: editForm.title,
        description: finalDescription,
        salary: Number(editForm.salary) || 0,
        address: editForm.address,
        district: editForm.district,
        city: editForm.city,
        working_time: editForm.working_time || null,
        expired_at: editForm.expired_at || null,
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-slate-850 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50 sticky top-0 bg-white dark:bg-slate-850 z-10">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-855 dark:text-white flex items-center gap-2">
                <Icon icon="solar:pen-bold" className="text-2xl text-[#026E5F]" />
                {t("Chỉnh sửa bài đăng tuyển dụng")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                #{editingJobPost.id} - {editingJobPost.title}
              </p>
            </div>
            <button
              onClick={closeEditJobPost}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Tiêu đề công việc")}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Mô tả công việc")}</label>
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-slate-800 dark:text-slate-100"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Mức lương (VNĐ)")}</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Thời gian làm việc")}</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                  value={editForm.working_time}
                  onChange={(e) => setEditForm({ ...editForm, working_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Tỉnh / Thành phố")}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Quận / Huyện")}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Địa chỉ cụ thể")}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-750 dark:text-slate-350 mb-1.5 uppercase tracking-wider">{t("Hạn ứng tuyển")}</label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-100"
                value={editForm.expired_at}
                onChange={(e) => setEditForm({ ...editForm, expired_at: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 sticky bottom-0 bg-white dark:bg-slate-850 py-2">
              <button
                type="button"
                onClick={closeEditJobPost}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t("Hủy")}
              </button>
              <button type="submit" className="bg-[#026E5F] hover:bg-[#01564a] text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-sm cursor-pointer">
                {t("Lưu thay đổi")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderHelperApplicationsSection = () => {
    if (isApplicationsLoading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-[#026E5F]" />
          <p className="text-sm text-gray-500">{t("Đang tải danh sách đơn ứng tuyển...")}</p>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-16 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-4">
            <Icon icon="material-symbols:assignment-turned-in-outline" className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-750 dark:text-slate-200">{t("Bạn chưa ứng tuyển công việc nào")}</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm">{t("Hãy tìm kiếm các công việc công khai và gửi hồ sơ ứng tuyển để bắt đầu nhận việc.")}</p>
          <Link
            to="/tuyen-dung"
            className="px-6 py-3 bg-[#026E5F] text-white font-bold rounded-2xl shadow-md hover:bg-[#01564a] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon icon="material-symbols:search" className="text-xl" />
            {t("Tìm việc ngay")}
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {applications.map((app: any) => {
          const post = app.job_post || {};
          const isSelected = app.status === "selected";
          return (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col gap-2 max-w-xl text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-450 dark:text-slate-550 text-slate-400">#{post.id || app.job_post_id}</span>
                  {app.status === "pending" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {t("Đang chờ duyệt")}
                    </span>
                  )}
                  {app.status === "selected" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30 animate-pulse">
                      {t("Được mời nhận việc")}
                    </span>
                  )}
                  {app.status === "accepted" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-450 border border-green-100 dark:border-green-900/30">
                      {t("Đã nhận việc")}
                    </span>
                  )}
                  {app.status === "rejected" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-450 border border-red-100 dark:border-red-900/30">
                      {t("Từ chối / Bị từ chối")}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 leading-snug">{post.title || "Công việc gia đình"}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 line-clamp-2">{post.description || "Không có mô tả chi tiết."}</p>
                <div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-450 dark:text-slate-550 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Icon icon="material-symbols:payments-outline" className="text-sm" />
                    {post.salary ? `${Number(post.salary).toLocaleString()} VNĐ` : "Thỏa thuận"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="material-symbols:location-on-outline" className="text-sm" />
                    {post.district || ""}, {post.city || ""}
                  </span>
                  {app.proposed_price && (
                    <span className="flex items-center gap-1 font-semibold text-[#026E5F] dark:text-teal-400">
                      <Icon icon="material-symbols:local-offer-outline" className="text-sm" />
                      {t("Đề xuất")}: {Number(app.proposed_price).toLocaleString()} VNĐ
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-3 p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs text-amber-850 dark:text-amber-300 font-medium">
                    {t("Khách hàng đã chấp nhận bạn cho công việc này. Vui lòng phản hồi Đồng ý hoặc Từ chối.")}
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleRespondToSelection(app.id, "accept")}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Icon icon="material-symbols:check-circle" className="text-base" />
                    {t("Đồng ý")}
                  </button>
                  <button
                    onClick={() => handleRespondToSelection(app.id, "reject")}
                    className="px-5 py-2.5 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/20 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Icon icon="material-symbols:cancel" className="text-base" />
                    {t("Từ chối")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="flex flex-col gap-8">
        {renderHeader()}
        {renderTabs()}

        {activeMainTab === "bookings" ? (
          <>
            {isLoading ? (
              <div className="w-full min-h-[40vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-teal-500/25 border-t-[#026E5F] animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("Đang tải danh sách lịch đặt...")}</p>
              </div>
            ) : totalItems > 0 ? (
              renderTable()
            ) : (
              renderEmpty()
            )}
          </>
        ) : activeMainTab === "helper-applications" ? (
          <div className="mt-2">{renderHelperApplicationsSection()}</div>
        ) : (
          <div className="mt-2">{renderMyJobPostsSection()}</div>
        )}
      </div>

      {/* Modals for Job Posts */}
      {renderApplicationsModal()}
      {renderHelperProfileModal()}
      {renderEditJobPostModal()}

      {/* ── Inline Payment Modal ────────────────────────────────── */}
      {showPaymentModal &&
        paymentBooking &&
        (() => {
          const isCompleted = paymentBooking.paymentStatus === "completed";
          if (isCompleted) {
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <PaymentReceipt
                  bookingId={paymentBooking.id}
                  serviceName={paymentBooking.serviceName}
                  helperName={paymentBooking.helper?.name || ""}
                  bookingDate={paymentBooking.date}
                  bookingTime={paymentBooking.time}
                  totalPrice={paymentBooking.totalPrice}
                  paymentMethod={paymentBooking.paymentInfo?.payment_method}
                  transactionId={paymentBooking.paymentInfo?.transaction_id || paymentBooking.paymentInfo?.vnpay_txn_ref || `TX-${paymentBooking.idRaw}`}
                  paymentDate={paymentBooking.paymentInfo?.created_at ? formatDateTime(paymentBooking.paymentInfo.created_at) : paymentBooking.date}
                  isSuccess={true}
                  onClose={closePaymentModal}
                  isHelper={isHelper}
                  grossAmount={paymentBooking.paymentInfo?.gross_amount}
                  commissionRate={paymentBooking.paymentInfo?.commission_rate}
                  commissionAmount={paymentBooking.paymentInfo?.commission_amount}
                  earnedAmount={paymentBooking.paymentInfo?.earned_amount}
                  releasedAt={paymentBooking.paymentInfo?.released_at}
                  actions={
                    <>
                      <button
                        onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                      >
                        <Icon icon="material-symbols:print-outline" className="text-sm" />
                        {t("In hóa đơn")}
                      </button>
                      <button
                        onClick={closePaymentModal}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#026E5F] hover:bg-[#01564a] text-white text-xs font-bold transition active:scale-95 cursor-pointer text-center"
                      >
                        {t("Đóng")}
                      </button>
                    </>
                  }
                />
              </div>
            );
          }
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-850 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                      <Icon icon={isCompleted ? "material-symbols:receipt-long-outline" : "material-symbols:payments-outline"} className="text-2xl text-[#026E5F]" />
                      {isCompleted ? t("Hóa đơn thanh toán") : t("Thanh toán đặt lịch")}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {paymentBooking.id} {!isCompleted && `— ${paymentBooking.serviceName}`}
                    </p>
                  </div>
                  <button
                    onClick={closePaymentModal}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
                  >
                    <Icon icon="material-symbols:close" className="text-xl" />
                  </button>
                </div>

                {/* Body */}
                {isCompleted ? (
                  <div className="px-6 py-6 space-y-4">
                    <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2.5">
                        <Icon icon="material-symbols:check-circle-outline" className="text-4xl text-emerald-500" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">{t("Thanh toán thành công")}</h4>
                      <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-1">{paymentBooking.totalPrice}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Mã đặt lịch")}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">{paymentBooking.id}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Dịch vụ")}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">{paymentBooking.serviceName}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{isHelper ? t("Khách hàng") : t("Nhân viên")}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">{paymentBooking.helper?.name || ""}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Thời gian")}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">
                          {paymentBooking.date} ({paymentBooking.time})
                        </span>
                      </div>

                      <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Phương thức")}</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">
                            {paymentBooking.paymentInfo?.payment_method === "vnpay" ? "VNPay" : paymentBooking.paymentInfo?.payment_method === "cash" ? t("Tiền mặt") : t("Ví điện tử / Thẻ")}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Mã giao dịch")}</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right break-all">
                            {paymentBooking.paymentInfo?.transaction_id || paymentBooking.paymentInfo?.vnpay_txn_ref || `TX-${paymentBooking.idRaw}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Thời gian thanh toán")}</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">
                            {paymentBooking.paymentInfo?.created_at ? formatDateTime(paymentBooking.paymentInfo.created_at) : paymentBooking.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-450 dark:text-slate-500">
                      {t("Hóa đơn này được tạo tự động bởi hệ thống và có giá trị làm bằng chứng thanh toán hợp lệ.")}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-6 space-y-5">
                    {/* Booking info summary */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Đơn đặt lịch")}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{paymentBooking.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Dịch vụ")}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{paymentBooking.serviceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("Ngày / Giờ")}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {paymentBooking.date} — {paymentBooking.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-extrabold text-slate-700 dark:text-white">{t("Tổng tiền")}</span>
                        <span className="text-lg font-extrabold text-[#026E5F] dark:text-teal-400">{paymentBooking.totalPrice}</span>
                      </div>
                    </div>

                    {/* Payment method selector */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5">{t("Phương thức thanh toán")}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("vnpay")}
                          disabled={isPaymentProcessing}
                          className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-bold transition-all cursor-pointer disabled:opacity-50 ${
                            paymentMethod === "vnpay"
                              ? "border-[#026E5F] bg-teal-50 dark:bg-teal-900/20 text-[#026E5F] dark:text-teal-400 shadow-sm ring-1 ring-[#026E5F]/20"
                              : "border-slate-200 dark:border-slate-70 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <Icon icon="arcticons:v-vnpay" className="text-lg shrink-0" />
                          VNPay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cash")}
                          disabled={isPaymentProcessing}
                          className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-bold transition-all cursor-pointer disabled:opacity-50 ${
                            paymentMethod === "cash"
                              ? "border-[#026E5F] bg-teal-50 dark:bg-teal-900/20 text-[#026E5F] dark:text-teal-400 shadow-sm ring-1 ring-[#026E5F]/20"
                              : "border-slate-200 dark:border-slate-70 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <Icon icon="material-symbols:payments-outline" className="text-lg shrink-0" />
                          {t("Tiền mặt")}
                        </button>
                      </div>
                    </div>

                    {/* VNPay notice */}
                    {paymentMethod === "vnpay" && !isPaymentProcessing && (
                      <div className="flex flex-col gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Icon icon="material-symbols:open-in-new" className="shrink-0 text-sm mt-0.5" />
                          <span>{t("Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch an toàn.")}</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Icon icon="material-symbols:warning-amber-outline-rounded" className="shrink-0 text-sm mt-0.5 text-amber-600 dark:text-amber-500" />
                          <span className="font-semibold text-amber-700 dark:text-amber-400">
                            {t("Lưu ý: Quý khách vui lòng thanh toán trong vòng 30 phút, nếu không đơn đặt lịch sẽ tự động bị hủy.")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Processing state */}
                    {isPaymentProcessing && (
                      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                        <Icon icon="svg-spinners:3-dots-fade" className="text-2xl text-[#026E5F]" />
                        <span className="text-sm font-medium text-[#026E5F] dark:text-teal-300">{t("Đang xử lý thanh toán...")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer actions */}
                <div className="px-6 pb-6 flex gap-3">
                  {isCompleted ? (
                    <>
                      <button
                        onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        <Icon icon="material-symbols:print-outline" className="text-sm" />
                        {t("In hóa đơn")}
                      </button>
                      <button
                        onClick={closePaymentModal}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#026E5F] hover:bg-[#01564a] text-white text-xs font-bold transition active:scale-95 cursor-pointer text-center"
                      >
                        {t("Đóng")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={closePaymentModal}
                        disabled={isPaymentProcessing}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {t("Hủy")}
                      </button>
                      <button
                        onClick={handlePayBooking}
                        disabled={isPaymentProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#026E5F] hover:bg-[#01564a] text-white text-sm font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-60 shadow-sm"
                      >
                        {isPaymentProcessing ? (
                          <Icon icon="svg-spinners:3-dots-fade" className="text-lg" />
                        ) : paymentMethod === "vnpay" ? (
                          <Icon icon="material-symbols:open-in-new" className="text-lg" />
                        ) : (
                          <Icon icon="material-symbols:check-circle-outline" className="text-lg" />
                        )}
                        {paymentMethod === "vnpay" ? t("Thanh toán qua VNPay") : t("Xác nhận thanh toán")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Review Modal */}
      {isReviewModalOpen && reviewTargetBooking && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewTargetBooking(null);
          }}
          helperId={(reviewTargetBooking.helper as any)?.idRaw || (reviewTargetBooking.helper as any)?.id || (reviewTargetBooking as any)?.helper_id}
          helperName={reviewTargetBooking.helper.name}
          helperAvatar={reviewTargetBooking.helper.avatar}
          bookingId={Number(reviewTargetBooking.idRaw || reviewTargetBooking.id)}
          onSuccess={() => {
            if (reviewTargetBooking) markAsReviewed(reviewTargetBooking.idRaw);
            refreshBookings();
          }}
        />
      )}

      {/* Toast states */}
      {renderReportModal()}
    </div>
  );
};

export default HistoryPage;
