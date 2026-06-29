import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getProfileApi,
  updateProfileApi,
  getCustomerProfileApi,
  updateCustomerProfileApi,
  getCustomerAddressesApi,
  addCustomerAddressApi,
  updateCustomerAddressApi,
  deleteCustomerAddressApi,
  setDefaultCustomerAddressApi,
  uploadAvatarApi
} from "../../api/profile";

import type {
  UserProfile,
  CustomerProfile,
  CustomerAddress
} from "../../api/profile";

export const useProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"info" | "address" | "password">("info");
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Address dialog/modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Avatar uploading state
  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);

  // Upload user avatar file
  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await uploadAvatarApi(file);
      profileForm.setFieldValue("avatar", res.url);
      if (userProfile) {
        const updated = { ...userProfile, avatar: res.url };
        setUserProfile(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setSuccessMessage(t("Tải ảnh đại diện lên thành công."));
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      setErrorMessage(error?.response?.data?.message || t("Tải ảnh lên thất bại. Vui lòng thử lại."));
    } finally {
      setAvatarUploading(false);
    }
  };



  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      const res = await getCustomerAddressesApi();
      setAddresses(res.data);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  // Fetch user profile and custom profile on load
  const fetchAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/dang-nhap");
        return;
      }

      // 1. Fetch User profile
      const userRes = await getProfileApi();
      const user = userRes.data;
      setUserProfile(user);

      // 2. Fetch Customer profile if user role is Customer (role_id = 4)
      if (user.role_id === 4) {
        try {
          const custRes = await getCustomerProfileApi();
          setCustomerProfile(custRes.data);
          setAddresses(custRes.data.addresses || []);
        } catch (custErr) {
          console.error("Failed to fetch customer profile:", custErr);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/dang-nhap");
      } else {
        setErrorMessage(t("Không thể tải thông tin profile. Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Clear messages after a short time
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Formik for Personal Information
  const profileForm = useFormik({
    initialValues: {
      full_name: userProfile?.full_name || "",
      phone: userProfile?.phone || "",
      avatar: userProfile?.avatar || "",
      gender: customerProfile?.gender || "male",
      birthday: customerProfile?.birthday || "",
      note: customerProfile?.note || ""
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      full_name: Yup.string()
        .required(t("Vui lòng nhập họ và tên"))
        .min(2, t("Họ và tên phải có ít nhất 2 ký tự"))
        .max(100, t("Họ và tên không vượt quá 100 ký tự")),
      phone: Yup.string()
        .nullable()
        .test("is-phone", t("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"), (value) => {
          if (!value) return true; // phone is optional in profile edit
          const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
          return phoneRegex.test(value);
        }),
      avatar: Yup.string().nullable().max(191, t("Đường dẫn ảnh quá dài")),
      gender: Yup.string().oneOf(["male", "female", "other"]).nullable(),
      birthday: Yup.date()
        .nullable()
        .max(new Date(), t("Ngày sinh phải trước ngày hôm nay")),
      note: Yup.string().max(191, t("Ghi chú không quá 191 ký tự")).nullable()
    }),
    onSubmit: async (values) => {
      setUpdating(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        // 1. Update user account info
        const userUpdateRes = await updateProfileApi({
          full_name: values.full_name,
          phone: values.phone || undefined,
          avatar: values.avatar || undefined
        });

        // Update local storage representation of the user
        const updatedUser = userUpdateRes.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserProfile(updatedUser);

        // 2. Update customer profile info if they are customer
        if (userProfile?.role_id === 4) {
          await updateCustomerProfileApi({
            gender: values.gender,
            birthday: values.birthday || undefined,
            note: values.note || undefined
          });
        }

        await fetchAllData();
        setSuccessMessage(t("Cập nhật thông tin cá nhân thành công."));
      } catch (error: any) {
        console.error("Update profile failed:", error);
        setErrorMessage(error?.response?.data?.message || t("Cập nhật thông tin thất bại. Vui lòng thử lại."));
      } finally {
        setUpdating(false);
      }
    }
  });

  // Formik for Password Change
  const passwordForm = useFormik({
    initialValues: {
      password: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("Vui lòng nhập mật khẩu mới"))
        .min(6, t("Mật khẩu phải có ít nhất 6 ký tự"))
        .max(32, t("Mật khẩu không được vượt quá 32 ký tự"))
        .test("no-space", t("Mật khẩu không được chứa khoảng trắng"), (val) => !/\s/.test(val || ""))
        .test("has-upper", t("Mật khẩu phải chứa ít nhất 1 chữ in hoa"), (val) => /[A-Z]/.test(val || ""))
        .test("has-lower", t("Mật khẩu phải chứa ít nhất 1 chữ in thường"), (val) => /[a-z]/.test(val || ""))
        .test("has-digit", t("Mật khẩu phải chứa ít nhất 1 chữ số"), (val) => /[0-9]/.test(val || "")),
      confirmPassword: Yup.string()
        .required(t("Vui lòng xác nhận mật khẩu mới"))
        .oneOf([Yup.ref("password")], t("Mật khẩu xác nhận không khớp"))
    }),
    onSubmit: async (values, { resetForm }) => {
      setUpdating(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        await updateProfileApi({
          password: values.password
        });
        setSuccessMessage(t("Thay đổi mật khẩu thành công."));
        resetForm();
      } catch (error: any) {
        console.error("Change password failed:", error);
        setErrorMessage(error?.response?.data?.message || t("Đổi mật khẩu thất bại. Vui lòng thử lại."));
      } finally {
        setUpdating(false);
      }
    }
  });

  // Formik for Add/Edit Address
  const addressForm = useFormik({
    initialValues: {
      address: "",
      district: "",
      city: "",
      is_default: false
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      address: Yup.string().required(t("Vui lòng nhập địa chỉ cụ thể")).max(255, t("Địa chỉ không vượt quá 255 ký tự")),
      district: Yup.string().required(t("Vui lòng nhập quận/huyện")).max(100, t("Quận/huyện không vượt quá 100 ký tự")),
      city: Yup.string().required(t("Vui lòng nhập tỉnh/thành phố")).max(100, t("Tỉnh/thành phố không vượt quá 100 ký tự")),
      is_default: Yup.boolean()
    }),
    onSubmit: async (values, { resetForm }) => {
      setUpdating(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        if (editingAddress) {
          // Update address details
          await updateCustomerAddressApi(editingAddress.id, {
            address: values.address,
            district: values.district,
            city: values.city
          });

          // If is_default changed to true, trigger the default patch
          if (values.is_default && editingAddress.is_default === 0) {
            await setDefaultCustomerAddressApi(editingAddress.id);
          }

          setSuccessMessage(t("Cập nhật địa chỉ thành công."));
        } else {
          // Create new address
          await addCustomerAddressApi({
            address: values.address,
            district: values.district,
            city: values.city,
            is_default: values.is_default
          });
          setSuccessMessage(t("Thêm địa chỉ mới thành công."));
        }

        setIsAddressModalOpen(false);
        setEditingAddress(null);
        resetForm();
        await fetchAddresses();
      } catch (error: any) {
        console.error("Address operation failed:", error);
        setErrorMessage(error?.response?.data?.message || t("Lỗi thao tác địa chỉ. Vui lòng thử lại."));
      } finally {
        setUpdating(false);
      }
    }
  });

  // Open address modal in edit mode
  const handleEditAddressClick = (addressItem: CustomerAddress) => {
    setEditingAddress(addressItem);
    addressForm.setValues({
      address: addressItem.address,
      district: addressItem.district || "",
      city: addressItem.city || "",
      is_default: addressItem.is_default === 1
    });
    setIsAddressModalOpen(true);
  };

  // Open address modal in create mode
  const handleAddAddressClick = () => {
    setEditingAddress(null);
    addressForm.resetForm();
    setIsAddressModalOpen(true);
  };

  // Delete address
  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm(t("Bạn có chắc chắn muốn xóa địa chỉ này không?"))) return;
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteCustomerAddressApi(id);
      setSuccessMessage(t("Xóa địa chỉ thành công."));
      await fetchAddresses();
    } catch (err: any) {
      console.error("Failed to delete address:", err);
      setErrorMessage(err?.response?.data?.message || t("Xóa địa chỉ thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (id: number) => {
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await setDefaultCustomerAddressApi(id);
      setSuccessMessage(t("Đã thay đổi địa chỉ mặc định."));
      await fetchAddresses();
    } catch (err: any) {
      console.error("Failed to set default address:", err);
      setErrorMessage(err?.response?.data?.message || t("Đặt địa chỉ mặc định thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  return {
    t,
    activeTab,
    setActiveTab,
    loading,
    updating,
    userProfile,
    customerProfile,
    addresses,
    errorMessage,
    successMessage,
    profileForm,
    passwordForm,
    addressForm,
    isAddressModalOpen,
    setIsAddressModalOpen,
    editingAddress,
    handleEditAddressClick,
    handleAddAddressClick,
    handleDeleteAddress,
    handleSetDefaultAddress,
    avatarUploading,
    handleAvatarUpload
  };
};
