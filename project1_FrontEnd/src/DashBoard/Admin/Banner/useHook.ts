import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { Banner } from "../../../api/banners";
import { getBannersAdmin, createBannerAdmin, updateBannerAdmin, toggleBannerStatusAdmin, deleteBannerAdmin, uploadBannerImage } from "../../../api/banners";
import { useToast } from "../../../contexts/ToastContext";

export const useBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
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
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);

  const { showToast } = useToast();

  const fetchBanners = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await getBannersAdmin({
          search: searchQuery || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          limit: perPage });

        const { data, last_page, total, current_page, per_page } = response.data;
        setBanners(data);
        setCurrentPage(current_page);
        setTotalPages(last_page);
        setTotalItems(total);
        setPerPage(per_page);
      } catch (err: any) {
        console.error(err);
        showToast("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách banner");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, statusFilter, perPage, showToast],
  );

  // Load banners on filter/search or pagination change
  useEffect(() => {
    let active = true;
    const executeFetch = async () => {
      await Promise.resolve();
      if (active) {
        fetchBanners(1);
      }
    };
    executeFetch();
    return () => {
      active = false;
    };
  }, [searchQuery, statusFilter, fetchBanners]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBanner(null);
    formik.resetForm();
  };

  // Formik validation and submission
  const formik = useFormik({
    initialValues: {
      title: "",
      image: "",
      link: "",
      status: "active" as "active" | "inactive" },
    validationSchema: Yup.object().shape({
      title: Yup.string().required("Vui lòng nhập tiêu đề banner").max(150, "Tiêu đề không được vượt quá 150 ký tự"),
      image: Yup.string()
        .required("Vui lòng nhập đường dẫn hình ảnh banner")
        .max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
        .test(
          "is-valid-image",
          "Hình ảnh phải là URL hoặc đường dẫn tải lên hợp lệ và có đuôi định dạng ảnh (.jpg, .jpeg, .png, .webp)",
          (value) => {
            if (!value) return false;
            const hasValidExtension = /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(value);
            if (!hasValidExtension) return false;

            if (value.startsWith("uploads/")) return true;
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          }
        ),
      link: Yup.string()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .max(255, "Đường dẫn liên kết không được vượt quá 255 ký tự"),
      status: Yup.string().oneOf(["active", "inactive"]).required("Vui lòng chọn trạng thái") }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (modalMode === "edit" && currentBanner) {
          await updateBannerAdmin(currentBanner.id, {
            title: values.title,
            image: values.image,
            link: values.link || null,
            status: values.status });
          showToast("success", "Thành công", "Cập nhật banner thành công!");
        } else {
          await createBannerAdmin({
            title: values.title,
            image: values.image,
            link: values.link || null,
            status: values.status });
          showToast("success", "Thành công", "Thêm banner mới thành công!");
        }
        closeModal();
        fetchBanners(currentPage);
      } catch (err: any) {
        console.error(err);
        showToast("error", "Lỗi lưu dữ liệu", err.response?.data?.message || "Có lỗi xảy ra khi lưu banner");
      } finally {
        setLoading(false);
      }
    } });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentBanner(null);
    formik.resetForm({
      values: {
        title: "",
        image: "",
        link: "",
        status: "active" } });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setModalMode("edit");
    setCurrentBanner(banner);
    formik.resetForm({
      values: {
        title: banner.title,
        image: banner.image,
        link: banner.link || "",
        status: banner.status } });
    setIsModalOpen(true);
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return;

    setLoading(true);
    try {
      await deleteBannerAdmin(id);
      showToast("success", "Thành công", "Xóa banner thành công!");
      // If we deleted the last item on the current page, go to previous page
      const isLastItemOnPage = banners.length === 1 && currentPage > 1;
      fetchBanners(isLastItemOnPage ? currentPage - 1 : currentPage);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Lỗi xóa banner", err.response?.data?.message || "Không thể xóa banner này");
      setLoading(false);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    const newStatus = banner.status === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      await toggleBannerStatusAdmin(banner.id, newStatus);
      showToast("success", "Thành công", `Đã ${newStatus === "active" ? "hiện" : "ẩn"} banner thành công!`);
      fetchBanners(currentPage);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Lỗi cập nhật", err.response?.data?.message || "Không thể thay đổi trạng thái banner");
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const res = await uploadBannerImage(file);
      formik.setFieldValue("image", res.path);
      showToast("success", "Thành công", "Tải ảnh lên thành công!");
    } catch (err: any) {
      console.error(err);
      showToast("error", "Lỗi tải ảnh", err.response?.data?.message || "Không thể tải ảnh lên server");
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    banners,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage: fetchBanners,
    totalPages,
    totalItems,
    isModalOpen,
    modalMode,
    openAddModal,
    openEditModal,
    closeModal,
    formik,
    handleDeleteBanner,
    handleToggleStatus,
    uploadingImage,
    handleUploadImage };
};

