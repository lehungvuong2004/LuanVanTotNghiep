import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import type { Service, ServiceCategory } from "../../../api/servicesApi/services";
import { getServicesAdmin, createServiceAdmin, updateServiceAdmin, deleteServiceAdmin, getCategoriesAdmin, getPopularServicesAdmin } from "../../../api/servicesApi/services";
import { getServiceValidationSchema } from "../../../api/servicesApi/validation";

export const useServicesAdmin = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 12;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentService, setCurrentService] = useState<Service | null>(null);

  const { showToast } = useToast();

  const fetchPopularServices = useCallback(async () => {
    setPopularLoading(true);
    try {
      const data = await getPopularServicesAdmin();
      setPopularServices(data);
    } catch (err: any) {
      showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải mức độ phổ biến dịch vụ");
    } finally {
      setPopularLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let active = true;
    getCategoriesAdmin()
      .then((res) => {
        if (active) setCategories(res.data);
      })
      .catch(() => {});
    Promise.resolve().then(() => {
      if (active) fetchPopularServices();
    });
    return () => {
      active = false;
    };
  }, [fetchPopularServices]);

  const fetchServices = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getServicesAdmin({
          status: statusFilter === "all" ? undefined : statusFilter,
          category_id: categoryFilter === "all" ? undefined : categoryFilter,
          page,
          limit: perPage,
        });
        const { data, last_page, total, current_page } = res.data;
        setServices(data);
        setCurrentPage(current_page);
        setTotalPages(last_page);
        setTotalItems(total);
      } catch (err: any) {
        showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách dịch vụ");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, categoryFilter, showToast],
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchServices(1);
    });
  }, [fetchServices]);

  const filteredServices = services.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      category_id: "" as unknown as number,
      name: "",
      description: "",
      image: "",
      base_price: "" as unknown as number,
      price_type: "hourly" as "hourly" | "fixed" | "daily",
      status: "active" as "active" | "inactive",
    },
    validationSchema: getServiceValidationSchema(),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (modalMode === "edit" && currentService) {
          await updateServiceAdmin(currentService.id, {
            category_id: Number(values.category_id),
            name: values.name,
            description: values.description || null,
            image: values.image || null,
            base_price: Number(values.base_price),
            price_type: values.price_type,
            status: values.status,
          });
          showToast("success", "Thành công", "Cập nhật dịch vụ thành công!");
        } else {
          await createServiceAdmin({
            category_id: Number(values.category_id),
            name: values.name,
            description: values.description || null,
            image: values.image || null,
            base_price: Number(values.base_price),
            price_type: values.price_type,
            status: values.status,
          });
          showToast("success", "Thành công", "Thêm dịch vụ mới thành công!");
        }
        closeModal();
        fetchServices(currentPage);
      } catch (err: any) {
        showToast("error", "Lỗi lưu dữ liệu", err.response?.data?.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
  });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentService(null);
    formik.resetForm({ values: { category_id: "" as any, name: "", description: "", image: "", base_price: "" as any, price_type: "hourly", status: "active" } });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Service) => {
    setModalMode("edit");
    setCurrentService(item);
    formik.resetForm({
      values: {
        category_id: item.category_id,
        name: item.name,
        description: item.description || "",
        image: item.image || "",
        base_price: Number(item.base_price),
        price_type: item.price_type,
        status: item.status,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, skipConfirm = false) => {
    if (!skipConfirm && !window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn dịch vụ này?")) return;
    setLoading(true);
    try {
      await deleteServiceAdmin(id);
      showToast("success", "Thành công", "Xóa dịch vụ thành công!");
      fetchServices(currentPage);
    } catch (err: any) {
      showToast("error", "Lỗi", err.response?.data?.message || "Không thể xóa dịch vụ");
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: Service) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await updateServiceAdmin(item.id, { status: newStatus });
      showToast("success", "Thành công", `Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} dịch vụ!`);
      fetchServices(currentPage);
    } catch (err: any) {
      showToast("error", "Lỗi cập nhật", err.response?.data?.message || "Không thể thay đổi trạng thái");
      setLoading(false);
    }
  };
  const PRICE_TYPE_LABELS = {
    hourly: {
      label: "Theo giờ",
      icon: "material-symbols:schedule-outline-rounded",
      color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    },
    fixed: {
      label: "Cố định",
      icon: "material-symbols:attach-money-rounded",
      color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    },
    daily: {
      label: "Theo ngày",
      icon: "material-symbols:calendar-today-outline",
      color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
    },
  };

  return {
    services: filteredServices,
    categories,
    popularServices,
    popularLoading,
    fetchPopularServices,
    PRICE_TYPE_LABELS,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    totalPages,
    fetchServices,
    isModalOpen,
    modalMode,

    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDelete,
    handleToggleStatus,
  };
};
