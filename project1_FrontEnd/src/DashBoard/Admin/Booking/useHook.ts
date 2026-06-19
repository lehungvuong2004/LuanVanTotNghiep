import { useState, useEffect, useMemo } from 'react';
import { getRootFontSizePx } from '../../../utils';
import { QUALITATIVE_PALETTE } from '../../../constants/colors';

export const getUniqueColor = (index: number): string => {
  return QUALITATIVE_PALETTE[index % QUALITATIVE_PALETTE.length];
};

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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  note: string;
  cancelBy: string | null;
  cancelReason: string | null;
  refundStatus: 'none' | 'pending' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  services: BookingService[];
  rating: number | null;
  reviewComment: string | null;
  createdAt: string;
}

const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'BK-001',
    bookingCode: 'BK-20260619-001',
    customerName: 'Nguyễn Văn Hải',
    customerPhone: '0987654321',
    customerEmail: 'hainv@gmail.com',
    helperName: 'Nguyễn Thị Mai',
    helperAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0912345678',
    address: '123 Đường Nguyễn Trãi, Phường 2',
    district: 'Quận 5',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-20',
    startTime: '08:00:00',
    totalPrice: 350000,
    status: 'confirmed',
    note: 'Nhà có người lớn tuổi, vui lòng làm nhẹ tay sạch sẽ.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'paid',
    services: [
      { name: 'Dọn dẹp nhà cửa', price: 350000, duration_hours: 2, quantity: 1 }
    ],
    rating: null,
    reviewComment: null,
    createdAt: '2026-06-19 14:22:01'
  },
  {
    id: 'BK-002',
    bookingCode: 'BK-20260619-002',
    customerName: 'Trần Thị Lan',
    customerPhone: '0909888777',
    customerEmail: 'lantt@gmail.com',
    helperName: 'Trần Văn Hùng',
    helperAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0933111222',
    address: '456 Lê Hồng Phong, Phường 10',
    district: 'Quận 10',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-19',
    startTime: '16:30:00',
    totalPrice: 200000,
    status: 'completed',
    note: 'Vui lòng đến đúng giờ để nấu bữa tối.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'paid',
    services: [
      { name: 'Nấu ăn gia đình', price: 200000, duration_hours: 2, quantity: 1 }
    ],
    rating: 5,
    reviewComment: 'Đồ ăn rất vừa vị, nhân viên sạch sẽ chu đáo.',
    createdAt: '2026-06-18 09:10:45'
  },
  {
    id: 'BK-003',
    bookingCode: 'BK-20260618-003',
    customerName: 'Lê Hoàng Nam',
    customerPhone: '0977666555',
    customerEmail: 'namlh@gmail.com',
    helperName: 'Lê Thị Lan',
    helperAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0944555666',
    address: '789 CMT8, Phường 15',
    district: 'Quận Tân Bình',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-18',
    startTime: '09:00:00',
    totalPrice: 150000,
    status: 'cancelled',
    note: 'Yêu cầu giặt xả thơm tho.',
    cancelBy: 'Customer',
    cancelReason: 'Khách hàng bận việc đột xuất không có nhà.',
    refundStatus: 'refunded',
    paymentStatus: 'refunded',
    services: [
      { name: 'Giặt ủi', price: 150000, duration_hours: 2, quantity: 1 }
    ],
    rating: null,
    reviewComment: null,
    createdAt: '2026-06-17 15:30:12'
  },
  {
    id: 'BK-004',
    bookingCode: 'BK-20260617-004',
    customerName: 'Phạm Minh Quân',
    customerPhone: '0911222333',
    customerEmail: 'quanpm@gmail.com',
    helperName: 'Phạm Văn Nam',
    helperAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0922333444',
    address: '101 Hoàng Văn Thụ',
    district: 'Quận Phú Nhuận',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-17',
    startTime: '08:00:00',
    totalPrice: 600000,
    status: 'completed',
    note: 'Chăm sóc người già ốm yếu, cần người có kinh nghiệm.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'paid',
    services: [
      { name: 'Chăm sóc người già', price: 600000, duration_hours: 4, quantity: 1 }
    ],
    rating: 4,
    reviewComment: 'Nhân viên nhiệt tình, chăm sóc chu đáo chu toàn.',
    createdAt: '2026-06-16 11:20:00'
  },
  {
    id: 'BK-005',
    bookingCode: 'BK-20260616-005',
    customerName: 'Hoàng Thu Trang',
    customerPhone: '0988777666',
    customerEmail: 'tranght@gmail.com',
    helperName: 'Hoàng Thanh Mai',
    helperAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0955666777',
    address: '222 Điện Biên Phủ',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-16',
    startTime: '14:00:00',
    totalPrice: 450000,
    status: 'completed',
    note: 'Trông bé 3 tuổi, chơi cùng bé và cho bé ăn xế.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'paid',
    services: [
      { name: 'Trông trẻ em', price: 450000, duration_hours: 3, quantity: 1 }
    ],
    rating: 5,
    reviewComment: 'Chăm bé rất khéo, bé rất thích cô Mai.',
    createdAt: '2026-06-15 16:45:00'
  },
  {
    id: 'BK-006',
    bookingCode: 'BK-20260615-006',
    customerName: 'Nguyễn Hoàng Long',
    customerPhone: '0966555444',
    customerEmail: 'longnh@gmail.com',
    helperName: 'Lê Văn Nam',
    helperAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0966777888',
    address: '55/12 Võ Thị Sáu',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-15',
    startTime: '08:00:00',
    totalPrice: 900000,
    status: 'completed',
    note: 'Tổng vệ sinh nhà 3 tầng trước khi dọn vào ở.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'paid',
    services: [
      { name: 'Tổng vệ sinh nhà cửa', price: 900000, duration_hours: 6, quantity: 1 }
    ],
    rating: 5,
    reviewComment: 'Dọn dẹp rất sạch sẽ, mọi ngóc ngách đều sạch bóng.',
    createdAt: '2026-06-14 08:30:00'
  },
  {
    id: 'BK-007',
    bookingCode: 'BK-20260625-007',
    customerName: 'Đỗ Minh Khang',
    customerPhone: '0955444333',
    customerEmail: 'khangdm@gmail.com',
    helperName: 'Trần Văn Tú',
    helperAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0977888999',
    address: '77 Trần Hưng Đạo',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-25',
    startTime: '09:00:00',
    totalPrice: 250000,
    status: 'pending',
    note: 'Vệ sinh 2 máy lạnh Samsung 1.5 HP.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'pending',
    services: [
      { name: 'Vệ sinh máy lạnh', price: 250000, duration_hours: 2, quantity: 1 }
    ],
    rating: null,
    reviewComment: null,
    createdAt: '2026-06-19 10:15:30'
  },
  {
    id: 'BK-008',
    bookingCode: 'BK-20260622-008',
    customerName: 'Nguyễn Khánh Chi',
    customerPhone: '0944333222',
    customerEmail: 'chink@gmail.com',
    helperName: null,
    helperAvatar: null,
    helperPhone: null,
    address: '99 Lê Lợi',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-22',
    startTime: '13:00:00',
    totalPrice: 240000,
    status: 'pending',
    note: 'Dọn dẹp căn hộ 70m2, dọn dẹp phòng khách và bếp.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'pending',
    services: [
      { name: 'Dọn dẹp nhà cửa', price: 240000, duration_hours: 2, quantity: 1 }
    ],
    rating: null,
    reviewComment: null,
    createdAt: '2026-06-19 11:45:00'
  },
  {
    id: 'BK-009',
    bookingCode: 'BK-20260621-009',
    customerName: 'Vũ Minh Tuấn',
    customerPhone: '0933222111',
    customerEmail: 'tuanvm@gmail.com',
    helperName: 'Lê Thị Lan',
    helperAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop',
    helperPhone: '0944555666',
    address: '321 Nguyễn Đình Chiểu',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    bookingDate: '2026-06-21',
    startTime: '10:00:00',
    totalPrice: 300000,
    status: 'confirmed',
    note: 'Ủi 20 áo sơ mi và quần tây nam.',
    cancelBy: null,
    cancelReason: null,
    refundStatus: 'none',
    paymentStatus: 'pending',
    services: [
      { name: 'Giặt ủi', price: 150000, duration_hours: 2, quantity: 2 }
    ],
    rating: null,
    reviewComment: null,
    createdAt: '2026-06-19 09:20:10'
  }
];

