import { Icon } from "@iconify/react";

import { usePermissionsMatrix } from "./useHook";
import type { Permission } from "../../../api/roles";
import { ROLES } from "../../../constants/roles";

// Friendly names and icons for each system module
const MODULE_META = {
  dashboard: { name: "Dashboard", icon: "material-symbols:dashboard-customize-outline-rounded" },
  users: { name: "Users", icon: "material-symbols:person-outline-rounded" },
  roles: { name: "Roles", icon: "material-symbols:shield-person-outline-rounded" },
  permissions: { name: "Permissions", icon: "material-symbols:key-outline-rounded" },
  customer_profile: { name: "Customer Profile", icon: "material-symbols:contact-page-outline-rounded" },
  customer_addresses: { name: "Customer Addresses", icon: "material-symbols:my-location-outline-rounded" },
  helper_profile: { name: "Helpers", icon: "material-symbols:engineering-outline-rounded" },
  working_areas: { name: "Working Areas", icon: "material-symbols:map-outline-rounded" },
  skills: { name: "Skills", icon: "material-symbols:school-outline-rounded" },
  availabilities: { name: "Availabilities", icon: "material-symbols:calendar-today-outline-rounded" },
  bookings: { name: "Bookings", icon: "material-symbols:event-note-outline-rounded" },
  work_logs: { name: "Work Logs", icon: "material-symbols:sticky-note-2-outline-rounded" },
  job_posts: { name: "Job Posts", icon: "material-symbols:post-add-rounded" },
  job_applications: { name: "Job Applications", icon: "material-symbols:description-outline-rounded" },
  favorites: { name: "Favorites", icon: "lets-icons:favorites" },
  reviews: { name: "Reviews", icon: "material-symbols:rate-review-outline-rounded" },
  reports: { name: "Reports", icon: "material-symbols:report-outline-rounded" },
  contacts: { name: "Contacts", icon: "material-symbols:mail-outline-rounded" },
  payments: { name: "Payments", icon: "material-symbols:payments-outline-rounded" },
  refunds: { name: "Refunds", icon: "material-symbols:replay-circle-filled-rounded" },
  messages: { name: "Messages", icon: "material-symbols:forum-outline-rounded" },
  notifications: { name: "Notifications", icon: "material-symbols:notifications-outline-rounded" },
  news: { name: "News", icon: "material-symbols:newspaper-rounded" },
  banners: { name: "Banners", icon: "material-symbols:ad-units-outline-rounded" },
  categories: { name: "Categories", icon: "material-symbols:category-outline-rounded" },
  services: { name: "Services", icon: "material-symbols:construction-rounded" },
  system: { name: "System Logs", icon: "material-symbols:settings-outline-rounded" },
};

// 8 Columns of granular permissions in the Matrix
const ACTION_COLUMNS = [
  { key: "CREATE", label: "CREATE", patterns: ["create", "store", "add", "checkin"] },
  { key: "READ", label: "READ", patterns: ["view", "read", "index", "show", "details"] },
  { key: "UPDATE", label: "UPDATE", patterns: ["update", "edit", "patch", "update_status", "checkout"] },
  { key: "DELETE", label: "DELETE", patterns: ["delete", "destroy", "cancel"] },
  { key: "APPROVE", label: "APPROVE", patterns: ["approve", "verify", "unlock"] },
  { key: "REJECT", label: "REJECT", patterns: ["reject", "lock", "hide"] },
  { key: "EXPORT", label: "EXPORT", patterns: ["export", "history", "statistics"] },
  { key: "ASSIGN", label: "ASSIGN", patterns: ["assign", "process", "send", "broadcast", "pay"] },
];

