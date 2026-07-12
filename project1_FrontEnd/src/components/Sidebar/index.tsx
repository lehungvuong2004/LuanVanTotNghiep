import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants";

const NAV_ITEMS_BY_ROLE = {
  [ROLES.ADMIN]: [
    { name: 'Thống kê & Báo cáo', path: '/admin/dashboard', icon: 'icon-park-outline:analysis' }, // 0 
    { name: 'Quản lý Người dùng', path: '/admin/users', icon: 'material-symbols:group-outline-rounded' }, // đã xong còn chỉnh lại khi phân roles
    { name: 'Kiểm duyệt Hồ sơ', path: '/admin/helpers', icon: 'material-symbols:engineering-outline-rounded' }, // 0
    { name: 'Quản lý Dịch vụ', path: '/admin/services', icon: 'grommet-icons:services' }, //3 trùng 
    { name: 'Quản lý Danh mục Phân loại', path: '/admin/categories', icon: 'boxicons:categories' }, // 0
    { name: 'Quản lý Thanh toán', path: '/admin/payments', icon: 'material-symbols:payments-outline-rounded' }, // 3
    { name: 'Quản lý Hoàn tiền', path: '/admin/refunds', icon: 'material-symbols:undo-rounded' }, // 3
    { name: 'Quản lý Báo cáo', path: '/admin/reports', icon: 'material-symbols:report-outline' }, // 3
    { name: 'Quản lý Tin nhắn', path: '/admin/messages', icon: 'material-symbols:chat-outline' }, // 3
    { name: 'Quản lý Thông báo', path: '/admin/notifications', icon: 'material-symbols:notifications-outline-rounded' }, //3 trùng với phân quyên operator 
    { name: 'Quản lý Liên hệ', path: '/admin/contacts', icon: 'material-symbols:contact-phone-outline-rounded' },
    { name: 'Quản lý Tin tức', path: '/admin/news', icon: 'material-symbols:news' }, //1
    { name: 'Quản lý Banner', path: '/admin/banners', icon: 'material-symbols:ad-units-outline-rounded' },   // 1 đã xong
    { name: 'Lịch sử Hoạt động', path: '/admin/activity-logs', icon: 'material-symbols:history-rounded' }, // 0
    { name: 'Vai trò hệ thống', path: '/admin/roles', icon: 'material-symbols:shield-person-outline-rounded' }, // 0
  ],
  [ROLES.OPERATOR]: [
    { name: "Kiểm duyệt Hồ sơ Người giúp việc", path: "/operator/helpers", icon: "material-symbols:engineering-outline" },
    { name: "Quản lý Bài đăng Tuyển dụng", path: "/operator/job-posts", icon: "material-symbols:post-add-rounded" },
    { name: "Quản lý Đặt lịch", path: "/operator/bookings", icon: "material-symbols:calendar-today-outline-rounded" },
    { name: "Quản lý Thanh toán", path: "/operator/payments", icon: "material-symbols:payments-outline-rounded" },
    { name: "Quản lý Hoàn tiền", path: "/operator/refunds", icon: "material-symbols:undo-rounded" },
    { name: "Quản lý Dịch vụ", path: "/operator/services", icon: "grommet-icons:services" },
    { name: "Quản lý Đánh giá", path: "/operator/reviews", icon: "material-symbols:rate-review-outline-rounded" },
    { name: "Quản lý Báo cáo", path: "/operator/reports", icon: "material-symbols:report-outline" },
    { name: "Quản lý Liên hệ", path: "/operator/contacts", icon: "material-symbols:contact-phone-outline-rounded" },
    { name: "Quản lý Tin nhắn", path: "/operator/messages", icon: "material-symbols:chat-outline" },
    { name: "Quản lý Thông báo", path: "/operator/notifications", icon: "material-symbols:notifications-outline-rounded" },
  ],
  [ROLES.HELPER]: [
    { name: "Hồ sơ Cá nhân", path: "/ho-so", icon: "material-symbols:person-outline-rounded" },
    { name: "Khu vực Làm việc", path: "/helper/areas", icon: "material-symbols:map-outline" },
    { name: "Thông báo", path: "/helper/notifications", icon: "material-symbols:notifications-outline-rounded" },
    { name: "Kỹ năng", path: "/helper/skills", icon: "material-symbols:star-outline" },
    { name: "Lịch Rảnh", path: "/helper/availabilities", icon: "material-symbols:calendar-today-outline-rounded" },
    { name: "Hồ sơ Ứng tuyển", path: "/helper/dashboard", icon: "fluent-mdl2:recruitment-management" },
    { name: "Quản lý Đặt lịch", path: "/lich-su-dat-lich", icon: "material-symbols:calendar-month-outline-rounded" },
    { name: "Nhật ký Công việc", path: "/helper/work-logs", icon: "material-symbols:history-edu-outline" },
    { name: "Tin nhắn", path: "/helper/messages", icon: "material-symbols:chat-outline" },
    { name: "Đánh giá", path: "/helper/reviews", icon: "material-symbols:rate-review-outline-rounded" },
    { name: "Thanh toán & Thu nhập", path: "/helper/", icon: "material-symbols:payments-outline-rounded" },
  ],
};

