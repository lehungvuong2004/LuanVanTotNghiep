import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/useLogout";
import { io } from "socket.io-client";
import { getNewsList } from "../../api/newsApi/news";
import type { NewsItem as ApiNewsItem } from "../../api/newsApi/news";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../../api/notificationsApi/notifications";
import type { Notification } from "../../api/notificationsApi/notifications";
import { useToast } from "../../contexts/ToastContext";
import { useGeolocation } from "../../hooks/useGeolocation";
import { parseVietnamAddress } from "../../types/location";

export interface Category {
  name: string;
}

// export interface ServiceDetail {
//   name: string;
//   price: string;
//   desc: string;
//   icon: string;
// }

// export interface FeaturedHelper {
//   name: string;
//   rating: number;
//   exp: string;
//   desc: string;
//   area: string;
//   avatar: string;
// }

export interface NewsItem {
  title: string;
  slug: string;
  time: string;
}

export const useHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const { getCurrentLocation, loading: geoLoading, error: geoError, address, addressDetails } = useGeolocation();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access_token");
  });

  const [user, setUser] = useState<any>(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });

  const { logout: handleLogout } = useLogout(() => {
    setIsLoggedIn(false);
    setUser(null);
  });

  const { showToast } = useToast();

  const handleGetCurrentLocation = useCallback(() => {
    setIsLocating(true);
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (!isLocating) return;
    if (geoError) {
      showToast("error", t("Lỗi định vị"), geoError);
      // eslint-disable-next-line
      setIsLocating(false);
    }
  }, [geoError, isLocating, showToast, t]);

  useEffect(() => {
    if (!isLocating) return;
    if (address) {
      const parsed = parseVietnamAddress(addressDetails, address);
      const displayLocation = parsed.district || address;
      showToast("success", t("Định vị thành công"), displayLocation);
      // eslint-disable-next-line
      setIsLocating(false);
    }
  }, [address, addressDetails, isLocating, showToast, t]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
    const userStr = localStorage.getItem("user");
    setUser(userStr ? JSON.parse(userStr) : null);

    const showLoginToast = sessionStorage.getItem("show_login_toast");
    if (showLoginToast === "true") {
      showToast("success", t("Thành công"), t("Đăng nhập thành công!"));
      sessionStorage.removeItem("show_login_toast");
    }

    const showLogoutToast = sessionStorage.getItem("show_logout_toast");
    if (showLogoutToast === "true") {
      showToast("info", t("Đăng Xuất"), t("Bạn đã đăng xuất thành công."));
      sessionStorage.removeItem("show_logout_toast");
    }
  }, [location, t, showToast]);

  // ─── Notifications (API-backed & Real-time) ──────────────────────────────────

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPage, setNotifPage] = useState(1);
  const [notifLastPage, setNotifLastPage] = useState(1);
  const [notifLoading, setNotifLoading] = useState(false);
  const socketRef = useRef<any>(null);

  /** Tải trang đầu hoặc tải thêm (infinite scroll) */
  const fetchNotifications = useCallback(async (page = 1, replace = true) => {
    if (!localStorage.getItem("access_token")) return;
    setNotifLoading(true);
    try {
      const res = await getNotifications({ limit: 20, page });
      const items = res.data.data;
      setNotifications((prev) => (replace ? items : [...prev, ...items]));
      setUnreadCount(res.unread_count);
      setNotifPage(res.data.current_page);
      setNotifLastPage(res.data.last_page);
    } catch {
      // không toast — lỗi im lặng trong dropdown
    } finally {
      setNotifLoading(false);
    }
  }, []);

  /** Load thêm trang tiếp theo */
  const loadMoreNotifications = useCallback(() => {
    if (notifPage < notifLastPage && !notifLoading) {
      fetchNotifications(notifPage + 1, false);
    }
  }, [notifPage, notifLastPage, notifLoading, fetchNotifications]);

  // Fetch lần đầu khi user đăng nhập; reset khi logout
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications(1, true);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn, fetchNotifications]);

  // Thiết lập kết nối Socket.IO thời gian thực
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8005";
      const socket = io(socketUrl);
      socketRef.current = socket;

      socket.on("connect", () => {
        // console.log("Connected to Socket.IO server");
        socket.emit("join", user.id);
      });

      socket.on("notification", (notif: Notification) => {
        // console.log("Received real-time notification:", notif);
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((c) => c + 1);
        showToast("info", notif.title || t("Thông báo mới"), notif.message || "");
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [isLoggedIn, user?.id, t]);

  /** Đánh dấu 1 thông báo đã đọc */
  const toggleRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // revert on error
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 0 } : n)));
      setUnreadCount((c) => c + 1);
    }
  }, []);

  /** Đánh dấu TẤT CẢ đã đọc (optimistic update) */
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 as const })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // revert — tải lại từ API
      fetchNotifications(1, true);
    }
  }, [fetchNotifications]);

  /** Xoá 1 thông báo */
  const removeNotification = useCallback(
    async (id: number) => {
      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.is_read) setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await deleteNotification(id);
      } catch {
        // revert
        if (removed) {
          setNotifications((prev) => [removed, ...prev]);
          if (!removed.is_read) setUnreadCount((c) => c + 1);
        }
      }
    },
    [notifications],
  );

  // ─── End Notifications ──────────────────────────────────────────────────────

  const [activeCategory, setActiveCategory] = useState("Giúp việc theo giờ");

  const navLinks = [
    { name: "Trang Chủ", to: "/" },
    { name: "Dịch Vụ", to: "/dich-vu" },
    { name: "Tuyển dụng", to: "/tuyen-dung" },
    { name: "Tin tức", to: "/tin-tuc" },
    { name: "Liên hệ", to: "/lien-he" },
  ];

  const categories: Category[] = [{ name: "Giúp việc theo giờ" }, { name: "Tổng vệ sinh" }, { name: "Chăm sóc người già" }, { name: "Chăm em bé" }, { name: "Nấu ăn gia đình" }];

  const bottomLinks = [
    // { name: "Tìm người giúp việc", to: "/tim-nguoi-giup-viec" },
    { name: "Tin tức & kinh nghiệm", to: "/tin-tuc" },
  ];

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    getNewsList({ limit: 3, status: "published" })
      .then((res) => {
        setNewsItems(
          res.data.data.map((item: ApiNewsItem) => ({
            title: item.title,
            slug: item.slug,
            time: new Date(item.created_at).toLocaleDateString("vi-VN"),
          })),
        );
      })
      .catch(() => {});
  }, []);

  const categoryDetails = {
    "Giúp việc theo giờ": {
      services: [
        { name: "Dọn nhà", price: "120k/h", desc: "Dịch vụ dọn dẹp cơ bản, vệ sinh phòng ngủ, phòng khách.", icon: "material-symbols:home-outline" },
        { name: "Vệ sinh căn hộ", price: "120k/h", desc: "Vệ sinh sâu cho căn hộ chung cư, khử mùi và sắp xếp đồ đạc.", icon: "material-symbols:apartment" },
      ],
      helpers: [
        {
          name: "Nguyễn Thị Lan",
          rating: 4.8,
          exp: "5 năm kinh nghiệm",
          desc: "Luôn tận tâm, sạch sẽ và đúng giờ.",
          area: "Quận 1, Quận 3",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop",
        },
        {
          name: "Trần Văn Tú",
          rating: 4.9,
          exp: "3 năm kinh nghiệm",
          desc: "Chuyên vệ sinh thiết bị điện máy gia đình.",
          area: "Quận Bình Thạnh",
          avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=80&auto=format&fit=crop",
        },
      ],
    },
    "Tổng vệ sinh": {
      services: [
        { name: "Tổng vệ sinh nhà cửa", price: "150k/h", desc: "Dọn dẹp toàn diện, hút bụi, lau kính, làm sạch sâu mọi ngóc ngách.", icon: "material-symbols:cleaning-services" },
        { name: "Vệ sinh sau xây dựng", price: "180k/h", desc: "Loại bỏ vết sơn, bụi bẩn công trình, làm sạch toàn bộ sàn và kính.", icon: "material-symbols:construction" },
      ],
      helpers: [
        {
          name: "Lê Văn Nam",
          rating: 4.7,
          exp: "4 năm kinh nghiệm",
          desc: "Nhiệt tình, trung thực và làm việc khoa học.",
          area: "Quận 2, Quận 7",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop",
        },
      ],
    },
    "Chăm sóc người già": {
      services: [
        { name: "Chăm sóc tại bệnh viện", price: "140k/h", desc: "Hỗ trợ ăn uống, vệ sinh, theo dõi sức khỏe của cụ tại viện.", icon: "material-symbols:medical-services" },
        { name: "Chăm sóc tại nhà", price: "130k/h", desc: "Bầu bạn, chuẩn bị bữa ăn dinh dưỡng và hỗ trợ sinh hoạt hàng ngày.", icon: "material-symbols:health-and-safety" },
      ],
      helpers: [
        {
          name: "Phạm Thị Hoa",
          rating: 4.9,
          exp: "6 năm kinh nghiệm",
          desc: "Kiên nhẫn, am hiểu tâm lý người cao tuổi.",
          area: "Quận Phú Nhuận",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop",
        },
      ],
    },
    "Chăm em bé": {
      services: [
        { name: "Trông trẻ theo giờ", price: "130k/h", desc: "Chơi cùng bé, cho bé ăn, đưa đón bé đi học theo yêu cầu.", icon: "material-symbols:child-care" },
        { name: "Chăm bé sơ sinh", price: "160k/h", desc: "Kinh nghiệm tắm bé, massage và hỗ trợ mẹ bỉm chăm sóc bé.", icon: "material-symbols:baby-changing-station" },
      ],
      helpers: [
        {
          name: "Hoàng Thanh Mai",
          rating: 4.8,
          exp: "3 năm kinh nghiệm",
          desc: "Yêu trẻ, cẩn thận, có kỹ năng sư phạm mầm non.",
          area: "Quận Tân Bình",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80&auto=format&fit=crop",
        },
      ],
    },
    "Nấu ăn gia đình": {
      services: [
        { name: "Nấu ăn bữa chính", price: "120k/h", desc: "Đi chợ, nấu các món ăn gia đình ba miền chuẩn vị vệ sinh.", icon: "material-symbols:soup-kitchen" },
        { name: "Nấu tiệc gia đình", price: "150k/h", desc: "Chuẩn bị mâm cỗ cúng, tiệc sinh nhật, họp mặt gia đình ấm cúng.", icon: "material-symbols:restaurant" },
      ],
      helpers: [
        {
          name: "Đỗ Thị Thu",
          rating: 4.9,
          exp: "8 năm kinh nghiệm",
          desc: "Nấu ăn ngon, đa dạng thực đơn dinh dưỡng.",
          area: "Quận Gò Vấp",
          avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=80&auto=format&fit=crop",
        },
      ],
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true" || document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const isEn = i18n.language === "en";

  const chatUnreadCount = 0;

  // const fetchChatUnreadCount = useCallback(async () => {
  //   if (!localStorage.getItem("access_token")) {
  //     setChatUnreadCount(0);
  //     return;
  //   }
  //   try {
  //     const { getConversations } = await import("../../api/messages");
  //     const res = await getConversations();
  //     const sum = res.data.reduce((total, c) => total + c.unread_count, 0);
  //     setChatUnreadCount(sum);
  //   } catch {
  //     // silent on errors
  //   }
  // }, []);

  // // Poll chat unread count every 10 seconds
  // useEffect(() => {
  //   const delayTimer = setTimeout(() => {
  //     fetchChatUnreadCount();
  //   }, 0);
  //   const interval = setInterval(fetchChatUnreadCount, 10000);
  //   return () => {
  //     clearTimeout(delayTimer);
  //     clearInterval(interval);
  //   };
  // }, [fetchChatUnreadCount]);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return {
    t,
    i18n,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isScrolled,
    isLoggedIn,
    handleLogout,
    user,
    notifications,
    unreadCount,
    chatUnreadCount,
    markAllAsRead,
    toggleRead,
    removeNotification,
    notifLoading,
    notifPage,
    notifLastPage,
    loadMoreNotifications,
    fetchNotifications,
    isDarkMode,
    toggleDarkMode,
    changeLanguage,
    isEn,
    toggleMobileMenu,
    activeCategory,
    setActiveCategory,
    navLinks,
    categories,
    bottomLinks,
    newsItems,
    categoryDetails,
    geoLoading,
    handleGetCurrentLocation,
  };
};
