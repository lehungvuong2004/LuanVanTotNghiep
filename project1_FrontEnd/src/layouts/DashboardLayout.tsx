import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { Sidebar } from "../components/Sidebar";
import { Icon } from "@iconify/react";
import { useAuth } from "../hooks/useAuth";
import { ROLES, getUserRole } from "../constants/roles";
import { useTranslation } from "react-i18next";
import { useToast } from "../contexts/ToastContext";

export const DashboardLayout = ({ allowedRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  }, [token, user, allowedRole, navigate]);

  useEffect(() => {
    const showLoginToast = sessionStorage.getItem("show_login_toast");
    if (showLoginToast === "true") {
      showToast("success", t("Thành công"), t("Đăng nhập thành công!"));
      sessionStorage.removeItem("show_login_toast");
    }
  }, [location, t, showToast]);

  if (!token || !user || getUserRole(user) !== allowedRole) {
    return null;
  }

  const getHoverClass = () => {
    switch (getUserRole(user)) {
      case ROLES.ADMIN:
        return "hover:text-blue-600 dark:hover:text-blue-400";
      case ROLES.OPERATOR:
      case ROLES.HELPER:
        return "hover:text-[#026E5F] dark:hover:text-emerald-450";
      default:
        return "hover:text-[#026E5F]";
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden">
      <div className="grid grid-cols-12 h-screen relative">
        <div
          className={`${isCollapsed ? "col-span-1" : "col-span-2"} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 relative`}
        >
          <Sidebar isCollapsed={isCollapsed} />

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-slate-50 dark:hover:bg-slate-750 hover:scale-110 active:scale-95 transition-all text-slate-500 ${getHoverClass()}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Icon icon={isCollapsed ? "material-symbols:chevron-right-rounded" : "material-symbols:chevron-left-rounded"} className="text-base" />
          </button>
        </div>
        <div className={`${isCollapsed ? "col-span-11" : "col-span-10"} flex flex-col h-screen overflow-y-auto transition-all duration-300`}>
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