export const PermissionsMatrix = () => {
  const {
    roles,
    allPermissions,
    modules,
    loading,
    saving,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    tempPermissions,
    searchQuery,
    setSearchQuery,
    selectedModule,
    setSelectedModule,

    handleTogglePermission,
    handleSelectAll,
    handleResetDefaults,
    handleSaveChanges,
    hasUnsavedChanges,
  } = usePermissionsMatrix();

  // Helper to map unique modules present in system
  const uniqueModules = Array.from(new Set(allPermissions.map((p) => p.module))).sort();

  const filteredModulesList = uniqueModules.filter((mod) => {
    if (selectedModule !== "all" && mod !== selectedModule) return false;
    if (!searchQuery) return true;
    const meta = MODULE_META[mod] || { name: mod };
    const matchesModuleName = meta.name.toLowerCase().includes(searchQuery.toLowerCase()) || mod.toLowerCase().includes(searchQuery.toLowerCase());

    const hasMatchingPermissions = allPermissions.some(
      (p) => p.module === mod && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))),
    );

    return matchesModuleName || hasMatchingPermissions;
  });

  const findPermission = (moduleName: string, colKey: string) => {
    const col = ACTION_COLUMNS.find((c) => c.key === colKey);
    if (!col) return undefined;

    return allPermissions.find((p) => {
      if (p.module !== moduleName) return false;
      const parts = p.name.split(".");
      const suffix = parts[parts.length - 1];
      return col.patterns.includes(suffix);
    });
  };

  const activeUserCount = selectedRoleId === ROLES.ADMIN ? 1 : selectedRoleId === ROLES.OPERATOR ? 12 : selectedRoleId === ROLES.HELPER ? 86 : 142;
  const userGrowthText = selectedRoleId === ROLES.ADMIN ? "+0%" : selectedRoleId === ROLES.OPERATOR ? "+8%" : selectedRoleId === ROLES.HELPER ? "+15%" : "+12%";

  // Calculate covered modules
  const checkedPermissionObjects = allPermissions.filter((p) => tempPermissions.includes(p.id));
  const coveredModulesCount = Array.from(new Set(checkedPermissionObjects.map((p) => p.module))).length;
  const coverageLabel = coveredModulesCount === uniqueModules.length ? "Global Access" : "Partial Access";

  const totalSystemPermissions = allPermissions.length;
  const checkedPermissionsCount = selectedRoleId === ROLES.ADMIN ? totalSystemPermissions : tempPermissions.length;
  const progressPercent = totalSystemPermissions > 0 ? Math.round((checkedPermissionsCount / totalSystemPermissions) * 100) : 0;

  let securityRating = "Standard Restricted";
  if (selectedRoleId === ROLES.ADMIN || progressPercent > 90) securityRating = "Unrestricted";
  else if (progressPercent > 60) securityRating = "Elevated Access";
  else if (progressPercent < 20) securityRating = "Highly Restricted";

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
            <span>Admin</span>
            <Icon icon="material-symbols:chevron-right-rounded" className="text-sm text-slate-300" />
            <span>Roles & Permissions</span>
            <Icon icon="material-symbols:chevron-right-rounded" className="text-sm text-slate-300" />
            <span className="text-slate-600 dark:text-slate-300 font-bold">{selectedRole?.name || "Staff"} Matrix</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Permission Matrix: <span className="text-cyan-600 dark:text-cyan-400">{selectedRole?.name || "Staff"} Role</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure granular access levels for the '{selectedRole?.name || "Staff"}' user group across all platform modules.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetDefaults}
            disabled={selectedRoleId === ROLES.ADMIN || loading}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-750 font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset to default seeded permissions"
          >
            <Icon icon="material-symbols:undo-rounded" className="text-lg" />
            Reset Defaults
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={selectedRoleId === ROLES.ADMIN || saving || !hasUnsavedChanges}
            className={`flex items-center justify-center gap-2 font-bold px-5 py-2.5 rounded-xl text-white shadow-xs active:scale-95 transition-all cursor-pointer  duration-200 ${
              hasUnsavedChanges ? "bg-cyan-600 hover:bg-cyan-700 shadow-md ring-2 ring-cyan-500/20" : "bg-slate-400 dark:bg-slate-800 text-slate-100 dark:text-slate-500 cursor-not-allowed opacity-60"
            }`}
          >
            {saving ? <Icon icon="eos-icons:loading" className="text-lg animate-spin" /> : <Icon icon="material-symbols:save-rounded" className="text-lg" />}
            Save Changes
          </button>
        </div>
      </div>
  );

  const renderRoleTabs = () => (
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-150 dark:border-slate-750 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3">Vai Trò:</span>
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRoleId(r.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedRoleId === r.id ? "bg-cyan-600 text-white shadow-xs" : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-400"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>
  );

  const renderStatsCards = () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-150 dark:border-slate-750 shadow-xs flex flex-col justify-between h-28">
          <span className="text-xxs font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">ACTIVE USERS</span>
          <div className="flex items-baseline justify-between mt-auto">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{activeUserCount}</span>
            <span className="px-2 py-0.5 rounded-full text-xxs font-extrabold bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/20">
              {userGrowthText}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-150 dark:border-slate-750 shadow-xs flex flex-col justify-between h-28">
          <span className="text-xxs font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">MODULES COVERED</span>
          <div className="flex items-baseline justify-between mt-auto">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{coveredModulesCount}</span>
            <span className="text-xs font-bold text-slate-450 dark:text-slate-500">{coverageLabel}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-150 dark:border-slate-750 shadow-xs flex flex-col justify-between h-28 relative overflow-hidden">
          <span className="text-xxs font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">SECURITY PROFILE</span>
          <div className="mt-2 space-y-1.5 z-10 relative">
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div className="bg-cyan-600 h-full rounded-full transition-all duration-350" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500 italic text-xxs">Automated policy active</span>
              <span className="font-extrabold text-cyan-650 dark:text-cyan-400">{securityRating}</span>
            </div>
          </div>
          <Icon icon="material-symbols:shield-outline-rounded" className="absolute -right-3 -bottom-4 text-slate-100/50 dark:text-slate-800/20 text-7xl select-none pointer-events-none" />
        </div>
      </div>
  );

  const renderMatrix = () => (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-750 shadow-xs overflow-hidden flex flex-col flex-1">
        <div className="p-5 border-b border-slate-150 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20 dark:bg-slate-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-650 dark:text-slate-350 text-xl shrink-0">
              <Icon icon="material-symbols:tune-rounded" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Access Control Matrix</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Toggle permissions for each system module below.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
              <span>Show:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-705 dark:text-slate-300 font-bold focus:outline-hidden focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Modules</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {MODULE_META[m]?.name || m.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {selectedRoleId !== ROLES.ADMIN && (
              <button
                onClick={() => {
                  const allCurrentIds = filteredModulesList
                    .flatMap((mod) => ACTION_COLUMNS.map((col) => findPermission(mod, col.key)))
                    .filter((p): p is Permission => !!p)
                    .map((p) => p.id);
                  const allChecked = allCurrentIds.every((id) => tempPermissions.includes(id));
                  handleSelectAll(!allChecked);
                }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 text-xs cursor-pointer select-none"
              >
                <Icon icon="material-symbols:check-box-rounded" className="text-sm text-cyan-600" />
                Select All
              </button>
            )}
          </div>
        </div>

        {/* Search input bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/10 dark:bg-slate-900/5">
          <div className="relative w-full max-w-md">
            <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search permissions or modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <div className="w-full text-sm min-w-4xl flex flex-col">
            <div className="grid grid-cols-11 min-w-252 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700/50 text-xxs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">
              <div className="col-span-3 px-6 py-4 sticky left-0 z-20 bg-slate-50/90 dark:bg-slate-900/90 shadow-sm border-r border-slate-100 dark:border-slate-750 flex items-center">
                MODULE NAME
              </div>
              {ACTION_COLUMNS.map((col) => (
                <div key={col.key} className="col-span-1 px-4 py-4 flex items-center justify-center text-center">
                  {col.label}
                </div>
              ))}
            </div>
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/30">
              {loading && uniqueModules.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center w-full">
                  <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4 text-xs font-semibold text-slate-400">Loading modules configurations...</p>
                </div>
              ) : filteredModulesList.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center w-full">
                  <Icon icon="material-symbols:grid-off-outline-rounded" className="text-5xl text-slate-305 mb-3" />
                  <p className="text-sm font-bold text-slate-805 dark:text-slate-300">No modules match search filter</p>
                </div>
              ) : (
                filteredModulesList.map((mod) => {
                  const meta = MODULE_META[mod] || { name: mod, icon: "material-symbols:settings-outline-rounded" };

                  return (
                    <div key={mod} className="group grid grid-cols-11 min-w-252 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="col-span-3 px-6 py-3.5 sticky left-0 z-15 bg-white group-hover:bg-slate-50 dark:bg-slate-850 dark:group-hover:bg-slate-800/50 shadow-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-750 flex items-center gap-3 transition-colors">
                        <Icon icon={meta.icon} className="text-lg text-slate-450 dark:text-slate-400 shrink-0" />
                        <span className="truncate">{meta.name}</span>
                      </div>

                      {ACTION_COLUMNS.map((col) => {
                        const perm = findPermission(mod, col.key);
                        const isRoleAdmin = selectedRoleId === ROLES.ADMIN;

                        if (!perm) {
                          return (
                            <div key={col.key} className="col-span-1 px-4 py-3.5 flex items-center justify-center">
                              <div className="w-5 h-5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed"
                                title="Not applicable for this module"
                              />
                            </div>
                          );
                        }

                        const isChecked = isRoleAdmin || tempPermissions.includes(perm.id);

                        return (
                          <div key={col.key} className="col-span-1 px-4 py-3.5 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isRoleAdmin}
                              onChange={() => handleTogglePermission(perm.id)}
                              title={isRoleAdmin ? "Admin always possesses all rights" : `${isChecked ? "Revoke" : "Grant"} ${perm.name}`}
                              className={`w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-cyan-600 accent-cyan-600 transition-all ${
                                isRoleAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-cyan-500 dark:hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/20"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
  );

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200 flex flex-col bg-slate-50/50 dark:bg-slate-900/10">
      {renderHeader()}
      {renderRoleTabs()}
      {renderStatsCards()}
      {renderMatrix()}
    </div>
  );
};

export default PermissionsMatrix;
