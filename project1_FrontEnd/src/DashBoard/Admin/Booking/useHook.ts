import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getRootFontSizePx } from "../../../utils";
import { QUALITATIVE_PALETTE } from "../../../constants/colors";
import { getUsersAdmin, type User } from "../../../api/usersApi/users";
import { getServicesApi } from "../../../api/servicesApi/services";
import { getPaymentsAdmin, updatePaymentStatusAdmin } from "../../../api/payments";
import { getBookingsAdminApi, updateBookingStatusAdminApi } from "../../../api/bookings";
import { ROLES } from "../../../constants/roles";
import { io } from "socket.io-client";

const getUniqueColor = (index: number): string => {
  return QUALITATIVE_PALETTE[index % QUALITATIVE_PALETTE.length];
};

export interface HelperOption {
  name: string;
  value: string;
  avatar: string | null;
  phone: string | null;
}

export interface BookingService {
  name: string;
  price: number;
  duration_hours: number;
  quantity: number;
}

export interface BookingItem {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  helperName: string | null;
  helperAvatar: string | null;
  helperPhone: string | null;
  address: string;
  district: string;
  city: string;
  bookingDate: string;
  startTime: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  note: string;
  cancelBy: string | null;
  cancelReason: string | null;
  refundStatus: "none" | "pending" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  services: BookingService[];
  rating: number | null;
  reviewComment: string | null;
  createdAt: string;
}

