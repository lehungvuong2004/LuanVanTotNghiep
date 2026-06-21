import React from "react";
import { Icon } from "@iconify/react";
import { useServices } from "./useHook";
import { Pagination } from "../../../components/Pagination";
import { Toast } from "../../../components/Toast";

export const Services: React.FC = () => {
  const {
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
    services,
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
  } = useServices();

  // Toast message renderer
  const renderToast = () => {
    if (!toast) return null;
    return (
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(null)}
      />
    );
  };

  // Helper render functions for cleaner code structure
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Services Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">View, add, and manage services offered by Gia Đình Việt.</p>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors active:scale-95 shadow-sm border border-transparent whitespace-nowrap cursor-pointer w-full sm:w-auto"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Add Service
        </button>
        <div className="relative w-full sm:w-64">
          <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
          <input
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all dark:text-slate-100 shadow-xs"
            placeholder="Search services..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderToolbar = () => {
    if (selectedIds.length > 0) {
      return (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
          <span className="text-sm font-semibold text-red-500">
            Selected {selectedIds.length} {selectedIds.length === 1 ? "service" : "services"}
          </span>
          <button onClick={deleteSelected} className="flex items-center gap-2 bg-red-650 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer active:scale-95 shadow-sm">
            <Icon icon="material-symbols:delete-outline" className="text-base" />
            Delete Selected
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <Icon icon="material-symbols:filter-list" className="text-lg" />
          <span>Showing {services.length} services</span>
        </div>
      </div>
    );
  };

  const renderGridList = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading services...</span>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto w-full">
        <div className="min-w-200">
          {/* Grid Header Row */}
          <div className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider py-4 px-6">
            <div className="col-span-1 flex items-center">
              <input
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                type="checkbox"
                checked={services.length > 0 && selectedIds.length === services.length}
                onChange={toggleSelectAll}
              />
            </div>
            <div className="col-span-3">Service Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Base Price</div>
            <div className="col-span-2">Price Type</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Grid Body Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            {services.map((service) => (
              <div key={service.id} className="grid grid-cols-12 gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors py-4 px-6">
                <div className="col-span-1 flex items-center">
                  <input
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    type="checkbox"
                    checked={selectedIds.includes(service.id)}
                    onChange={() => toggleSelect(service.id)}
                  />
                </div>
                <div className="col-span-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{service.name}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">ID: {service.id}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Icon 
                      icon={service.category?.icon || "material-symbols:handyman-outline-rounded"} 
                      className="text-lg text-slate-500 dark:text-slate-400" 
                    />
                    <span>{service.category?.name || "Uncategorized"}</span>
                  </div>
                </div>
                <div className="col-span-2 font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {Number(service.base_price).toLocaleString("vi-VN")} ₫
                </div>
                <div className="col-span-2 text-sm text-slate-500 dark:text-slate-450">
                  {service.price_type.charAt(0).toUpperCase() + service.price_type.slice(1)}
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      service.status === "active"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        service.status === "active" ? "bg-emerald-600 dark:bg-emerald-400" : "bg-slate-500 dark:bg-slate-400"
                      }`}
                    />
                    {service.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Icon icon="material-symbols:edit-outline" className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1.5 text-slate-500 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Icon icon="material-symbols:delete-outline" className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && <div className="p-8 text-center text-slate-400 dark:text-slate-500">No services found.</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderCrudModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{modalMode === "add" ? "Add New Service" : "Edit Service"}</h3>
            <button
              onClick={closeModal}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>

          {/* Modal Body / Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveService({
                id: currentService?.id,
                category_id: Number(formData.get("category_id")),
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                base_price: Number(formData.get("base_price")),
                price_type: formData.get("price_type") as "hourly" | "fixed" | "daily",
                status: formData.get("status") as "active" | "inactive",
              });
            }}
            className="p-6 space-y-4"
          >
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Service Name</label>
              <input
                name="name"
                required
                defaultValue={currentService?.name || ""}
                placeholder="e.g., Deep Home Cleaning"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all dark:text-slate-100"
                type="text"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
              <textarea
                name="description"
                defaultValue={currentService?.description || ""}
                placeholder="Enter service details, features, etc."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all dark:text-slate-100 resize-none"
              />
            </div>

            {/* Grid for Category and Price Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                <select
                  name="category_id"
                  defaultValue={currentService?.category_id || (categories[0]?.id || "")}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer dark:text-slate-100"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Price Type</label>
                <select
                  name="price_type"
                  defaultValue={currentService?.price_type || "fixed"}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer dark:text-slate-100"
                >
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>

            {/* Grid for Base Price and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Base Price (₫)</label>
                <input
                  name="base_price"
                  required
                  defaultValue={currentService?.base_price || ""}
                  placeholder="e.g., 500000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all dark:text-slate-100"
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Status</label>
                <select
                  name="status"
                  defaultValue={currentService?.status || "active"}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer dark:text-slate-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {renderToast()}
      {/* Main Content Area */}
      <main className="flex-1 p-6 w-full max-w-7xl mx-auto">
        {renderHeader()}

        {/* Service List Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {renderToolbar()}
          {renderGridList()}

          {/* Pagination Component */}
          {!loading && services.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </main>

      {renderCrudModal()}
    </div>
  );
};
