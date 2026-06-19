import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBarAdmin } from '../components/NavBarAdmin';
import { Icon } from '@iconify/react';

export const DashboardManager: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <div className="grid grid-cols-12 min-h-screen relative">
        {/* Left column - Sidebar */}
        <div className={`${isCollapsed ? 'col-span-1' : 'col-span-2'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 relative`}>
          <NavBarAdmin isCollapsed={isCollapsed} />
          
          {/* Floating toggle button docked to the border */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-750 hover:scale-110 active:scale-95 transition-all text-slate-500"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Icon
              icon={isCollapsed ? "material-symbols:chevron-right-rounded" : "material-symbols:chevron-left-rounded"}
              className="text-base"
            />
          </button>
        </div>
        {/* Right column - Content */}
        <div className={`${isCollapsed ? 'col-span-11' : 'col-span-10'} flex flex-col min-h-screen overflow-y-auto transition-all duration-300`}>
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