export const useBooking = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
  const [selectedPayment, setSelectedPayment] = useState<string>("All Payments");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Booking for Detail View
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Edit / Status reassignment state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);

  const { showToast } = useToast();

  // Dynamic helper list fetched from identity-service database
  const [helperList, setHelperList] = useState<HelperOption[]>([{ name: "Chưa phân phối", value: "", avatar: null, phone: null }]);

  // Fetch helpers
  useEffect(() => {
    let isMounted = true;
    const fetchHelpers = async () => {
      try {
        const res = await getUsersAdmin({ role_id: ROLES.HELPER, limit: 100 });
        const helpersData = res?.data?.data || [];
        if (isMounted && Array.isArray(helpersData) && helpersData.length > 0) {
          const formatted: HelperOption[] = [
            { name: "Chưa phân phối", value: "", avatar: null, phone: null },
            ...helpersData.map((u: User) => ({
              name: u.full_name,
              value: u.full_name,
              avatar: u.avatar || null,
              phone: u.phone || null,
            })),
          ];
          setHelperList(formatted);
        }
      } catch {
        // ignore error gracefully
      }
    };
    fetchHelpers();
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch & mapping bookings
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public services list
      const svcRes = await getServicesApi({ limit: 1000 });
      const svcMap = new Map((svcRes.data?.data || []).map((s) => [s.id, s.name]));

      // 2. Fetch payments list to map paymentStatus
      const paymentMap = new Map<number, string>();
      try {
        const payRes = await getPaymentsAdmin({ limit: 1000 });
        const payments = payRes.data || [];
        const paymentsData = Array.isArray(payments) ? payments : payments.data || [];
        paymentsData.forEach((p: any) => {
          if (p.booking_id) {
            paymentMap.set(p.booking_id, p.status);
          }
        });
      } catch {
        // ignore
      }

      // 3. Fetch admin bookings
      const bookingRes = await getBookingsAdminApi({ limit: 1000 });
      const rawBookings = bookingRes.data?.data?.data || bookingRes.data?.data || bookingRes.data || [];

      // 4. Map to BookingItem
      const mapped: BookingItem[] = rawBookings.map((b: any) => {
        const formattedServices: BookingService[] = (b.services || []).map((s: any) => ({
          name: svcMap.get(s.service_id) || `Dịch vụ #${s.service_id}`,
          price: Number(s.price),
          duration_hours: Number(s.duration_hours),
          quantity: Number(s.quantity || 1),
        }));

        let pStatus: "pending" | "paid" | "failed" | "refunded" = "pending";
        const rawPayStatus = paymentMap.get(b.id);
        if (rawPayStatus === "completed") {
          pStatus = "paid";
        } else if (rawPayStatus === "refunded") {
          pStatus = "refunded";
        } else if (rawPayStatus === "failed") {
          pStatus = "failed";
        }

        const primaryReview = b.reviews?.[0] || null;

        const defaultAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop";
        const helperAvatarUrl = b.helper?.avatar ? (b.helper.avatar.startsWith("http") ? b.helper.avatar : `http://localhost:8000${b.helper.avatar}`) : defaultAvatar;

        return {
          id: b.id.toString(),
          bookingCode: b.booking_code || `#BK-${b.id}`,
          customerName: b.customer?.full_name || `Khách hàng #${b.customer_id}`,
          customerPhone: b.customer?.phone || "N/A",
          customerEmail: b.customer?.email || "N/A",
          helperName: b.helper?.full_name || null,
          helperAvatar: b.helper ? helperAvatarUrl : null,
          helperPhone: b.helper?.phone || null,
          address: b.address_details?.address || "N/A",
          district: b.address_details?.district?.name || "N/A",
          city: b.address_details?.city?.name || "N/A",
          bookingDate: b.booking_date,
          startTime: b.start_time,
          totalPrice: Number(b.total_price),
          status: b.status,
          note: b.note || "",
          cancelBy: b.cancel_by ? (Number(b.cancel_by) === Number(b.customer_id) ? "Customer" : "Helper") : null,
          cancelReason: b.cancel_reason || null,
          refundStatus: b.refund_status || "none",
          paymentStatus: pStatus,
          services: formattedServices,
          rating: primaryReview ? primaryReview.rating : null,
          reviewComment: primaryReview ? primaryReview.comment : null,
          createdAt: b.created_at || "",
        };
      });

      setBookings(mapped);
    } catch {
      // console.error("Failed to load booking list: ", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookings on mount & setup socket.io refresh
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchBookings();
    });

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8005";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        socket.emit("join", user.id);
      }
    });

    socket.on("notification", () => {
      fetchBookings();
    });

    socket.on("booking_updated", () => {
      fetchBookings();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchBookings]);

  // Wrapper functions to reset pages and clear selection when values change (prevents cascading state updates inside effects)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };
  const handleStatusFilterChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };
  const handlePaymentFilterChange = (val: string) => {
    setSelectedPayment(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  // Actions
  const handleOpenDetail = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
    setIsDetailOpen(false);
  };

  const handleOpenEdit = (booking: BookingItem) => {
    setEditingBooking({ ...booking });
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditingBooking(null);
    setIsEditOpen(false);
  };

  const handleUpdateBooking = async (updated: BookingItem) => {
    try {
      // 1. Update Booking status and note via API
      await updateBookingStatusAdminApi(updated.id, {
        status: updated.status,
        note: updated.note,
      });

      // 2. Sync payment status if changed
      const originalBooking = bookings.find((b) => b.id === updated.id);
      if (originalBooking && originalBooking.paymentStatus !== updated.paymentStatus) {
        const payRes = await getPaymentsAdmin({ booking_id: updated.id });
        const payments = payRes.data || [];
        const paymentsData = Array.isArray(payments) ? payments : payments.data || [];
        const bookingPayment = paymentsData.find((p: any) => Number(p.booking_id) === Number(updated.id));
        if (bookingPayment) {
          const mapToBackendStatus =
            {
              paid: "completed",
              pending: "pending",
              failed: "failed",
              refunded: "refunded",
            }[updated.paymentStatus] || "pending";
          await updatePaymentStatusAdmin(bookingPayment.id, mapToBackendStatus as any);
        }
      }

      showToast("success", "Cập nhật thành công", `Cập nhật thông tin đơn đặt lịch ${updated.bookingCode} thành công!`);
      handleCloseEdit();
      fetchBookings();
      if (selectedBooking && selectedBooking.id === updated.id) {
        setSelectedBooking(updated);
      }
    } catch {
      showToast("error", "Lỗi cập nhật", "Có lỗi xảy ra khi cập nhật đơn lịch.");
    }
  };

  const handleDeleteBooking = (id: string) => {
    showToast("error", "Không thể xóa", `Không hỗ trợ xóa đơn đặt lịch trực tiếp khỏi hệ thống (ID: ${id}).`);
  };

  const handleQuickStatusChange = async (id: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    try {
      await updateBookingStatusAdminApi(id, {
        status: newStatus,
        note: "Trạng thái được cập nhật trực quan bởi Admin/Operator.",
      });

      showToast("success", "Cập nhật trạng thái", `Đã đổi trạng thái booking thành công sang "${newStatus}".`);
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => {
          if (!prev) return null;
          return { ...prev, status: newStatus };
        });
      }
    } catch {
      showToast("error", "Lỗi cập nhật", "Không thể cập nhật trạng thái đơn đặt lịch.");
    }
  };

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.helperName && booking.helperName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        booking.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "All Statuses" || booking.status === selectedStatus.toLowerCase();

      const matchesPayment = selectedPayment === "All Payments" || booking.paymentStatus === selectedPayment.toLowerCase();

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, searchQuery, selectedStatus, selectedPayment]);

  // Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const totalRevenue = bookings.filter((b) => b.status === "completed" || b.status === "confirmed").reduce((sum, b) => sum + b.totalPrice, 0);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      confirmed,
      cancelled,
      totalRevenue,
      completionRate,
    };
  }, [bookings]);

  // Paginated list
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const rem = getRootFontSizePx();

  const pieOption = useMemo(() => {
    const data = [
      { name: "Completed", value: bookings.filter((b) => b.status === "completed").length },
      { name: "Confirmed", value: bookings.filter((b) => b.status === "confirmed").length },
      { name: "Pending", value: bookings.filter((b) => b.status === "pending").length },
      { name: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length },
    ].filter((item) => item.value > 0);

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: "0",
        left: "center",
        itemWidth: 0.5 * rem,
        itemHeight: 0.5 * rem,
        textStyle: { color: "#64748b", fontSize: 0.75 * rem },
      },
      series: [
        {
          name: "Trạng thái",
          type: "pie",
          radius: ["45%", "70%"],
          center: ["50%", "42%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0.375 * rem,
            borderColor: "#fff",
            borderWidth: 0.125 * rem,
          },
          label: { show: false, position: "center" },
          emphasis: {
            label: {
              show: true,
              fontSize: 0.9 * rem,
              fontWeight: "bold",
              formatter: "{b}\n{c} đơn",
            },
          },
          labelLine: { show: false },
          data: data.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: getUniqueColor(index) },
          })),
        },
      ],
    };
  }, [bookings, rem]);

  const lineOption = useMemo(() => {
    const dates = Array.from(new Set(bookings.map((b) => b.bookingDate))).sort();
    const counts = dates.map((date) => bookings.filter((b) => b.bookingDate === date).length);
    const revenue = dates.map((date) => bookings.filter((b) => b.bookingDate === date && (b.status === "completed" || b.status === "confirmed")).reduce((sum, b) => sum + b.totalPrice, 0));

    // Format dates to DD/MM for simpler display
    const formattedLabels = dates.map((date) => {
      const parts = date.split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
    });

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      legend: {
        data: ["Số lượng đơn", "Doanh thu"],
        bottom: "0",
        textStyle: { color: "#64748b", fontSize: 0.75 * rem },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "12%",
        top: "12%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: formattedLabels,
          axisLine: { lineStyle: { color: "#e2e8f0" } },
          axisLabel: { color: "#64748b", fontSize: 0.75 * rem },
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Số đơn",
          minInterval: 1,
          axisLabel: { color: "#64748b", fontSize: 0.75 * rem },
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
        },
        {
          type: "value",
          name: "Doanh thu (₫)",
          axisLabel: {
            color: "#64748b",
            fontSize: 0.75 * rem,
            formatter: (val: number) => (val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Số lượng đơn",
          type: "bar",
          barWidth: "40%",
          data: counts,
          itemStyle: {
            color: getUniqueColor(0),
            borderRadius: [0.25 * rem, 0.25 * rem, 0, 0],
          },
        },
        {
          name: "Doanh thu",
          type: "line",
          yAxisIndex: 1,
          smooth: false,
          data: revenue,
          lineStyle: { width: 3, color: getUniqueColor(1) },
          itemStyle: { color: getUniqueColor(1) },
          symbolSize: 8,
        },
      ],
    };
  }, [bookings, rem]);

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === paginatedBookings.length ? [] : paginatedBookings.map((b) => b.id)));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    showToast("error", "Không thể xóa", "Không hỗ trợ xóa hàng loạt đơn đặt lịch trực tiếp khỏi hệ thống.");
  };

  return {
    bookings,
    isLoading,
    helperList,
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedStatus,
    setSelectedStatus: handleStatusFilterChange,
    selectedPayment,
    setSelectedPayment: handlePaymentFilterChange,
    currentPage,
    setCurrentPage: handlePageChange,
    itemsPerPage,
    filteredBookings,
    filteredCount: filteredBookings.length,
    paginatedBookings,
    metrics,
    selectedBooking,
    isDetailOpen,
    isEditOpen,
    editingBooking,
    setEditingBooking,
    handleOpenDetail,
    handleCloseDetail,
    handleOpenEdit,
    handleCloseEdit,
    handleUpdateBooking,
    handleDeleteBooking,
    handleQuickStatusChange,
    pieOption,
    lineOption,

    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
  };
};
