import { useMemo } from "react";
import { NavLink } from "react-router-dom";
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

  // Memoized: only recompute when role or permissions change
  const navItems = useMemo(
    () =>
      (NAV_ITEMS[role ?? ROLES.HELPER] ?? []).filter(
        (item) => !item.permission || hasPermission(item.permission),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, user],
  );

  // Resolve theme — fallback to HELPER if role is unknown
  const theme = ROLE_THEME[role ?? ROLES.HELPER] ?? ROLE_THEME[ROLES.HELPER];

  const fullName = user?.full_name || "";
  const email = user?.email || "";
  const avatar = user?.avatar || theme.defaultAvatar;

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-800 flex flex-col justify-between overflow-hidden">
      {/* Header / Logo */}
      <div className={`px-4 mb-4 mt-4 shrink-0 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${theme.brandBg} flex items-center justify-center shadow-xs shrink-0`}>
            <Icon icon="icon-park-outline:family" className="text-xl text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className={`font-bold text-base ${theme.brandText} leading-tight truncate max-w-32`}>
                Gia Đình Việt
              </h1>
              <p className="text-xxs text-slate-500 dark:text-slate-400 truncate">{theme.subtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 mb-4 min-h-0 custom-sidebar-scroll">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-lg font-medium text-sm transition-all duration-150 active:scale-[0.98] ${
                    isActive ? theme.activeClass : theme.hoverClass
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon icon={item.icon} className="text-xl shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Profile and Logout Section */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/50 pt-3 bg-white dark:bg-slate-800">
        <div className="px-3 mb-2">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center p-2" : "gap-3 p-3"} bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-xs`}
          >
            <img
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover shadow-xs shrink-0"
              src={avatar}
              title={isCollapsed ? `${fullName} (${email})` : undefined}
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-3 pt-1 mb-4">
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 active:scale-[0.98] cursor-pointer`}
            title={isCollapsed ? "Đăng xuất" : undefined}
          >
            <Icon icon="material-symbols:logout-rounded" className="text-xl shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
