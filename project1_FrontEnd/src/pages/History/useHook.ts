import { useState, useEffect } from "react";

export interface Booking {
  id: string;
  serviceName: string;
  helper: {
    name: string;
    avatar: string;
  };
  date: string;
  time: string;
  totalPrice: string;
  status: "upcoming" | "completed" | "cancelled";
}

export type StatusFilter = "all" | "upcoming" | "completed" | "cancelled";

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "#BK-8472",
    serviceName: "Dọn dẹp nhà cửa",
    helper: {
      name: "Nguyễn Thị Mai",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop",
    },
    date: "24/10/2024",
    time: "08:00 - 10:00",
    totalPrice: "350.000đ",
    status: "upcoming",
  },
  {
    id: "#BK-8310",
    serviceName: "Nấu ăn gia đình",
    helper: {
      name: "Trần Văn Hùng",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=80&auto=format&fit=crop",
    },
    date: "20/10/2024",
    time: "16:30 - 18:30",
    totalPrice: "200.000đ",
    status: "completed",
  },
  {
    id: "#BK-8105",
    serviceName: "Giặt ủi",
    helper: {
      name: "Lê Thị Lan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop",
    },
    date: "15/10/2024",
    time: "09:00 - 11:00",
    totalPrice: "150.000đ",
    status: "cancelled",
  },
  {
    id: "#BK-8090",
    serviceName: "Chăm sóc người già",
    helper: {
      name: "Phạm Văn Nam",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop",
    },
    date: "12/10/2024",
    time: "08:00 - 12:00",
    totalPrice: "600.000đ",
    status: "completed",
  },
  {
    id: "#BK-8088",
    serviceName: "Trông trẻ em",
    helper: {
      name: "Hoàng Thanh Mai",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80&auto=format&fit=crop",
    },
    date: "10/10/2024",
    time: "14:00 - 17:00",
    totalPrice: "450.000đ",
    status: "completed",
  },
  {
    id: "#BK-8054",
    serviceName: "Tổng vệ sinh nhà cửa",
    helper: {
      name: "Lê Văn Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
    },
    date: "05/10/2024",
    time: "08:00 - 14:00",
    totalPrice: "900.000đ",
    status: "completed",
  },
  {
    id: "#BK-8021",
    serviceName: "Dọn dẹp nhà cửa",
    helper: {
      name: "Nguyễn Thị Mai",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop",
    },
    date: "01/10/2024",
    time: "09:00 - 11:00",
    totalPrice: "240.000đ",
    status: "cancelled",
  },
  {
    id: "#BK-7998",
    serviceName: "Nấu ăn gia đình",
    helper: {
      name: "Đỗ Thị Thu",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=80&auto=format&fit=crop",
    },
    date: "28/09/2024",
    time: "17:00 - 19:00",
    totalPrice: "300.000đ",
    status: "completed",
  },
  {
    id: "#BK-7985",
    serviceName: "Chăm sóc người già",
    helper: {
      name: "Phạm Thị Hoa",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop",
    },
    date: "25/09/2024",
    time: "08:00 - 16:00",
    totalPrice: "1.200.000đ",
    status: "completed",
  },
  {
    id: "#BK-8500",
    serviceName: "Vệ sinh máy lạnh",
    helper: {
      name: "Trần Văn Tú",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=80&auto=format&fit=crop",
    },
    date: "28/10/2024",
    time: "09:00 - 10:30",
    totalPrice: "250.000đ",
    status: "upcoming",
  },
  {
    id: "#BK-8521",
    serviceName: "Dọn dẹp nhà cửa",
    helper: {
      name: "Nguyễn Thị Lan",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80&auto=format&fit=crop",
    },
    date: "30/10/2024",
    time: "13:00 - 15:00",
    totalPrice: "240.000đ",
    status: "upcoming",
  },
  {
    id: "#BK-7954",
    serviceName: "Giặt ủi",
    helper: {
      name: "Lê Thị Lan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop",
    },
    date: "20/09/2024",
    time: "09:00 - 11:00",
    totalPrice: "150.000đ",
    status: "completed",
  },
];

export const useHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("mock_bookings");
    return saved ? JSON.parse(saved) : MOCK_BOOKINGS;
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("mock_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Auto-close toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  });

  // Calculate pagination details
  const totalItems = filteredBookings.length;

  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Actions
  const handleCancelBooking = (booking: Booking) => {
    if (booking.status === "upcoming") {
      if (window.confirm("Bạn có chắc chắn muốn hủy lịch đặt này không?")) {
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)));
        setToast({
          type: "success",
          title: "Hủy thành công",
          message: `Đã hủy lịch đặt ${booking.id} thành công!`,
        });
      }
    } else if (booking.status === "completed") {
      setToast({
        type: "warning",
        title: "Không thể hủy",
        message: `Lịch đặt ${booking.id} đã hoàn thành, không thể hủy.`,
      });
    } else if (booking.status === "cancelled") {
      setToast({
        type: "error",
        title: "Lịch đặt đã hủy",
        message: `Lịch đặt ${booking.id} đã được hủy trước đó.`,
      });
    }
  };

  return {
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    paginatedBookings,
    totalItems,
    itemsPerPage,
    handleCancelBooking,
    toast,
    setToast,
  };
};
