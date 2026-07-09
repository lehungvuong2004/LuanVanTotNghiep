import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useNavbarHelper, type NavbarHelperProps } from "./useHook";

export const NavbarHelper = ({ isCollapsed }: NavbarHelperProps) => {
  const { navItems, handleLogout, fullName, email } = useNavbarHelper();

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-800 flex flex-col justify-between">
      <div>
        {/* Header / Logo */}
        <div className={`px-4 mb-8 mt-4 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#026E5F] flex items-center justify-center shadow-xs shrink-0">
              <Icon icon="icon-park-outline:family" className="text-xl text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-base text-[#026E5F] dark:text-emerald-450 leading-tight truncate max-w-31.25">Gia Đình Việt</h1>
                <p className="text-xxs text-slate-500 dark:text-slate-400 truncate">Kênh Người Giúp Việc</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="px-3 mb-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-lg font-medium text-sm transition-all duration-150 active:scale-[0.98] ${
                      isActive
                        ? "text-[#026E5F] bg-[#026E5F]/10 dark:text-emerald-455 dark:bg-emerald-950/30 border-l-4 border-[#026E5F] dark:border-emerald-450 rounded-l-none"
                        : "text-slate-655 dark:text-slate-300 hover:text-[#026E5F] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
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
      </div>

      <div>
        {/* Profile Widget */}
        <div className="px-3 mb-2">
          <div className={`flex items-center ${isCollapsed ? "justify-center p-2" : "gap-3 p-3"} bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-xs`}>
            <img
              alt="Helper Profile"
              className="w-9 h-9 rounded-full object-cover shadow-xs shrink-0"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop"
              title={isCollapsed ? `${fullName} (${email})` : undefined}
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-205 truncate">{fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-450 truncate">{email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-3 pt-1 mb-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 active:scale-[0.98] cursor-pointer`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <Icon icon="material-symbols:logout-rounded" className="text-xl shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
