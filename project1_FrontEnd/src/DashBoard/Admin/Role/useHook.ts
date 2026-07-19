import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import type { Role, Permission } from "../../../api/rolesApi/roles";
import { getRolesAdmin, createRoleAdmin, updateRoleAdmin, deleteRoleAdmin, getPermissionsAdmin } from "../../../api/rolesApi/roles";
import { roleValidationSchema } from "../../../api/rolesApi/validation";

export const useRolesAdmin = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const { showToast } = useToast();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRolesAdmin();
      setRoles(res);
    } catch (err: any) {
      showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await getPermissionsAdmin();
      setPermissions(res);
    } catch (err: any) {
      console.error("Lỗi tải danh sách quyền:", err);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())));

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRole(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      permissions: [] as number[],
    },
    validationSchema: roleValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (modalMode === "edit" && currentRole) {
          await updateRoleAdmin(currentRole.id, {
            name: values.name,
            description: values.description || undefined,
            permissions: values.permissions,
          });
          showToast("success", "Thành công", "Cập nhật vai trò thành công!");
        } else {
          await createRoleAdmin({
            name: values.name,
            description: values.description || undefined,
            permissions: values.permissions,
          });
          showToast("success", "Thành công", "Thêm vai trò mới thành công!");
        }
        closeModal();
        fetchRoles();
      } catch (err: any) {
        showToast("error", "Lỗi lưu dữ liệu", err.response?.data?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
  });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentRole(null);
    formik.resetForm({ values: { name: "", description: "", permissions: [] } });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Role) => {
    setModalMode("edit");
    setCurrentRole(item);
    const permIds = item.permissions ? item.permissions.map((p) => p.id) : [];
    formik.resetForm({
      values: {
        name: item.name,
        description: item.description || "",
        permissions: permIds,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, skipConfirm = false) => {
    if ([1, 2, 3, 4].includes(id)) {
      showToast("error", "Không cho phép", "Không thể xóa vai trò mặc định của hệ thống");
      return;
    }
    if (!skipConfirm && !window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn vai trò này?")) return;
    setLoading(true);
    try {
      await deleteRoleAdmin(id);
      showToast("success", "Thành công", "Xóa vai trò thành công!");
      fetchRoles();
    } catch (err: any) {
      showToast("error", "Lỗi xóa", err.response?.data?.message || "Không thể xóa vai trò này");
      setLoading(false);
    }
  };

  return {
    roles: filteredRoles,
    totalItems: roles.length,
    permissions,
    loading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    modalMode,

    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDelete,
    currentRole,
  };
};
