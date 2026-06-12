import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export interface NavLink {
  name: string;
  to: string;
}

export interface Category {
  name: string;
}

export interface ServiceDetail {
  name: string;
  price: string;
  desc: string;
  icon: string;
}

export interface FeaturedHelper {
  name: string;
  rating: number;
  exp: string;
  desc: string;
  area: string;
  avatar: string;
}

export interface NewsItem {
  title: string;
  time: string;
}

export const useHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access_token");
  });

  const [user, setUser] = useState<any>(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
    const userStr = localStorage.getItem("user");
    setUser(userStr ? JSON.parse(userStr) : null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Đã duyệt bài đăng tuyển", time: "10 phút trước", read: false },
    { id: 2, title: "Có ứng viên mới ứng tuyển", time: "1 giờ trước", read: false },
    { id: 3, title: "Hồ sơ của bạn đã được cập nhật", time: "2 giờ trước", read: true },
  ]);

  const [activeCategory, setActiveCategory] = useState("Giúp việc theo giờ");

  const navLinks: NavLink[] = [
    { name: "Trang Chủ", to: "/" },
    { name: "Dịch Vụ", to: "/dich-vu" },
    { name: "Liên hệ", to: "/lien-he" },
    { name: "Tuyển dụng", to: "/tuyen-dung" },
  ];

  const categories: Category[] = [
    { name: "Giúp việc theo giờ" },
    { name: "Tổng vệ sinh" },
    { name: "Chăm sóc người già" },
    { name: "Chăm em bé" },
    { name: "Nấu ăn gia đình" },
  ];

  const bottomLinks: NavLink[] = [
    { name: "Tìm người giúp việc", to: "/tim-nguoi-giup-viec" },
    { name: "Tin tức & kinh nghiệm", to: "/tin-tuc" },
  ];

  const newsItems: NewsItem[] = [
    { title: "5 mẹo giữ nhà luôn thơm mát mùa mưa", time: "Cập nhật 2 giờ trước" },
    { title: "Cách chọn người giúp việc phù hợp cho gia đình có trẻ...", time: "Hôm qua" },
    { title: "Bảng giá dịch vụ vệ sinh mới nhất 2024", time: "3 ngày trước" }
  ];

  const categoryDetails: Record<string, {
    services: ServiceDetail[];
    helpers: FeaturedHelper[];
  }> = {
    "Giúp việc theo giờ": {
      services: [
        { name: "Dọn nhà", price: "120k/h", desc: "Dịch vụ dọn dẹp cơ bản, vệ sinh phòng ngủ, phòng khách.", icon: "material-symbols:home-outline" },
        { name: "Vệ sinh căn hộ", price: "120k/h", desc: "Vệ sinh sâu cho căn hộ chung cư, khử mùi và sắp xếp đồ đạc.", icon: "material-symbols:apartment" }
      ],
      helpers: [
        { name: "Nguyễn Thị Lan", rating: 4.8, exp: "5 năm kinh nghiệm", desc: "Luôn tận tâm, sạch sẽ và đúng giờ.", area: "Quận 1, Quận 3", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop" },
        { name: "Trần Văn Tú", rating: 4.9, exp: "3 năm kinh nghiệm", desc: "Chuyên vệ sinh thiết bị điện máy gia đình.", area: "Quận Bình Thạnh", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=80&auto=format&fit=crop" }
      ]
    },
    "Tổng vệ sinh": {
      services: [
        { name: "Tổng vệ sinh nhà cửa", price: "150k/h", desc: "Dọn dẹp toàn diện, hút bụi, lau kính, làm sạch sâu mọi ngóc ngách.", icon: "material-symbols:cleaning-services" },
        { name: "Vệ sinh sau xây dựng", price: "180k/h", desc: "Loại bỏ vết sơn, bụi bẩn công trình, làm sạch toàn bộ sàn và kính.", icon: "material-symbols:construction" }
      ],
      helpers: [
        { name: "Lê Văn Nam", rating: 4.7, exp: "4 năm kinh nghiệm", desc: "Nhiệt tình, trung thực và làm việc khoa học.", area: "Quận 2, Quận 7", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop" }
      ]
    },
    "Chăm sóc người già": {
      services: [
        { name: "Chăm sóc tại bệnh viện", price: "140k/h", desc: "Hỗ trợ ăn uống, vệ sinh, theo dõi sức khỏe của cụ tại viện.", icon: "material-symbols:medical-services" },
        { name: "Chăm sóc tại nhà", price: "130k/h", desc: "Bầu bạn, chuẩn bị bữa ăn dinh dưỡng và hỗ trợ sinh hoạt hàng ngày.", icon: "material-symbols:health-and-safety" }
      ],
      helpers: [
        { name: "Phạm Thị Hoa", rating: 4.9, exp: "6 năm kinh nghiệm", desc: "Kiên nhẫn, am hiểu tâm lý người cao tuổi.", area: "Quận Phú Nhuận", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop" }
      ]
    },
    "Chăm em bé": {
      services: [
        { name: "Trông trẻ theo giờ", price: "130k/h", desc: "Chơi cùng bé, cho bé ăn, đưa đón bé đi học theo yêu cầu.", icon: "material-symbols:child-care" },
        { name: "Chăm bé sơ sinh", price: "160k/h", desc: "Kinh nghiệm tắm bé, massage và hỗ trợ mẹ bỉm chăm sóc bé.", icon: "material-symbols:baby-changing-station" }
      ],
      helpers: [
        { name: "Hoàng Thanh Mai", rating: 4.8, exp: "3 năm kinh nghiệm", desc: "Yêu trẻ, cẩn thận, có kỹ năng sư phạm mầm non.", area: "Quận Tân Bình", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80&auto=format&fit=crop" }
      ]
    },
    "Nấu ăn gia đình": {
      services: [
        { name: "Nấu ăn bữa chính", price: "120k/h", desc: "Đi chợ, nấu các món ăn gia đình ba miền chuẩn vị vệ sinh.", icon: "material-symbols:soup-kitchen" },
        { name: "Nấu tiệc gia đình", price: "150k/h", desc: "Chuẩn bị mâm cỗ cúng, tiệc sinh nhật, họp mặt gia đình ấm cúng.", icon: "material-symbols:restaurant" }
      ],
      helpers: [
        { name: "Đỗ Thị Thu", rating: 4.9, exp: "8 năm kinh nghiệm", desc: "Nấu ăn ngon, đa dạng thực đơn dinh dưỡng.", area: "Quận Gò Vấp", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=80&auto=format&fit=crop" }
      ]
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
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
    markAllAsRead,
    toggleRead,
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
  };
};