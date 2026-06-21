import { useState, useEffect, useRef, useCallback } from "react";
import type { Service, ServiceCategory } from "../../../api/services";
import {
  getServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getCategoriesAdmin,
} from "../../../api/services";

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // CRUD Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentService, setCurrentService] = useState<Service | undefined>(undefined);

  // Toast state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string
  ) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ type, title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch categories (dropdown options)
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategoriesAdmin();
      setCategories(response.data);
    } catch (error: any) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "All Statuses" ? selectedStatus.toLowerCase() : undefined;
      const categoryParam = selectedCategory !== "All Categories" ? selectedCategory : undefined;
      
      const response = await getServicesAdmin({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
        category_id: categoryParam,
      });

      setServices(response.data.data);
      setTotalItems(response.data.total);
    } catch (error: any) {
      showToast("error", "Error", error.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, selectedCategory, itemsPerPage, showToast]);

  // Load initial data
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch services when page or filters change
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentService(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setModalMode("edit");
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(undefined);
  };

  const handleSaveService = async (serviceData: {
    id?: number;
    category_id: number;
    name: string;
    description: string;
    base_price: number;
    price_type: "hourly" | "fixed" | "daily";
    status: "active" | "inactive";
  }) => {
    try {
      if (modalMode === "edit" && serviceData.id) {
        await updateServiceAdmin(serviceData.id, serviceData);
        showToast("success", "Success", "Service updated successfully");
      } else {
        await createServiceAdmin({
          category_id: serviceData.category_id,
          name: serviceData.name,
          description: serviceData.description,
          base_price: serviceData.base_price,
          price_type: serviceData.price_type,
          status: serviceData.status,
        });
        showToast("success", "Success", "Service created successfully");
      }
      closeModal();
      fetchServices();
    } catch (error: any) {
      showToast("error", "Error", error.response?.data?.message || "Failed to save service");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to disable this service?")) return;
    try {
      await deleteServiceAdmin(id);
      showToast("success", "Success", "Service disabled successfully");
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      fetchServices();
    } catch (error: any) {
      showToast("error", "Error", error.response?.data?.message || "Failed to delete service");
    }
  };

  // Perform client-side filter of current page services for search bar
  const displayedServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(service.id).includes(searchQuery) ||
      (service.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedServices.length && displayedServices.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedServices.map((service) => service.id));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to disable ${selectedIds.length} selected services?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteServiceAdmin(id)));
      showToast("success", "Success", "Selected services disabled successfully");
      setSelectedIds([]);
      fetchServices();
    } catch (error: any) {
      showToast("error", "Error", "Failed to disable some selected services");
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    services: displayedServices,
    categories,
    loading,
    toast,
    setToast,
    handleDelete,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    deleteSelected,
    isModalOpen,
    modalMode,
    currentService,
    openAddModal,
    openEditModal,
    closeModal,
    handleSaveService,
  };
};
