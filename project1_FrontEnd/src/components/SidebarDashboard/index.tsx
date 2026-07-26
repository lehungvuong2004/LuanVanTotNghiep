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
        {/* Brand Logo Wrapper - acts as Home link */}
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 active:scale-98 transition-all group">
          <div className={`w-12 h-12 rounded-2xl ${theme.brandBg} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
            <Icon icon="material-symbols:home-rounded" className="text-2xl text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className={`font-black text-2xl ${theme.brandText} leading-tight truncate max-w-44`}>
                Gia Đình Việt
              </h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{theme.subtitle}</p>
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
        <div className="px-4 mb-5">
          <div
            className={`flex ${
              isCollapsed ? "flex-col gap-3 justify-center items-center" : "items-center justify-between gap-4"
            } p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-all duration-150 group`}
          >
            <div className={`flex ${isCollapsed ? "flex-col items-center gap-2" : "items-center gap-4"} min-w-0 flex-1`}>
              <img
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0"
                src={avatar}
                title={isCollapsed ? `${fullName} (${email})` : undefined}
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-205 truncate" title={fullName}>
                    {fullName}
                  </p>
                  <p className="text-base font-semibold text-slate-500 dark:text-slate-400 truncate" title={email}>
                    {email}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center p-2 rounded-xl text-red-650 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all duration-150 active:scale-[0.98] cursor-pointer shrink-0"
              title="Đăng xuất"
            >
              <Icon icon="material-symbols:logout-rounded" className="text-2xl shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
