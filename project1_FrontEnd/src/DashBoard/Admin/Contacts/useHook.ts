import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../contexts/ToastContext";
import {
  getContactsAdminApi,
  processContactAdminApi,
  deleteContactAdminApi,
} from "../../../api/contactsApi/contacts";
import type { Contact } from "../../../api/contactsApi/contacts";

export const useAdminContacts = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All"); // All | pending | processed
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getContactsAdminApi({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter === "All" ? undefined : statusFilter.toLowerCase(),
        search: searchQuery || undefined,
      });

      setContacts(response.data.data);
      setTotalItems(response.data.total);
    } catch (error: any) {
      console.error("Fetch contacts error:", error);
      showToast("error", t("Lỗi"), t("Không thể tải danh sách liên hệ."));
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, searchQuery, showToast, t]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleProcessContact = async (id: number) => {
    try {
      const response = await processContactAdminApi(id);
      showToast("success", t("Thành công"), response.message || t("Đã xử lý liên hệ thành công."));
      // Refresh list
      fetchContacts();
    } catch (error: any) {
      console.error("Process contact error:", error);
      showToast("error", t("Lỗi"), error?.response?.data?.message || t("Xử lý liên hệ thất bại."));
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      const response = await deleteContactAdminApi(id);
      showToast("success", t("Thành công"), response.message || t("Đã xóa liên hệ thành công."));
      // Reset page if needed
      if (contacts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchContacts();
      }
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (error: any) {
      // console.error("Delete contact error:", error);
      showToast("error", t("Lỗi"), error?.response?.data?.message || t("Xóa liên hệ thất bại."));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    contacts,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
    fetchContacts,
    handleProcessContact,
    handleDeleteContact,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
  };
};
