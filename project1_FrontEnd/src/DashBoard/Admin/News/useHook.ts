import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import type { NewsItem } from "../../../api/newsApi/news";
import { getNewsAdmin, createNewsAdmin, updateNewsAdmin, toggleNewsStatusAdmin, deleteNewsAdmin, uploadNewsImage } from "../../../api/newsApi/news";
import { newsValidationSchema } from "../../../api/newsApi/validation";

export const useNewsAdmin = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Modal and CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentNews, setCurrentNews] = useState<NewsItem | null>(null);

  // Toast state
  const { showToast } = useToast();

  const fetchNewsList = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await getNewsAdmin({
          search: searchQuery || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          limit: 6,
        });

        const { data, last_page, total, current_page, per_page: limit_page } = response.data;
        setNews(data);
        setCurrentPage(current_page);
        setTotalPages(last_page);
        setTotalItems(total);
        setPerPage(limit_page);
      } catch (err: any) {
        showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách tin tức");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, statusFilter, showToast],
  );

  useEffect(() => {
    let active = true;
    const executeFetch = async () => {
      await Promise.resolve();
      if (active) fetchNewsList(1);
    };
    executeFetch();
    return () => {
      active = false;
    };
  }, [searchQuery, statusFilter, fetchNewsList]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentNews(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      thumbnail: "",
      summary: "",
      content: "",
      status: "published" as "draft" | "published",
    },
    validationSchema: newsValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (modalMode === "edit" && currentNews) {
          await updateNewsAdmin(currentNews.id, {
            title: values.title,
            thumbnail: values.thumbnail || null,
            summary: values.summary || null,
            content: values.content,
            status: values.status,
          });
          showToast("success", "Thành công", "Cập nhật bài viết thành công!");
        } else {
          await createNewsAdmin({
            title: values.title,
            thumbnail: values.thumbnail || null,
            summary: values.summary || null,
            content: values.content,
            status: values.status,
          });
          showToast("success", "Thành công", "Thêm bài viết mới thành công!");
        }
        closeModal();
        fetchNewsList(currentPage);
      } catch (err: any) {
        showToast("error", "Lỗi lưu dữ liệu", err.response?.data?.message || "Có lỗi xảy ra khi lưu tin tức");
      } finally {
        setLoading(false);
      }
    },
  });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentNews(null);
    formik.resetForm({
      values: {
        title: "",
        thumbnail: "",
        summary: "",
        content: "",
        status: "published",
      },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setModalMode("edit");
    setCurrentNews(item);
    formik.resetForm({
      values: {
        title: item.title,
        thumbnail: item.thumbnail || "",
        summary: item.summary || "",
        content: item.content,
        status: item.status,
      },
    });
    setIsModalOpen(true);
  };

  const handleDeleteNews = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    setLoading(true);
    try {
      await deleteNewsAdmin(id);
      showToast("success", "Thành công", "Xóa bài viết thành công!");
      const isLastItemOnPage = news.length === 1 && currentPage > 1;
      fetchNewsList(isLastItemOnPage ? currentPage - 1 : currentPage);
    } catch (err: any) {
      showToast("error", "Lỗi xóa tin tức", err.response?.data?.message || "Không thể xóa bài viết này");
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: NewsItem) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    setLoading(true);
    try {
      await toggleNewsStatusAdmin(item.id, newStatus);
      showToast("success", "Thành công", `Đã ${newStatus === "published" ? "hiện" : "ẩn"} bài viết thành công!`);
      fetchNewsList(currentPage);
    } catch (err: any) {
      showToast("error", "Lỗi cập nhật", err.response?.data?.message || "Không thể thay đổi trạng thái bài viết");
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const response = await uploadNewsImage(file);
      formik.setFieldValue("thumbnail", response.path);
      showToast("success", "Tải ảnh lên thành công");
    } catch (err: any) {
      showToast("error", "Lỗi tải ảnh lên", err.response?.data?.message || "Không thể tải hình ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    news,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage: fetchNewsList,
    totalPages,
    totalItems,
    perPage,
    isModalOpen,
    modalMode,

    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDeleteNews,
    handleToggleStatus,
    uploadingImage,
    handleUploadImage,
  };
};
