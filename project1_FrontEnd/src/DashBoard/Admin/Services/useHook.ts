import { useState } from "react";

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  basePrice: string;
  priceType: string;
  status: "Active" | "Draft" | "Archived";
}

export const useServices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialServices: ServiceItem[] = [
    {
      id: "SRV-001",
      name: "Deep Home Cleaning",
      category: "Cleaning",
      icon: "material-symbols:cleaning-services-outline",
      basePrice: "500,000 ₫",
      priceType: "Fixed",
      status: "Active",
    },
    {
      id: "SRV-042",
      name: "Air Conditioner Repair",
      category: "Repair",
      icon: "material-symbols:ac-unit",
      basePrice: "250,000 ₫",
      priceType: "Hourly",
      status: "Active",
    },
    {
      id: "SRV-088",
      name: "Elderly Care (Basic)",
      category: "Care",
      icon: "material-symbols:elderly-outline",
      basePrice: "150,000 ₫",
      priceType: "Hourly",
      status: "Draft",
    },
    {
      id: "SRV-012",
      name: "Standard Sofa Cleaning",
      category: "Cleaning",
      icon: "material-symbols:chair-outline",
      basePrice: "350,000 ₫",
      priceType: "Fixed",
      status: "Active",
    },
  ];

  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // CRUD Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentService, setCurrentService] = useState<ServiceItem | undefined>(undefined);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentService(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setModalMode("edit");
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(undefined);
  };

  const handleSaveService = (serviceData: Omit<ServiceItem, "id"> & { id?: string }) => {
    if (modalMode === "edit" && serviceData.id) {
      setServices((prev) => prev.map((item) => (item.id === serviceData.id ? ({ ...item, ...serviceData } as ServiceItem) : item)));
    } else {
      const newId = `SRV-${String(Math.floor(Math.random() * 900) + 100)}`;
      const newService: ServiceItem = {
        ...serviceData,
        id: newId,
      } as ServiceItem;
      setServices((prev) => [newService, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All Categories" || service.category === selectedCategory;

    const matchesStatus = selectedStatus === "All Statuses" || service.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length && filteredServices.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map((service) => service.id));
    }
  };

  const deleteSelected = () => {
    setServices((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

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
    services: filteredServices,
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
