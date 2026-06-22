import { useNavigate } from 'react-router-dom';

export interface NavItem {
  name: string;
  path: string;
  icon: string;
}
export interface NavBarAdminProps {
  isCollapsed: boolean;
}
export const navItems: NavItem[] = [
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

export const useNavBarAdmin = () => {
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

  return {
    navItems,
    handleLogout,
    fullName,
    email,
    
  };
};
