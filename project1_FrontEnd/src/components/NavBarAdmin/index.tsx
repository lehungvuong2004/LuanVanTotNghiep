import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

// Define navigation items with their respective Iconify icons and paths
const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'material-symbols:grid-view-outline-rounded' },
  { name: 'Users', path: '/admin/users', icon: 'material-symbols:group-outline-rounded' },
  { name: 'Helpers', path: '/admin/helpers', icon: 'material-symbols:engineering-outline-rounded' },
  { name: 'Service Categories', path: '/admin/categories', icon: 'boxicons:categories' },
  { name: 'Services', path: '/admin/services', icon: 'grommet-icons:services' },
  { name: 'Bookings', path: '/admin/bookings', icon: 'material-symbols:calendar-today-outline-rounded' },
  { name: 'Payments', path: '/admin/payments', icon: 'material-symbols:payments-outline-rounded' },
  { name: 'Refunds', path: '/admin/refunds', icon: 'material-symbols:undo-rounded' },
  { name: 'Reviews', path: '/admin/reviews', icon: 'material-symbols:rate-review-outline-rounded' },
  { name: 'Reports', path: '/admin/reports', icon: 'material-symbols:bar-chart-outline-rounded' },
  { name: 'Contacts', path: '/admin/contacts', icon: 'material-symbols:contact-phone-outline-rounded' },
  { name: 'News', path: '/admin/news', icon: 'material-symbols:newspaper-outline-rounded' },
  { name: 'Banners', path: '/admin/banners', icon: 'material-symbols:ad-units-outline-rounded' },
  { name: 'Notifications', path: '/admin/notifications', icon: 'material-symbols:notifications-outline-rounded' },
  { name: 'Activity Logs', path: '/admin/activity-logs', icon: 'material-symbols:history-rounded' },
  { name: 'Settings', path: '/admin/settings', icon: 'material-symbols:settings-outline-rounded' },
];

interface NavBarAdminProps {
  isCollapsed: boolean;
}

export const NavBarAdmin: React.FC<NavBarAdminProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get user info from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const fullName = user?.full_name || 'Admin User';
  const email = user?.email || 'admin@gmail.com';

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-800 flex flex-col">
      {/* Header / Logo */}
      <div className={`px-4 mb-8 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-900 flex items-center justify-center shadow-xs shrink-0">
            <Icon icon="icon-park-outline:family" className="text-xl text-white " />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-base text-cyan-900 dark:text-blue-400 leading-tight truncate max-w-31.25">Gia Đình Việt</h1>
              <p className="text-xxs text-slate-500 dark:text-slate-400 truncate">Management Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 mb-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg font-medium text-sm transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-l-4 border-blue-600 dark:border-blue-400 rounded-l-none'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
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

      {/* Profile Widget */}
      <div className="px-3">
        <div className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-xs`}>
          <img
            alt="Administrator Profile"
            className="w-9 h-9 rounded-full object-cover shadow-xs shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0N8i3T-XVxB0b6flIZ774aHkRfqFllMvUfRdy1LQw_83z4ofWxUYNv2aLhJnGD_5fPRnO332KHfQoRiV1rmIFLIZP_Alu_ycjAZ-bp_BJ56lQIHjdEQiRF1GrvUAifRjvxFW2VKYcd2hZZAkQpGLXHq4dY73aIpLd2CN9JgCoOfhdd1I6KA6bA4oScjHl1kD4PpgE4KvYNxHMyxcXAksasxtYSW7FP3gtuPhMPDzj3bsmXEjGZvpPZ-Q8lRdW_Xyfbfebl0e1Gw"
            title={isCollapsed ? `${fullName} (${email})` : undefined}
          />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-450 truncate">{email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-3 pt-1">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg font-medium text-sm text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 active:scale-[0.98] cursor-pointer`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <Icon icon="material-symbols:logout-rounded" className="text-xl shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};