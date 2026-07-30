import { useToast } from "../../contexts/ToastContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getServiceDetailApi, type ServiceDetailResponse } from "../../api/servicesApi/services";
import { getHelperReviewsPublic, type Review, createReviewCustomer, updateReviewCustomer, deleteReviewCustomer } from "../../api/reviews";
import { getCustomerAddressesApi, addCustomerAddressApi, type CustomerAddress } from "../../api/profileApi/profile";
import { createBookingApi } from "../../api/bookings";

export interface ToastState {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

export const useServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryHelperId = searchParams.get("helperId") ? Number(searchParams.get("helperId")) : null;
  const { t } = useTranslation();

  const [detail, setDetail] = useState<ServiceDetailResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"helpers" | "reviews">("helpers");

  // User auth state
  const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const isCustomer = currentUser && currentUser.role_id === 4;

  // Selected helper for reviews
  const [selectedHelperId, setSelectedHelperId] = useState<number | null>(null);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const { showToast } = useToast();

  // States for the review form (create mode)
  const [formRating, setFormRating] = useState<number>(5);
  const [formComment, setFormComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // States for edit mode
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");

  // Booking states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookingTime, setBookingTime] = useState("08:00");
  const [durationHours, setDurationHours] = useState<number>(2);
  const [bookingNote, setBookingNote] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Add address inline states
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newDistrict, setNewDistrict] = useState("Quận 1");
  const [newCity, setNewCity] = useState("TP. Hồ Chí Minh");

  const helpers = detail?.helpers || [];

