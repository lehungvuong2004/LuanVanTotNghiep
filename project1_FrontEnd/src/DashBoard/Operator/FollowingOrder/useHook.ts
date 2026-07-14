import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getBookingsAdminApi, getBookingDetailAdminApi, updateBookingStatusAdminApi } from "../../../api/bookings";
import { getUsersAdmin, type User } from "../../../api/users";

export interface BookingService {
  id: number;
  booking_id: number;
  service_id: number;
  price: number;
  duration_hours: number;
  quantity: number;
  name?: string; // Resolved service name if needed
}

export interface BookingItem {
  id: number;
  booking_code: string;
  customer_id: number;
  helper_id: number | null;
  address_id: number;
  booking_date: string;
  start_time: string;
  total_price: number;
  status: "pending" | "confirmed" | "on_the_way" | "in_progress" | "completed" | "cancelled";
  note: string | null;
  cancel_by: number | null;
  cancel_reason: string | null;
  refund_status: "none" | "pending" | "refunded";
  created_at: string;
  services: BookingService[];
  status_histories?: any[];
  work_logs?: any[];
  reviews?: any[];
  reports?: any[];
}

export const useFollowingOrder = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Selected Booking for Detail View
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Toast message
  const { showToast } = useToast();

  // Fetch users map (to resolve customer & helper names)
  const fetchUsersMap = useCallback(async () => {
    try {
      const response = await getUsersAdmin({ limit: 500 });
      const usersList = response.data?.data || [];
      const map: Record<number, User> = {};
      usersList.forEach((u) => {
        map[u.id] = u;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to load users map:", error);
    }
  }, []);

  // Fetch bookings list
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "All Statuses" ? selectedStatus.toLowerCase() : undefined;
      const response = await getBookingsAdminApi({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
      });

      const resData = response.data?.data;
      setBookings(resData?.data || []);
      setTotalPages(resData?.last_page || 1);
      setTotalItems(resData?.total || 0);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách đặt lịch.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, itemsPerPage, showToast]);

  // Load initial data
  useEffect(() => {
    let active = true;
    const init = async () => {
      await fetchUsersMap();
      if (active) {
        await fetchBookings();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchUsersMap, fetchBookings]);

  // Filter bookings locally by search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!searchQuery) return true;
      const customer = usersMap[b.customer_id];
      const helper = b.helper_id ? usersMap[b.helper_id] : null;
      const query = searchQuery.toLowerCase();

      const matchesCode = b.booking_code?.toLowerCase().includes(query) || false;
      const matchesCustomer = customer?.full_name?.toLowerCase().includes(query) || false;
      const matchesHelper = helper?.full_name?.toLowerCase().includes(query) || false;
      const matchesPhone = customer?.phone?.includes(query) || helper?.phone?.includes(query) || false;

      return matchesCode || matchesCustomer || matchesHelper || matchesPhone;
    });
  }, [bookings, searchQuery, usersMap]);

  // View booking detail
  const handleOpenDetail = async (booking: BookingItem) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await getBookingDetailAdminApi(booking.id);
      setSelectedBooking(response.data?.data || booking);
    } catch (error: any) {
      showToast("error", "Lỗi tải chi tiết", error.response?.data?.message || "Không thể tải chi tiết đặt lịch.");
      setSelectedBooking(booking); // fallback to list item
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
    setIsDetailOpen(false);
  };

  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string, note?: string) => {
    setActionLoading(true);
    try {
      await updateBookingStatusAdminApi(bookingId, { new_status: newStatus, note });
      showToast("success", "Cập nhật thành công", `Đã cập nhật trạng thái đơn đặt lịch thành công.`);

      // Refresh details if currently open
      if (selectedBooking && selectedBooking.id === bookingId) {
        const response = await getBookingDetailAdminApi(bookingId);
        setSelectedBooking(response.data?.data || selectedBooking);
      }

      await fetchBookings();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật", error.response?.data?.message || "Không thể cập nhật trạng thái đặt lịch.");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = totalItems;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    return {
      total,
      completed,
      pending,
      confirmed,
      cancelled,
    };
  }, [bookings, totalItems]);

  return {
    bookings: filteredBookings,
    usersMap,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus: (status: string) => {
      setSelectedStatus(status);
      setCurrentPage(1);
    },
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    selectedBooking,
    isDetailOpen,
    detailLoading,
    actionLoading,
    handleOpenDetail,
    handleCloseDetail,
    handleUpdateBookingStatus,
    metrics,

    itemsPerPage,
  };
};
