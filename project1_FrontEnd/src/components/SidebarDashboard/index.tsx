import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";
import { ROLES, getUserRole } from "../../constants/roles";
import { NAV_ITEMS } from "../../constants/navigation";
import { ROLE_THEME } from "../../constants/sidebarTheme";

export const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { user, hasPermission } = useAuth();
  const { logout } = useLogout();
  const { t } = useTranslation();

  const role = getUserRole(user);

  const navItems = useMemo(
    () => (NAV_ITEMS[role ?? ROLES.HELPER] ?? []).filter((item) => !item.permission || hasPermission(item.permission)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, user],
  );

  const theme = ROLE_THEME[role ?? ROLES.HELPER] ?? ROLE_THEME[ROLES.HELPER];

  const fullName = user?.full_name || "";
  const email = user?.email || "";
  const avatar = user?.avatar || theme.defaultAvatar;

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-800 flex flex-col justify-between overflow-hidden">
      <div className={`px-5 mb-5 mt-5 shrink-0 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {/* Brand Logo Wrapper */}
        <Link to="/" className={`flex items-center gap-4 cursor-pointer group/brand ${isCollapsed ? "justify-center" : ""}`}>
          <div className={`w-10 h-10 rounded-xl ${theme.brandBg} flex items-center justify-center shadow-sm shrink-0 group-hover/brand:scale-105 transition-transform duration-200`}>
            <Icon icon="material-symbols:home-rounded" className="text-xl text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className={`font-black text-2xl ${theme.brandText} leading-tight truncate max-w-44 group-hover/brand:opacity-90 transition-opacity`}>Gia Đình Việt</h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{t(theme.subtitle)}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 mb-5 min-h-0 custom-sidebar-scroll">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? "justify-center px-3" : "gap-3 px-4"} py-3 rounded-xl font-semibold text-base transition-all duration-150 active:scale-[0.98] ${
                    isActive ? theme.activeClass : theme.hoverClass
                  }`
                }
                title={isCollapsed ? t(item.name) : undefined}
              >
                <Icon icon={item.icon} className="text-2xl shrink-0" />
                {!isCollapsed && <span>{t(item.name)}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Profile and Logout Section */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/50 pt-4 pb-4 bg-white dark:bg-slate-800">
        <div className="px-4">
          <div
            className={`flex items-center justify-between ${isCollapsed ? "justify-center p-2.5" : "gap-3 p-3"} bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0" src={avatar} title={isCollapsed ? `${fullName} (${email})` : undefined} />
              {!isCollapsed && (
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{fullName}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-35">{email}</span>
                </div>
              )}
            </div>

            {/* Logout icon inside the card */}
            <button
              onClick={logout}
              className={`p-2 rounded-xl text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 shrink-0 cursor-pointer active:scale-95 ${
                isCollapsed ? "hidden" : "block"
              }`}
              title={t("Đăng xuất")}
            >
              <Icon icon="material-symbols:logout-rounded" className="text-xl" />
            </button>
          </div>
        </div>

        {/* Collapsed Logout button below the avatar */}
        {isCollapsed && (
          <div className="px-4 mt-2">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 cursor-pointer active:scale-95"
              title={t("Đăng xuất")}
            >
              <Icon icon="material-symbols:logout-rounded" className="text-xl" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