const THEME_BY_ROLE = {
  [ROLES.ADMIN]: {
    brandBg: "bg-cyan-900",
    brandText: "text-cyan-900 dark:text-blue-400",
    subtitle: "Management Portal",
    activeClass: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-l-4 border-blue-600 dark:border-blue-400 rounded-l-none",
    hoverClass: "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0N8i3T-XVxB0b6flIZ774aHkRfqFllMvUfRdy1LQw_83z4ofWxUYNv2aLhJnGD_5fPRnO332KHfQoRiV1rmIFLIZP_Alu_ycjAZ-bp_BJ56lQIHjdEQiRF1GrvUAifRjvxFW2VKYcd2hZZAkQpGLXHq4dY73aIpLd2CN9JgCoOfhdd1I6KA6bA4oScjHl1kD4PpgE4KvYNxHMyxcXAksasxtYSW7FP3gtuPhMPDzj3bsmXEjGZvpPZ-Q8lRdW_Xyfbfebl0e1Gw",
  },
  [ROLES.OPERATOR]: {
    brandBg: "bg-[#026E5F]",
    brandText: "text-[#026E5F] dark:text-emerald-400",
    subtitle: "QTV Operations",
    activeClass: "text-[#026E5F] bg-[#026E5F]/10 dark:text-emerald-400 dark:bg-emerald-950/30 border-l-4 border-[#026E5F] dark:border-emerald-400 rounded-l-none",
    hoverClass: "text-slate-600 dark:text-slate-300 hover:text-[#026E5F] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop",
  },
  [ROLES.HELPER]: {
    brandBg: "bg-[#026E5F]",
    brandText: "text-[#026E5F] dark:text-emerald-455",
    subtitle: "Kênh Người Giúp Việc",
    activeClass: "text-[#026E5F] bg-[#026E5F]/10 dark:text-emerald-455 dark:bg-emerald-950/30 border-l-4 border-[#026E5F] dark:border-emerald-450 rounded-l-none",
    hoverClass: "text-slate-655 dark:text-slate-300 hover:text-[#026E5F] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop",
  },
};

export const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const role = user?.role_id || ROLES.HELPER;
  const navItems = NAV_ITEMS_BY_ROLE[role] || [];
  const theme = THEME_BY_ROLE[role] || THEME_BY_ROLE[ROLES.HELPER];

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
              <h1 className={`font-bold text-base ${theme.brandText} leading-tight truncate max-w-[125px]`}>
                Gia Đình Việt
              </h1>
              <p className="text-xxs text-slate-500 dark:text-slate-400 truncate">
                {theme.subtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 mb-4 min-h-0 custom-sidebar-scroll">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
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
          <div className={`flex items-center ${isCollapsed ? "justify-center p-2" : "gap-3 p-3"} bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-xs`}>
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
