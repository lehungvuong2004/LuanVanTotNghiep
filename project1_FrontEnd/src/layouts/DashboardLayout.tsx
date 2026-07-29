import { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { Sidebar } from "../components/SidebarDashboard";
import { Icon } from "@iconify/react";
import { useAuth } from "../hooks/useAuth";
import { ROLES, getUserRole } from "../constants/roles";
import { ROLE_THEME } from "../constants/sidebarTheme";
import { useTranslation } from "react-i18next";
import { useToast } from "../contexts/ToastContext";

export const DashboardLayout = ({ allowedRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const { logout } = useLogout();

  useEffect(() => {
    if (!token || !user || getUserRole(user) !== allowedRole) {
      logout();
      navigate("/dang-nhap");
    }
  }, [token, user, allowedRole, navigate, logout]);

  useEffect(() => {
    const showLoginToast = sessionStorage.getItem("show_login_toast");
    if (showLoginToast === "true") {
      showToast("success", t("Thành công"), t("Đăng nhập thành công!"));
      sessionStorage.removeItem("show_login_toast");
    }
  }, [location, t, showToast]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  const role = getUserRole(user);
  const theme = ROLE_THEME[role ?? ROLES.HELPER] ?? ROLE_THEME[ROLES.HELPER];
  const avatar = user?.avatar || theme.defaultAvatar;

  const getHoverClass = () => {
    switch (role) {
      case ROLES.ADMIN:
        return "hover:text-blue-600 dark:hover:text-blue-400";
      case ROLES.OPERATOR:
      case ROLES.HELPER:
        return "hover:text-[#026E5F] dark:hover:text-emerald-450";
      default:
        return "hover:text-[#026E5F]";
    }
  };

  const bottomNavItems = useMemo(() => {
    let items = [];
    if (role === ROLES.ADMIN) {
      items = [
        { label: "Home", path: "/admin/dashboard", icon: "material-symbols:home-outline" },
        { label: "Bookings", path: "/admin/bookings", icon: "material-symbols:calendar-month-outline-rounded" },
        { label: "Users", path: "/admin/users", icon: "material-symbols:group-outline-rounded" },
      ];
    } else if (role === ROLES.OPERATOR) {
      items = [
        { label: "Home", path: "/operator/dashboard", icon: "material-symbols:home-outline" },
        { label: "Bookings", path: "/operator/bookings", icon: "material-symbols:calendar-today-outline-rounded" },
        { label: "Helpers", path: "/operator/helpers", icon: "material-symbols:engineering-outline" },
      ];
    } else if (role === ROLES.HELPER) {
      items = [
        { label: "Home", path: "/helper/dashboard", icon: "material-symbols:home-outline" },
        { label: "Bookings", path: "/lich-su-dat-lich", icon: "material-symbols:calendar-month-outline-rounded" },
        { label: "Profile", path: "/ho-so", icon: "material-symbols:person-outline-rounded" },
      ];
    } else {
      items = [{ label: "Home", path: "/", icon: "material-symbols:home-outline" }];
    }

    return [...items, { label: "More", icon: "ri:more-fill", action: () => setIsMobileDrawerOpen(true) }];
  }, [role]);

  if (!token || !user || getUserRole(user) !== allowedRole) {
    return null;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden">
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 shrink-0 z-30">
        <button onClick={() => setIsMobileDrawerOpen(true)} className="p-1.5 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors">
          <Icon icon="material-symbols:menu-rounded" className="text-2xl" />
        </button>
        <span className="font-extrabold text-teal-800 dark:text-emerald-400 tracking-tight text-lg">Gia Đình Việt</span>
        <img alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-slate-700 shrink-0" src={avatar} />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`hidden md:block bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 relative shrink-0 ${
            isCollapsed ? "w-20" : "w-80"
          }`}
        >
          <Sidebar isCollapsed={isCollapsed} />

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-slate-50 dark:hover:bg-slate-750 hover:scale-110 active:scale-[0.95] transition-all text-slate-500 ${getHoverClass()}`}
            title={isCollapsed ? t("Mở rộng Sidebar") : t("Thu gọn Sidebar")}
          >
            <Icon icon={isCollapsed ? "material-symbols:chevron-right-rounded" : "material-symbols:chevron-left-rounded"} className="text-base" />
          </button>
        </div>

        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileDrawerOpen(false)} />
            <div className="relative flex flex-col w-80 max-w-xs h-full bg-white dark:bg-slate-800 shadow-2xl z-50 animate-fade-in-left">
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="absolute top-4 right-4 z-50 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="text-xl" />
              </button>

              <Sidebar isCollapsed={false} />
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-around px-2 z-45 shadow-lg">
        {bottomNavItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path || (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path)) : false;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 dark:text-slate-400 cursor-pointer group"
            >
              <div
                className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                  isActive ? "bg-[#066d72]/10 text-[#066d72] dark:bg-emerald-500/10 dark:text-emerald-400" : "group-hover:bg-slate-100 dark:group-hover:bg-slate-700/50"
                }`}
              >
                <Icon icon={item.icon} className="text-xl" />
              </div>
              <span className={`text-sm font-bold mt-0.5 tracking-tight ${isActive ? "text-[#066d72] dark:text-emerald-400" : ""}`}>{t(item.label)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
