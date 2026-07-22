import { useToast } from "../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { getCustomerBookingsApi, getHelperBookingsApi, cancelBookingApi, startMovingApi, checkinApi, checkoutApi } from "../../api/bookings";
import { getServicesApi } from "../../api/servicesApi/services";
import { getMyPaymentsApi, createVnpayUrlApi, createPaymentApi, confirmCashReceiptApi } from "../../api/payments";
import { getMyApplicationsApi, respondToSelectionApi } from "../../api/jobPostsApi/jobPosts";
import { io } from "socket.io-client";
import { sortBookingsByDate } from "../../utils";
import { ROLES } from "../../constants/roles";
export interface Booking {
  id: string;
  idRaw: number; // numeric primary key
  serviceName: string;
  helper: {
    id?: number | null;
    name: string;
    avatar: string;
    phone?: string;
  };
  date: string;
  time: string;
  totalPrice: string;
  status: "upcoming" | "completed" | "cancelled";
  statusRaw: string; // e.g. pending, confirmed, in_progress, completed, cancelled
  paymentStatus?: "unpaid" | "pending" | "completed" | "failed" | "refunded";
  paymentInfo?: any;
}

export type StatusFilter = "all" | "completed" | "cancelled";

export const useHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemsPerPage = 6;
  // ── Inline Payment Modal ──────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "cash">("vnpay");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState<boolean>(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<number[]>([]);
  const [reportedBookingIds, setReportedBookingIds] = useState<number[]>([]);

  const { showToast } = useToast();

  // Wrapped status filter setter to reset page
  const handleSetStatusFilter = useCallback((filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public services list to build name map
      const svcRes = await getServicesApi({ limit: 1000 });
      const svcMap = new Map((svcRes.data?.data || []).map((s) => [s.id, s.name]));

      // 2. Load current user role
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setIsLoading(false);
        return;
      }
      const user = JSON.parse(userStr);

      // 3. Call API based on role
      const response = user.role_id === ROLES.HELPER ? await getHelperBookingsApi({ limit: 500 }) : await getCustomerBookingsApi({ limit: 1000 });

      // Laravel paginate result has data inside response.data.data.data
      const rawBookingsData = response.data?.data?.data || response.data?.data || [];
      const rawBookings = sortBookingsByDate(rawBookingsData);

      // 3.5 Fetch payments to map status
      const paymentMap = new Map<number, string>();
      const paymentDetailMap = new Map<number, any>();
      try {
        const payRes = await getMyPaymentsApi({ limit: 1000 });
        const payments = payRes.data?.data || [];
        payments.forEach((p: any) => {
          if (p.booking_id) {
            paymentMap.set(p.booking_id, p.status);
            paymentDetailMap.set(p.booking_id, p);
          }
        });
      } catch (payErr) {
        console.error("Error fetching payments for history map:", payErr);
      }

      const mapped: Booking[] = rawBookings.map((b: any) => {
        const firstServiceId = b.services?.[0]?.service_id;
        const serviceName = svcMap.get(firstServiceId) || "Dịch vụ gia đình";

        let dateStr = b.booking_date;
        if (b.booking_date && b.booking_date.includes("-")) {
          const parts = b.booking_date.split("-");
          if (parts.length === 3) {
            dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        // Time calculation
        const startTime = b.start_time ? b.start_time.substring(0, 5) : "";
        const duration = b.services?.[0]?.duration_hours || 2;
        let endTimeStr = "";
        if (startTime) {
          const [h, m] = startTime.split(":").map(Number);
          const endH = (h + duration) % 24;
          endTimeStr = `${startTime} - ${endH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        }

        const isHelper = user.role_id === 3;
        const partner = isHelper ? b.customer : b.helper;

        const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop";
        const avatarUrl = partner?.avatar ? (partner.avatar.startsWith("http") ? partner.avatar : `http://localhost:8000${partner.avatar}`) : defaultAvatar;

        // Map status: pending, confirmed, in_progress -> upcoming
        let frontendStatus: "upcoming" | "completed" | "cancelled" = "upcoming";
        if (b.status === "completed") {
          frontendStatus = "completed";
        } else if (b.status === "cancelled") {
          frontendStatus = "cancelled";
        }

        const payStatus = paymentMap.get(b.id) || "unpaid";
        const paymentInfo = paymentDetailMap.get(b.id) || null;

        return {
          id: b.booking_code || `#BK-${b.id}`,
          idRaw: b.id,
          serviceName,
          helper: {
            id: partner?.id || null,
            name: partner?.full_name || "",
            avatar: avatarUrl,
            phone: partner?.phone || "",
          },
          date: dateStr,
          time: endTimeStr || startTime,
          totalPrice: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(b.total_price),
          status: frontendStatus,
          statusRaw: b.status,
          paymentStatus: payStatus as any,
          paymentInfo,
        };
      });

      const revIds: number[] = [];
      const repIds: number[] = [];
      rawBookings.forEach((b: any) => {
        if (b.reviews && b.reviews.length > 0) revIds.push(b.id);
        if (b.reports && b.reports.length > 0) repIds.push(b.id);
      });
      if (revIds.length > 0) setReviewedBookingIds((prev) => Array.from(new Set([...prev, ...revIds])));
      if (repIds.length > 0) setReportedBookingIds((prev) => Array.from(new Set([...prev, ...repIds])));

      setBookings(mapped);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookings on mount
  useEffect(() => {
    const init = async () => {
      await Promise.resolve();
      fetchData();
    };
    init();
  }, [fetchData]);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.statusRaw === statusFilter;
  });

  // Calculate pagination details
  const totalItems = filteredBookings.length;
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchApplications = useCallback(async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    if (user.role_id !== 3) return; // Only helpers

    setIsApplicationsLoading(true);
    try {
      const res = await getMyApplicationsApi({ limit: 1000 });
      const rawApps = res.data?.data ?? res.data ?? [];
      // Normalize array if nested in paginator object using ES6
      const appList = Array.isArray(rawApps) ? rawApps : (rawApps?.data ?? []);
      setApplications(appList);
    } catch (err) {
      console.error("Error fetching helper applications:", err);
    } finally {
      setIsApplicationsLoading(false);
    }
  }, []);

  // Fetch applications on mount if role is helper
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr && JSON.parse(userStr).role_id === 3) {
      const init = async () => {
        await Promise.resolve();
        fetchApplications();
      };
      init();
    }
  }, [fetchApplications]);

  // Real-time Socket.IO auto-refresh for dashboard states
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8005";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      socket.emit("join", user.id);
    });

    socket.on("notification", () => {
      fetchData();
      if (user.role_id === 3) {
        fetchApplications();
      }
    });

    socket.on("booking_updated", (data: any) => {
      fetchData();
      if (data?.status === "confirmed") {
        if (user.role_id === 3 && Number(data?.helper_id) === Number(user.id)) {
          showToast("success", "Khách hàng đã thanh toán", "Khách hàng đã thanh toán thành công. Vui lòng bấm 'Bắt đầu đi' để bắt đầu di chuyển.");
        } else if (user.role_id === 2 && Number(data?.customer_id) === Number(user.id)) {
          showToast("success", "Thanh toán thành công", "Thanh toán cho đơn đặt lịch của bạn đã được xác nhận thành công.");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchData, fetchApplications, showToast]);

  // Actions
  const handleCancelBooking = async (booking: Booking) => {
    const cancelableStatuses = ["pending", "confirmed"];
    if (cancelableStatuses.includes(booking.statusRaw)) {
      if (window.confirm("Bạn có chắc chắn muốn hủy lịch đặt này không?")) {
        try {
          await cancelBookingApi(booking.idRaw, "Khách hàng chủ động hủy qua giao diện");
          showToast("success", "Hủy thành công", `Đã hủy lịch đặt ${booking.id} thành công!`);
          fetchData();
        } catch (err: any) {
          showToast("error", "Lỗi hủy lịch", err.response?.data?.message || "Không thể hủy lịch đặt này.");
        }
      }
    } else {
      showToast("warning", "Không thể hủy", `Lịch đặt ${booking.id} đang thực hiện hoặc đã hoàn thành, không thể hủy.`);
    }
  };

  const handleStartMoving = async (bookingId: number) => {
    if (window.confirm("Bạn bắt đầu di chuyển đến địa chỉ khách hàng?")) {
      try {
        await startMovingApi(bookingId);
        showToast("success", "Thành công", "Đang trên đường đến địa chỉ khách hàng.");
        fetchData();
      } catch (err: any) {
        showToast("error", "Lỗi", err.response?.data?.message || "Thao tác thất bại.");
      }
    }
  };

  const handleCheckin = async (bookingId: number) => {
    if (window.confirm("Xác nhận bạn đã đến nơi và bắt đầu làm việc?")) {
      try {
        await checkinApi(bookingId);
        showToast("success", "Thành công", "Đã xác nhận đến nơi. Bắt đầu làm việc.");
        fetchData();
      } catch (err: any) {
        showToast("error", "Lỗi", err.response?.data?.message || "Thao tác thất bại.");
      }
    }
  };

  const handleCheckout = async (bookingId: number) => {
    const note = window.prompt("Nhập ghi chú hoàn thành công việc (không bắt buộc):");
    if (note !== null) {
      try {
        await checkoutApi(bookingId, { note });
        showToast("success", "Thành công", "Đã hoàn thành công việc. Chúc mừng!");
        fetchData();
      } catch (err: any) {
        showToast("error", "Lỗi", err.response?.data?.message || "Thao tác thất bại.");
      }
    }
  };

  const handleRespondToSelection = async (applicationId: number, action: "accept" | "reject") => {
    const actionLabel = action === "accept" ? "đồng ý nhận" : "từ chối";
    if (window.confirm(`Bạn có chắc chắn muốn ${actionLabel} công việc này?`)) {
      try {
        await respondToSelectionApi(applicationId, action);
        showToast("success", "Thành công", action === "accept" ? "Đã chấp nhận công việc. Lịch đặt mới đã được tạo và chờ khách hàng thanh toán." : "Đã từ chối lời mời nhận việc.");
        fetchData();
        fetchApplications();
      } catch (err: any) {
        showToast("error", "Lỗi phản hồi", err.response?.data?.message || "Không thể thực hiện thao tác này.");
      }
    }
  };

  const openPaymentModal = (booking: Booking) => {
    setPaymentBooking(booking);
    setPaymentMethod("vnpay");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentBooking(null);
    setIsPaymentProcessing(false);
  };

  const handlePayBooking = async () => {
    if (!paymentBooking) return;

    const amount = parseFloat(paymentBooking.totalPrice.replace(/[^0-9]/g, ""));
    if (!amount || amount <= 0) {
      showToast("error", "Lỗi", "Số tiền không hợp lệ.");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      if (paymentMethod === "vnpay") {
        if (amount < 10000) {
          showToast("error", "Lỗi", "Số tiền thanh toán tối thiểu qua VNPay là 10.000 đ.");
          setIsPaymentProcessing(false);
          return;
        }
        const res = await createVnpayUrlApi({
          amount,
          booking_id: paymentBooking.idRaw,
        });
        closePaymentModal();
        window.location.href = res.payment_url;
      } else {
        await createPaymentApi({
          payment_method: "cash",
          amount,
          booking_id: paymentBooking.idRaw,
        });
        closePaymentModal();
        showToast("success", "Xác nhận chọn Tiền mặt", "Bạn đã chọn thanh toán bằng tiền mặt. Vui lòng thanh toán cho người giúp việc sau khi hoàn thành.");
        fetchData();
      }
    } catch (err: any) {
      showToast("error", "Thanh toán thất bại", err.response?.data?.message || "Không thể xử lý thanh toán. Vui lòng thử lại.");
      setIsPaymentProcessing(false);
    }
  };

  const handleConfirmCashPayment = async (booking: Booking) => {
    if (window.confirm("Xác nhận bạn đã nhận đủ tiền mặt từ khách hàng?")) {
      try {
        let paymentId = booking.paymentInfo?.id;

        if (!paymentId) {
          const amount = parseFloat(booking.totalPrice.replace(/[^0-9]/g, ""));
          if (!amount || amount <= 0) {
            showToast("error", "Lỗi", "Số tiền thanh toán không hợp lệ.");
            return;
          }
          const createRes = await createPaymentApi({
            payment_method: "cash",
            amount,
            booking_id: booking.idRaw,
          });
          paymentId = createRes.data.id;
        }

        await confirmCashReceiptApi(paymentId);
        showToast("success", "Thành công", "Đã xác nhận nhận tiền mặt. Giao dịch hoàn tất!");
        fetchData();
      } catch (err: any) {
        showToast("error", "Lỗi", err.response?.data?.message || "Không thể xác nhận thanh toán.");
      }
    }
  };

  return {
    statusFilter,
    setStatusFilter: handleSetStatusFilter,
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
    isHelper: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).role_id === ROLES.HELPER : false,
    refreshBookings: fetchData,
    applications,
    isApplicationsLoading,
    refreshApplications: fetchApplications,
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
    markAsReviewed: (idRaw: number) => setReviewedBookingIds((prev) => Array.from(new Set([...prev, idRaw]))),
    markAsReported: (idRaw: number) => setReportedBookingIds((prev) => Array.from(new Set([...prev, idRaw]))),
  };
};
