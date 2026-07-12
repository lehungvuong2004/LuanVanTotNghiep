import { useState, useEffect, useCallback, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { Service, ServiceCategory } from "../../../api/services";
import type { ToastProps } from "../../../types/Toast";
import {
  getServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getCategoriesAdmin,
} from "../../../api/services";

export const useServicesAdmin = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
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

  const [toast, setToast] = useState<ToastProps | null>(null);
  const timerRef = useRef<any>(null);

  const showToast = useCallback((type: ToastProps["type"], title: string, message?: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ type, title, message });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Fetch categories once for select options
  useEffect(() => {
    getCategoriesAdmin().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

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
    [statusFilter, categoryFilter, showToast]
  );

  useEffect(() => {
    fetchServices(1);
  }, [fetchServices]);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      base_price: "" as unknown as number,
      price_type: "hourly" as "hourly" | "fixed" | "daily",
      status: "active" as "active" | "inactive",
    },
    validationSchema: Yup.object().shape({
      category_id: Yup.number().required("Vui lòng chọn danh mục").min(1, "Vui lòng chọn danh mục"),
      name: Yup.string().required("Vui lòng nhập tên dịch vụ").max(100, "Không quá 100 ký tự"),
      description: Yup.string().nullable(),
      base_price: Yup.number()
        .required("Vui lòng nhập giá")
        .test("price-range", "Giá không hợp lệ", function (value) {
          if (value === undefined || value === null) return false;
          const { price_type } = this.parent;
          if (price_type === "hourly") {
            if (value < 30000) {
              return this.createError({ message: "Giá theo giờ tối thiểu là 30.000 VNĐ/giờ" });
            }
            if (value > 1000000) {
              return this.createError({ message: "Giá theo giờ tối đa là 1.000.000 VNĐ/giờ" });
            }
          } else if (price_type === "daily") {
            if (value < 100000) {
              return this.createError({ message: "Giá theo ngày tối thiểu là 100.000 VNĐ/ngày" });
            }
            if (value > 10000000) {
              return this.createError({ message: "Giá theo ngày tối đa là 10.000.000 VNĐ/ngày" });
            }
          } else {
            if (value < 10000) {
              return this.createError({ message: "Giá cố định tối thiểu là 10.000 VNĐ" });
            }
            if (value > 50000000) {
              return this.createError({ message: "Giá cố định tối đa là 50.000.000 VNĐ" });
            }
          }
          return true;
        }),
      price_type: Yup.string().oneOf(["hourly", "fixed", "daily"]).required(),
      status: Yup.string().oneOf(["active", "inactive"]).required(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (modalMode === "edit" && currentService) {
          await updateServiceAdmin(currentService.id, {
            category_id: Number(values.category_id),
            name: values.name,
            description: values.description || null,
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
    formik.resetForm({ values: { category_id: "" as any, name: "", description: "", base_price: "" as any, price_type: "hourly", status: "active" } });
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

  return {
    services: filteredServices,
    categories,
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
    toast,
    setToast,
    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDelete,
    handleToggleStatus,
  };
};
