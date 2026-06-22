import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { NavbarStaff } from "../components/NavbarStaff";
import { Icon } from "@iconify/react";

export const DashboardStaff: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!token || !user || user.role_id !== 2) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigate("/dang-nhap");
    }
  }, [navigate]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden">
      <div className="grid grid-cols-12 h-screen relative">
        <div
          className={`${isCollapsed ? "col-span-1" : "col-span-2"} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 relative`}
        >
          <NavbarStaff isCollapsed={isCollapsed} />

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:text-[#026E5F] dark:hover:text-emerald-450 hover:bg-slate-50 dark:hover:bg-slate-750 hover:scale-110 active:scale-95 transition-all text-slate-500"
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
