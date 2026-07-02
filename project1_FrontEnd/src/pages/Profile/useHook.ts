import { useState, useEffect } from "react";
import { useFormik } from "formik";
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
  uploadAvatarApi,
  getHelperProfileApi,
  updateHelperProfileApi,
  getHelperSkillsApi,
  addHelperSkillApi,
  removeHelperSkillApi,
  getHelperWorkingAreasApi,
  addHelperWorkingAreaApi,
  removeHelperWorkingAreaApi
} from "../../api/profileApi/profile";

import type {
  UserProfile,
  CustomerProfile,
  CustomerAddress,
  HelperProfile
} from "../../api/profileApi/profile";

import { getCategoriesApi, type ServiceCategory } from "../../api/services";

import {
  getProfileInfoSchema,
  getProfilePasswordSchema,
  getProfileAddressSchema
} from "../../api/profileApi/validation";

export const useProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"info" | "address" | "password" | "skills" | "working_areas">("info");
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [helperProfile, setHelperProfile] = useState<HelperProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [helperSkills, setHelperSkills] = useState<any[]>([]);
  const [helperWorkingAreas, setHelperWorkingAreas] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<ServiceCategory[]>([]);
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

  const fetchHelperSkills = async () => {
    try {
      const res = await getHelperSkillsApi();
      setHelperSkills(res.data || []);
    } catch (err) {
      console.error("Failed to fetch helper skills:", err);
    }
  };

  const fetchHelperWorkingAreas = async () => {
    try {
      const res = await getHelperWorkingAreasApi();
      setHelperWorkingAreas(res.data || []);
    } catch (err) {
      console.error("Failed to fetch helper working areas:", err);
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

      // 3. Fetch Helper profile if user role is Helper (role_id = 3)
      if (user.role_id === 3) {
        try {
          const helperRes = await getHelperProfileApi();
          setHelperProfile(helperRes.data);
          await fetchHelperSkills();
          await fetchHelperWorkingAreas();
          const catRes = await getCategoriesApi();
          setAllCategories(catRes.data || []);
        } catch (helperErr) {
          console.error("Failed to fetch helper profile:", helperErr);
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
      gender: userProfile?.role_id === 3 ? (helperProfile?.gender || "male") : (customerProfile?.gender || "male"),
      birthday: userProfile?.role_id === 3 ? (helperProfile?.birthday || "") : (customerProfile?.birthday || ""),
      note: customerProfile?.note || "",
      bio: helperProfile?.bio || "",
      experience_year: helperProfile?.experience_year ?? 0,
      address: helperProfile?.address || ""
    },
    enableReinitialize: true,
    validationSchema: getProfileInfoSchema(t),
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

        // 3. Update helper profile info if they are helper
        if (userProfile?.role_id === 3) {
          await updateHelperProfileApi({
            bio: values.bio,
            experience_year: Number(values.experience_year),
            gender: values.gender,
            birthday: values.birthday || undefined,
            address: values.address
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

  const handleAddSkill = async (serviceId: number) => {
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await addHelperSkillApi(serviceId);
      setSuccessMessage(t("Thêm kỹ năng thành công."));
      await fetchHelperSkills();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || t("Thêm kỹ năng thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveSkill = async (serviceId: number) => {
    if (!window.confirm(t("Bạn có chắc muốn xóa kỹ năng này không?"))) return;
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await removeHelperSkillApi(serviceId);
      setSuccessMessage(t("Xóa kỹ năng thành công."));
      await fetchHelperSkills();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || t("Xóa kỹ năng thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddWorkingArea = async (district: string, city: string) => {
    if (!district || !city) {
      setErrorMessage(t("Vui lòng điền đầy đủ Quận/Huyện và Tỉnh/Thành phố."));
      return;
    }
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await addHelperWorkingAreaApi({ district, city });
      setSuccessMessage(t("Thêm khu vực hoạt động thành công."));
      await fetchHelperWorkingAreas();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || t("Thêm khu vực hoạt động thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveWorkingArea = async (id: number) => {
    if (!window.confirm(t("Bạn có chắc muốn xóa khu vực hoạt động này không?"))) return;
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await removeHelperWorkingAreaApi(id);
      setSuccessMessage(t("Xóa khu vực hoạt động thành công."));
      await fetchHelperWorkingAreas();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || t("Xóa khu vực hoạt động thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  // Formik for Password Change
  const passwordForm = useFormik({
    initialValues: {
      password: "",
      confirmPassword: ""
    },
    validationSchema: getProfilePasswordSchema(t),
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
    validationSchema: getProfileAddressSchema(t),
    onSubmit: async (values, { resetForm }) => {
      setUpdating(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const isDuplicate = addresses.some((item) => {
          if (editingAddress && item.id === editingAddress.id) return false;
          return (
            item.address.trim().toLowerCase() === values.address.trim().toLowerCase() &&
            (item.district || "").trim().toLowerCase() === values.district.trim().toLowerCase() &&
            (item.city || "").trim().toLowerCase() === values.city.trim().toLowerCase()
          );
        });

        if (isDuplicate) {
          setErrorMessage(t("Địa chỉ này đã tồn tại trong sổ địa chỉ của bạn."));
          setUpdating(false);
          return;
        }

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
    helperProfile,
    addresses,
    helperSkills,
    helperWorkingAreas,
    allCategories,
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
    handleAvatarUpload,
    handleAddSkill,
    handleRemoveSkill,
    handleAddWorkingArea,
    handleRemoveWorkingArea
  };
};
