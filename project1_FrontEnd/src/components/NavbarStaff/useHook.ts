import { useNavigate } from "react-router-dom";


export interface NavbarStaffProps {
  isCollapsed: boolean;
}

export const navItems= [
  { name: "Dashboard", path: "/operator/dashboard", icon: "material-symbols:grid-view-outline-rounded" },
  { name: "Bookings", path: "/operator/bookings", icon: "material-symbols:calendar-today-outline-rounded" },
  { name: "Reviews", path: "/operator/reviews", icon: "material-symbols:rate-review-outline-rounded" },
  { name: "Reports", path: "/operator/reports", icon: "material-symbols:bar-chart-outline-rounded" },
  { name: "Support", path: "/operator/contacts", icon: "material-symbols:contact-phone-outline-rounded" },
  { name: "Activity Logs", path: "/operator/logs", icon: "material-symbols:history-rounded" },
];

export const useNavbarStaff = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Get user info from localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const fullName = user?.full_name || "QTV Operator";
  const email = user?.email || "operator@gmail.com";

  return {
    navItems,
    handleLogout,
    fullName,
    email,
  };
};
