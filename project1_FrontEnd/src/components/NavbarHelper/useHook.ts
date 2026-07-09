import { useNavigate } from "react-router-dom";

export interface NavbarHelperProps {
  isCollapsed: boolean;
}

export const navItems = [
  {name: "Bảng điều khiển", path: "/helper/", icon: ""},
  { name: "Tuyển Dụng & Việc Làm", path: "/helper/dashboard", icon: "material-symbols:search-find-outline-rounded" },
  { name: "Lịch Làm Việc", path: "/lich-su-dat-lich", icon: "material-symbols:calendar-today-outline-rounded" },
  
  { name: "Hồ Sơ Cá Nhân", path: "/ho-so", icon: "material-symbols:person-outline-rounded" },
  { name: "Trang Chủ", path: "/", icon: "material-symbols:home-outline" },
];

export const useNavbarHelper = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Get user info from localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const fullName = user?.full_name || "Người Giúp Việc";
  const email = user?.email || "helper@gmail.com";

  return {
    navItems,
    handleLogout,
    fullName,
    email,
  };
};
