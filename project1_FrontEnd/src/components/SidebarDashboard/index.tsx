import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";
import { ROLES, getUserRole } from "../../constants/roles";
import { NAV_ITEMS } from "../../constants/navigation";
import { ROLE_THEME } from "../../constants/sidebarTheme";

export const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { user, hasPermission } = useAuth();
  const { logout } = useLogout();

  const role = getUserRole(user);

  const navItems = useMemo(
    () =>
      (NAV_ITEMS[role ?? ROLES.HELPER] ?? []).filter(
        (item) => !item.permission || hasPermission(item.permission),
      ),
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
        {/* Trở về trang chủ */}
        <div className="w-full mb-5">
          <Link
            to="/"
            className={`flex items-center ${
              isCollapsed ? "justify-center p-3" : "gap-4 px-5 py-3.5"
            } bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-all duration-150 cursor-pointer group`}
            title="Trở về trang chủ"
          >
            <Icon
              icon="material-symbols:home-outline"
              className="text-2xl text-slate-600 dark:text-slate-350 group-hover:scale-110 transition-transform shrink-0"
            />
            {!isCollapsed && (
              <span className="text-xl font-bold text-slate-700 dark:text-slate-200 truncate">
                Trở về trang chủ
              </span>
            )}
          </Link>
        </div>

        {/* Brand Logo Wrapper */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${theme.brandBg} flex items-center justify-center shadow-sm shrink-0`}>
            <Icon icon="icon-park-outline:family" className="text-2xl text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className={`font-black text-2xl ${theme.brandText} leading-tight truncate max-w-44`}>
                Gia Đình Việt
              </h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{theme.subtitle}</p>
            </div>
          )}
        </div>
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
                title={isCollapsed ? item.name : undefined}
              >
                <Icon icon={item.icon} className="text-2xl shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Profile and Logout Section */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/50 pt-5 bg-white dark:bg-slate-800">
        <div className="px-4 mb-3">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center p-3" : "gap-4 p-4"} bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm`}
          >
            <img
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0"
              src={avatar}
              title={isCollapsed ? `${fullName} (${email})` : undefined}
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200 truncate">{fullName}</p>
                <p className="text-base font-semibold text-slate-500 dark:text-slate-400 truncate">{email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 pt-1 mb-5">
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "gap-4 px-5"} py-4 rounded-xl font-black text-xl text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 active:scale-[0.98] cursor-pointer`}
            title={isCollapsed ? "Đăng xuất" : undefined}
          >
            <Icon icon="material-symbols:logout-rounded" className="text-2xl shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