  const fetchAddresses = async () => {
    try {
      const res = await getCustomerAddressesApi();
      const addrList = res.data ?? [];
      setAddresses(addrList);
      if (addrList.length > 0) {
        const defaultAddr = addrList.find((a) => a.is_default === 1 || (a as any).is_default === true);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : addrList[0].id);
      }
    } catch (err) {
      // console.error("Failed to fetch customer addresses:", err);
    }
  };

  const openBookingModal = async () => {
    if (!currentUser) {
      showToast("warning", t("Đăng nhập"), t("Vui lòng đăng nhập để đặt dịch vụ."));
      setTimeout(() => {
        navigate("/dang-nhap");
      }, 1000);
      return;
    }
    if (!isCustomer) {
      showToast("error", t("Quyền truy cập"), t("Chỉ có tài khoản Khách hàng mới có thể đặt dịch vụ."));
      return;
    }
    if (!currentUser.full_name?.trim() || !currentUser.phone?.trim() || !currentUser.email?.trim()) {
      showToast("warning", t("Yêu cầu thông tin"), t("Vui lòng điền đầy đủ thông tin cá nhân (Họ tên, Số điện thoại, Email) trước khi đặt lịch."));
      setTimeout(() => {
        navigate("/ho-so");
      }, 2000);
      return;
    }
    setIsBookingModalOpen(true);
    await fetchAddresses();
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setIsAddingNewAddress(false);
    setNewAddress("");
    setBookingNote("");
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) {
      showToast("error", t("Lỗi"), t("Vui lòng nhập địa chỉ cụ thể."));
      return;
    }
    try {
      await addCustomerAddressApi({
        address: newAddress,
        district: newDistrict,
        city: newCity,
        is_default: addresses.length === 0,
      });
      showToast("success", t("Thành công"), t("Đã thêm địa chỉ mới!"));
      setNewAddress("");
      setIsAddingNewAddress(false);
      await fetchAddresses();
    } catch (err: any) {
      // console.error("Failed to add address:", err);
      showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể thêm địa chỉ."));
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();
    if (!selectedAddressId) {
      showToast("error", t("Lỗi"), t("Vui lòng chọn hoặc thêm địa chỉ nhận việc."));
      return;
    }
    if (!bookingDate) {
      showToast("error", t("Lỗi"), t("Vui lòng chọn ngày làm việc."));
      return;
    }
    if (!bookingTime) {
      showToast("error", t("Lỗi"), t("Vui lòng chọn giờ làm việc."));
      return;
    }
    if (bookingDateTime <= now) {
      showToast("error", t("Lỗi"), t("Thời gian đặt lịch phải ở trong tương lai."));
      return;
    }

    setIsBookingSubmitting(true);
    try {
      const serviceObj = detail?.data;
      if (!serviceObj) return;

      const isHourly = serviceObj.price_type === "hourly";
      const actualPrice = isHourly ? (Number(serviceObj.base_price) || 0) * durationHours : Number(serviceObj.base_price) || 0;

      const selectedHelperObj = helpers.find((h: any) => h.id === selectedHelperId);
      const helperUserId = selectedHelperObj?.user_id || selectedHelperId;

      const payload = {
        helper_id: helperUserId,
        address_id: selectedAddressId,
        booking_date: bookingDate,
        start_time: bookingTime,
        note: bookingNote || "",
        services: [
          {
            service_id: serviceObj.id,
            price: actualPrice,
            duration_hours: durationHours,
            quantity: 1,
          },
        ],
      };

      await createBookingApi(payload);
      showToast("success", t("Thành công"), t("Đặt lịch thành công! Đang chuyển hướng sang trang thanh toán..."));

      closeBookingModal();
      setTimeout(() => {
        navigate("/lich-su-dat-lich");
      }, 1500);
    } catch (err: any) {
      // console.error("Failed to create booking:", err);
      showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể tạo lịch đặt."));
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const fetchHelperReviews = async (helperId: number) => {
    try {
      const revRes = await getHelperReviewsPublic(helperId, { limit: 10 });
      setReviewStats(revRes);
      setReviews(revRes.data?.data ?? []);
    } catch (err) {
      // console.error("Failed to fetch helper reviews:", err);
      setReviews([]);
      setReviewStats(null);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getServiceDetailApi(Number(id));
        setDetail(res);

        if (res.helpers && res.helpers.length > 0) {
          const hasQueryHelper = res.helpers.some((h: any) => h.id === queryHelperId);
          const initialHelperId = hasQueryHelper ? queryHelperId! : res.helpers[0].id;
          setSelectedHelperId(initialHelperId);
          await fetchHelperReviews(initialHelperId);
        }
      } catch (err) {
        // console.error("Failed to fetch service detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, queryHelperId]);

  useEffect(() => {
    if (selectedHelperId) {
      Promise.resolve().then(() => {
        fetchHelperReviews(selectedHelperId);
      });
    }
  }, [selectedHelperId]);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!selectedHelperId) {
      showToast("error", t("Lỗi"), t("Vui lòng chọn nhân viên để xem và đánh giá."));
      return;
    }
    setSubmitting(true);
    try {
      await createReviewCustomer({
        helper_id: selectedHelperId,
        rating: formRating,
        comment: formComment || "",
      });
      showToast("success", t("Thành công"), t("Đánh giá của bạn đã được gửi!"));
      setFormComment("");
      setFormRating(5);
      if (selectedHelperId) {
        await fetchHelperReviews(selectedHelperId);
      }
    } catch (err: any) {
      // console.error("Failed to create review:", err);
      showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể gửi đánh giá."));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleUpdateReview = async (reviewId: number) => {
    try {
      await updateReviewCustomer(reviewId, {
        rating: editRating,
        comment: editComment,
      });
      showToast("success", t("Thành công"), t("Cập nhật đánh giá thành công!"));
      setEditingReviewId(null);
      if (selectedHelperId) {
        await fetchHelperReviews(selectedHelperId);
      }
    } catch (err: any) {
      // console.error("Failed to update review:", err);
      showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể cập nhật đánh giá."));
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm(t("Bạn có chắc chắn muốn xóa đánh giá này?"))) return;
    try {
      await deleteReviewCustomer(reviewId);
      showToast("success", t("Thành công"), t("Xóa đánh giá thành công!"));
      if (selectedHelperId) {
        await fetchHelperReviews(selectedHelperId);
      }
    } catch (err: any) {
      // console.error("Failed to delete review:", err);
      showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể xóa đánh giá."));
    }
  };

  return {
    id,
    navigate,
    t,
    detail,
    reviews,
    loading,
    activeTab,
    setActiveTab,
    currentUser,
    isCustomer,
    selectedHelperId,
    setSelectedHelperId,
    reviewStats,

    formRating,
    setFormRating,
    formComment,
    setFormComment,
    submitting,
    editingReviewId,
    setEditingReviewId,
    editRating,
    setEditRating,
    editComment,
    setEditComment,
    helpers,
    handleCreateReview,
    startEdit,
    handleUpdateReview,
    handleDeleteReview,

    // Booking states & functions
    isBookingModalOpen,
    setIsBookingModalOpen,
    addresses,
    setAddresses,
    selectedAddressId,
    setSelectedAddressId,
    bookingDate,
    setBookingDate,
    bookingTime,
    setBookingTime,
    durationHours,
    setDurationHours,
    bookingNote,
    setBookingNote,
    isBookingSubmitting,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddress,
    setNewAddress,
    newDistrict,
    setNewDistrict,
    newCity,
    setNewCity,
    openBookingModal,
    closeBookingModal,
    handleAddNewAddress,
    handleCreateBooking,
  };
};