export const useBooking = () => {
  const [bookings, setBookings] = useState<BookingItem[]>(() => {
    const saved = localStorage.getItem('admin_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [selectedPayment, setSelectedPayment] = useState<string>('All Payments');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Booking for Detail View
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Edit / Status reassignment state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);

  // Toast message
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Persist data
  useEffect(() => {
    localStorage.setItem('admin_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Wrapper functions to reset page when search query or filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };
  const handlePaymentFilterChange = (val: string) => {
    setSelectedPayment(val);
    setCurrentPage(1);
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

  const handleUpdateBooking = (updated: BookingItem) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    // If selected booking is open, update details too
    if (selectedBooking && selectedBooking.id === updated.id) {
      setSelectedBooking(updated);
    }
    setToast({
      type: 'success',
      title: 'Cập nhật thành công',
      message: `Cập nhật thông tin đơn đặt lịch ${updated.bookingCode} thành công!`,
    });
    handleCloseEdit();
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn đặt lịch này?')) {
      const booking = bookings.find(b => b.id === id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setToast({
        type: 'success',
        title: 'Xóa thành công',
        message: `Đã xóa đơn đặt lịch ${booking?.bookingCode || id} khỏi hệ thống.`,
      });
      if (selectedBooking?.id === id) {
        handleCloseDetail();
      }
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated: BookingItem = { ...b, status: newStatus };
          if (newStatus === 'completed') {
            updated.paymentStatus = 'paid';
          }
          if (newStatus === 'cancelled') {
            updated.cancelBy = 'Admin';
            updated.cancelReason = 'Được hủy bởi quản trị viên hệ thống.';
            if (updated.paymentStatus === 'paid') {
              updated.refundStatus = 'pending';
            }
          }
          return updated;
        }
        return b;
      })
    );

    // Update Detail modal if open
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => {
        if (!prev) return null;
        const updated: BookingItem = { ...prev, status: newStatus };
        if (newStatus === 'completed') {
          updated.paymentStatus = 'paid';
        }
        if (newStatus === 'cancelled') {
          updated.cancelBy = 'Admin';
          updated.cancelReason = 'Được hủy bởi quản trị viên hệ thống.';
          if (updated.paymentStatus === 'paid') {
            updated.refundStatus = 'pending';
          }
        }
        return updated;
      });
    }

    setToast({
      type: 'success',
      title: 'Cập nhật trạng thái',
      message: `Đã đổi trạng thái booking thành công sang "${newStatus}".`,
    });
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

      const matchesStatus =
        selectedStatus === 'All Statuses' || booking.status === selectedStatus.toLowerCase();

      const matchesPayment =
        selectedPayment === 'All Payments' || booking.paymentStatus === selectedPayment.toLowerCase();

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, searchQuery, selectedStatus, selectedPayment]);

  // Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

    const totalRevenue = bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

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

  // ECharts 1: Status Distribution Pie Chart
  const pieOption = useMemo(() => {
    const data = [
      { name: 'Completed', value: bookings.filter((b) => b.status === 'completed').length },
      { name: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length },
      { name: 'Pending', value: bookings.filter((b) => b.status === 'pending').length },
      { name: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length },
    ].filter(item => item.value > 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0',
        left: 'center',
        itemWidth: 0.5 * rem,
        itemHeight: 0.5 * rem,
        textStyle: { color: '#64748b', fontSize: 0.75 * rem },
      },
      series: [
        {
          name: 'Trạng thái',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0.375 * rem,
            borderColor: '#fff',
            borderWidth: 0.125 * rem
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: {
              show: true,
              fontSize: 0.9 * rem,
              fontWeight: 'bold',
              formatter: '{b}\n{c} đơn'
            }
          },
          labelLine: { show: false },
          data: data.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: getUniqueColor(index) }
          }))
        }
      ]
    };
  }, [bookings, rem]);

  // ECharts 2: Booking Trends (Grouped by Date)
  const lineOption = useMemo(() => {
    // Get unique booking dates in sorted order
    const dates = Array.from(new Set(bookings.map((b) => b.bookingDate))).sort();
    
    // Calculate counts and revenue per date
    const counts = dates.map((date) => bookings.filter((b) => b.bookingDate === date).length);
    const revenue = dates.map((date) => 
      bookings.filter((b) => b.bookingDate === date && (b.status === 'completed' || b.status === 'confirmed'))
      .reduce((sum, b) => sum + b.totalPrice, 0)
    );

    // Format dates to DD/MM for simpler display
    const formattedLabels = dates.map(date => {
      const parts = date.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['Số lượng đơn', 'Doanh thu'],
        bottom: '0',
        textStyle: { color: '#64748b', fontSize: 0.75 * rem }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '12%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: formattedLabels,
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b', fontSize: 0.75 * rem }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Số đơn',
          minInterval: 1,
          axisLabel: { color: '#64748b', fontSize: 0.75 * rem },
          splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        },
        {
          type: 'value',
          name: 'Doanh thu (₫)',
          axisLabel: {
            color: '#64748b',
            fontSize: 0.75 * rem,
            formatter: (val: number) => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Số lượng đơn',
          type: 'bar',
          barWidth: '40%',
          data: counts,
          itemStyle: {
            color: getUniqueColor(0),
            borderRadius: [0.25 * rem, 0.25 * rem, 0, 0]
          }
        },
        {
          name: 'Doanh thu',
          type: 'line',
          yAxisIndex: 1,
          smooth: false,
          data: revenue,
          lineStyle: { width: 3, color: getUniqueColor(1) },
          itemStyle: { color: getUniqueColor(1) },
          symbolSize: 8
        }
      ]
    };
  }, [bookings, rem]);

  return {
    bookings,
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedStatus,
    setSelectedStatus: handleStatusFilterChange,
    selectedPayment,
    setSelectedPayment: handlePaymentFilterChange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
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
    toast,
    setToast
  };
};
