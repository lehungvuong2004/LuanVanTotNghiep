import { useState, useEffect, useCallback } from "react";
import type { Role, Permission } from "../../../api/roles";
import { getRolesAdmin, getPermissionsAdmin, updateRoleAdmin } from "../../../api/roles";
import { ROLES } from "../../../constants/roles";
import { useToast } from "../../../contexts/ToastContext";

export const usePermissionsMatrix = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState<number>(2);

  // Temporary permissions state in-memory before clicking "Save Changes"
  const [tempPermissions, setTempPermissions] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([getRolesAdmin(), getPermissionsAdmin()]);
      setRoles(rolesRes);
      setPermissions(permissionsRes);

      // Set default selected role permissions
      const activeRole = rolesRes.find((r) => r.id === selectedRoleId);
      if (activeRole) {
        setTempPermissions(activeRole.permissions ? activeRole.permissions.map((p) => p.id) : []);
      }
    } catch (err: any) {
      showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải cấu hình vai trò & quyền hạn");
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Synchronize tempPermissions when selectedRoleId changes or roles are updated
  useEffect(() => {
    const activeRole = roles.find((r) => r.id === selectedRoleId);
    if (activeRole) {
      setTempPermissions(activeRole.permissions ? activeRole.permissions.map((p) => p.id) : []);
    }
  }, [selectedRoleId, roles]);

  // Compute unique modules for filter dropdown
  const modules = Array.from(new Set(permissions.map((p) => p.module))).sort();

  // Filter permissions based on search query and module filter
  const filteredPermissions = permissions.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesModule = selectedModule === "all" || p.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  // Toggle a single permission in temp state
  const handleTogglePermission = (permissionId: number) => {
    if (selectedRoleId === ROLES.ADMIN) {
      showToast("warning", "Không thể chỉnh sửa", "Vai trò Admin mặc định có toàn bộ quyền trong hệ thống.");
      return;
    }

    setTempPermissions((prev) => (prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]));
  };

  // Toggle all permissions for a module in temp state
  const handleToggleModule = (moduleName: string, checkAll: boolean) => {
    if (selectedRoleId === ROLES.ADMIN) {
      showToast("warning", "Không thể chỉnh sửa", "Vai trò Admin mặc định có toàn bộ quyền trong hệ thống.");
      return;
    }

    const modulePermIds = permissions.filter((p) => p.module === moduleName).map((p) => p.id);

    setTempPermissions((prev) => {
      if (checkAll) {
        return Array.from(new Set([...prev, ...modulePermIds]));
      } else {
        return prev.filter((id) => !modulePermIds.includes(id));
      }
    });
  };

  // Select all matching permissions
  const handleSelectAll = (checkAll: boolean) => {
    if (selectedRoleId === ROLES.ADMIN) {
      showToast("warning", "Không thể chỉnh sửa", "Vai trò Admin mặc định có toàn bộ quyền trong hệ thống.");
      return;
    }

    const currentPermIds = filteredPermissions.map((p) => p.id);
    setTempPermissions((prev) => {
      if (checkAll) {
        return Array.from(new Set([...prev, ...currentPermIds]));
      } else {
        return prev.filter((id) => !currentPermIds.includes(id));
      }
    });
  };

  // Reset temp permissions to current database permissions (undo unsaved changes)
  const handleResetDefaults = () => {
    if (selectedRoleId === ROLES.ADMIN) {
      showToast("warning", "Không thể chỉnh sửa", "Vai trò Admin mặc định có toàn bộ quyền trong hệ thống.");
      return;
    }

    const originalIds = selectedRole?.permissions ? selectedRole.permissions.map((p) => p.id) : [];
    setTempPermissions(originalIds);
    showToast("success", "Hoàn tác thay đổi", `Đã khôi phục về cấu hình phân quyền hiện tại trong cơ sở dữ liệu cho vai trò ${selectedRole?.name}`);
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (selectedRoleId === ROLES.ADMIN) {
      showToast("warning", "Không thể chỉnh sửa", "Vai trò Admin mặc định có toàn bộ quyền trong hệ thống.");
      return;
    }

    setSaving(true);
    try {
      const updatedRole = await updateRoleAdmin(selectedRoleId, {
        permissions: tempPermissions,
      });

      // Update roles local state
      setRoles((prev) => prev.map((r) => (r.id === selectedRoleId ? { ...r, permissions: updatedRole.permissions } : r)));

      showToast("success", "Lưu thay đổi thành công", `Đã cập nhật cấu hình phân quyền cho vai trò ${selectedRole?.name}`);
    } catch (err: any) {
      showToast("error", "Lỗi cập nhật", err.response?.data?.message || "Không thể lưu thay đổi quyền hạn");
    } finally {
      setSaving(false);
    }
  };

  // Detect if there are unsaved changes
  const originalPermIds = selectedRole?.permissions ? selectedRole.permissions.map((p) => p.id) : [];
  const hasUnsavedChanges = tempPermissions.length !== originalPermIds.length || !tempPermissions.every((id) => originalPermIds.includes(id));

  return {
    roles,
    permissions: filteredPermissions,
    allPermissions: permissions,
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
    handleToggleModule,
    handleSelectAll,
    handleResetDefaults,
    handleSaveChanges,
    hasUnsavedChanges,
    refresh: fetchData,
  };
};
