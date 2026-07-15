import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { ServiceCategory } from "../../../api/services";

import {
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin } from "../../../api/services";

export const useServiceCategoriesAdmin = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | null>(null);

  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategoriesAdmin({
        status: statusFilter === "all" ? undefined : statusFilter });
      setCategories(res.data);
    } catch (err: any) {
      showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      icon: "",
      type: "both" as "booking" | "job" | "both",
      status: "active" as "active" | "inactive" },
    validationSchema: Yup.object().shape({
      name: Yup.string().required("Vui lòng nhập tên danh mục").max(100, "Không quá 100 ký tự"),
      description: Yup.string().max(500, "Không quá 500 ký tự").nullable(),
      icon: Yup.string().max(255).nullable(),
      type: Yup.string().oneOf(["booking", "job", "both"]).required(),
      status: Yup.string().oneOf(["active", "inactive"]).required() }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (modalMode === "edit" && currentCategory) {
          await updateCategoryAdmin(currentCategory.id, {
            name: values.name,
            description: values.description || null,
            icon: values.icon || null,
            type: values.type,
            status: values.status });
          showToast("success", "Thành công", "Cập nhật danh mục thành công!");
        } else {
          await createCategoryAdmin({
            name: values.name,
            description: values.description || null,
            icon: values.icon || null,
            type: values.type,
            status: values.status });
          showToast("success", "Thành công", "Thêm danh mục mới thành công!");
        }
        closeModal();
        fetchCategories();
      } catch (err: any) {
        showToast("error", "Lỗi lưu dữ liệu", err.response?.data?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    } });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentCategory(null);
    formik.resetForm({ values: { name: "", description: "", icon: "", type: "both", status: "active" } });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ServiceCategory) => {
    setModalMode("edit");
    setCurrentCategory(item);
    formik.resetForm({
      values: {
        name: item.name,
        description: item.description || "",
        icon: item.icon || "",
        type: item.type as "booking" | "job" | "both",
        status: item.status } });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, skipConfirm = false) => {
    if (!skipConfirm && !window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này?")) return;
    setLoading(true);
    try {
      await deleteCategoryAdmin(id);
      showToast("success", "Thành công", "Xóa danh mục thành công!");
      fetchCategories();
    } catch (err: any) {
      showToast("error", "Lỗi xóa", err.response?.data?.message || "Không thể xóa danh mục này");
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: ServiceCategory) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await updateCategoryAdmin(item.id, { status: newStatus });
      showToast("success", "Thành công", `Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} danh mục!`);
      fetchCategories();
    } catch (err: any) {
      showToast("error", "Lỗi cập nhật", err.response?.data?.message || "Không thể thay đổi trạng thái");
      setLoading(false);
    }
  };

  return {
    categories: filteredCategories,
    totalItems: categories.length,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    modalMode,
    
    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDelete,
    handleToggleStatus };
};
