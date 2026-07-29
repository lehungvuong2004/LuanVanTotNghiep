import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogout } from "../../hooks/useLogout";
import { updateUser } from "../../redux/authSlice";
import { useToast } from "../../contexts/ToastContext";
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
  removeHelperWorkingAreaApi,
  submitHelperVerificationApi,
} from "../../api/profileApi/profile";

import type { UserProfile, CustomerProfile, CustomerAddress, HelperProfile } from "../../api/profileApi/profile";

import { getCategoriesApi, type ServiceCategory } from "../../api/servicesApi/services";

import { getProfileInfoSchema, getProfilePasswordSchema, getProfileAddressSchema } from "../../api/profileApi/validation";
import { ROLES } from "../../constants/roles";

export const useProfile = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Address dialog/modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Avatar uploading state
  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);

  // Upload user avatar file
  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const res = await uploadAvatarApi(file);
      profileForm.setFieldValue("avatar", res.url);
      if (userProfile) {
        const updated = { ...userProfile, avatar: res.url };
        setUserProfile(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        dispatch(updateUser(updated));
      }
      showToast("success", t("Thành công"), t("Tải ảnh đại diện lên thành công."));
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      showToast("error", t("Thất bại"), error?.response?.data?.message || t("Tải ảnh lên thất bại. Vui lòng thử lại."));
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
      if (user.role_id === ROLES.CUSTOMER) {
        try {
          const custRes = await getCustomerProfileApi();
          setCustomerProfile(custRes.data);
          setAddresses(custRes.data.addresses || []);
        } catch (custErr) {
          console.error("Failed to fetch customer profile:", custErr);
        }
      }

      // 3. Fetch Helper profile if user role is Helper (role_id = 3)
      if (user.role_id === ROLES.HELPER) {
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
        logout();
      } else {
        showToast("error", t("Thất bại"), t("Không thể tải thông tin profile. Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Formik for Personal Information
  const profileForm = useFormik({
    initialValues: {
      full_name: userProfile?.full_name || "",
      phone: userProfile?.phone || "",
      avatar: userProfile?.avatar || "",
      gender: userProfile?.role_id === 3 ? helperProfile?.gender || "male" : customerProfile?.gender || "male",
      birthday: userProfile?.role_id === 3 ? helperProfile?.birthday || "" : customerProfile?.birthday || "",
      note: customerProfile?.note || "",
      bio: helperProfile?.bio || "",
      experience_year: helperProfile?.experience_year ?? 0,
      address: helperProfile?.address || "",
    },
    enableReinitialize: true,
    validationSchema: getProfileInfoSchema(t),
    onSubmit: async (values) => {
      setUpdating(true);
      try {
        // 1. Update user account info
        const userUpdateRes = await updateProfileApi({
          full_name: values.full_name,
          phone: values.phone || undefined,
          avatar: values.avatar || undefined,
        });

        // Update local storage representation of the user
        const updatedUser = userUpdateRes.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        dispatch(updateUser(updatedUser));
        setUserProfile(updatedUser);

        // 2. Update customer profile info if they are customer
        if (userProfile?.role_id === 4) {
          await updateCustomerProfileApi({
            gender: values.gender,
            birthday: values.birthday || undefined,
            note: values.note || undefined,
          });
        }

        // 3. Update helper profile info if they are helper
        if (userProfile?.role_id === ROLES.HELPER) {
          await updateHelperProfileApi({
            bio: values.bio,
            experience_year: Number(values.experience_year),
            gender: values.gender,
            birthday: values.birthday || undefined,
            address: values.address,
          });
        }

        await fetchAllData();
        const msg = t("Cập nhật thông tin cá nhân thành công.");
        showToast("success", t("Thành công"), msg);
      } catch (error: any) {
        console.error("Update profile failed:", error);
        const msg = error?.response?.data?.message || t("Cập nhật thông tin thất bại. Vui lòng thử lại.");
        showToast("error", t("Thất bại"), msg);
      } finally {
        setUpdating(false);
      }
    },
  });

  const handleAddSkill = async (serviceId: number) => {
    if (helperSkills.length >= 3) {
      showToast("warning", t("Cảnh báo"), t("Bạn chỉ được chọn tối đa 3 kỹ năng."));
      return;
    }
    setUpdating(true);
    try {
      await addHelperSkillApi(serviceId);
      showToast("success", t("Thành công"), t("Thêm kỹ năng thành công."));
      await fetchHelperSkills();
      await fetchAllData();
    } catch (err: any) {
      showToast("error", t("Thất bại"), err?.response?.data?.message || t("Thêm kỹ năng thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveSkill = async (serviceId: number) => {
    if (!window.confirm(t("Bạn có chắc muốn xóa kỹ năng này không?"))) return;
    setUpdating(true);
    try {
      await removeHelperSkillApi(serviceId);
      showToast("success", t("Thành công"), t("Xóa kỹ năng thành công."));
      await fetchHelperSkills();
      await fetchAllData();
    } catch (err: any) {
      showToast("error", t("Thất bại"), err?.response?.data?.message || t("Xóa kỹ năng thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddWorkingArea = async (district: string, city: string) => {
    if (!district || !city) {
      showToast("warning", t("Cảnh báo"), t("Vui lòng điền đầy đủ Quận/Huyện và Tỉnh/Thành phố."));
      return;
    }
    setUpdating(true);
    try {
      await addHelperWorkingAreaApi({ district, city });
      showToast("success", t("Thành công"), t("Thêm khu vực hoạt động thành công."));
      await fetchHelperWorkingAreas();
    } catch (err: any) {
      showToast("error", t("Thất bại"), err?.response?.data?.message || t("Thêm khu vực hoạt động thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveWorkingArea = async (id: number) => {
    if (!window.confirm(t("Bạn có chắc muốn xóa khu vực hoạt động này không?"))) return;
    setUpdating(true);
    try {
      await removeHelperWorkingAreaApi(id);
      showToast("success", t("Thành công"), t("Xóa khu vực hoạt động thành công."));
      await fetchHelperWorkingAreas();
    } catch (err: any) {
      showToast("error", t("Thất bại"), err?.response?.data?.message || t("Xóa khu vực hoạt động thất bại."));
    } finally {
      setUpdating(false);
    }
  };

  // Formik for Password Change
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: getProfilePasswordSchema(t),
    onSubmit: async (values, { resetForm }) => {
      setUpdating(true);
      try {
        await updateProfileApi({
          current_password: values.currentPassword,
          password: values.password,
        });
        const msg = t("Thay đổi mật khẩu thành công.");
        showToast("success", t("Thành công"), msg);
        resetForm();
      } catch (error: any) {
        console.error("Change password failed:", error);
        const msg = error?.response?.data?.message || t("Đổi mật khẩu thất bại. Vui lòng thử lại.");
        showToast("error", t("Thất bại"), msg);
      } finally {
        setUpdating(false);
      }
    },
  });

  // Formik for Add/Edit Address
  const addressForm = useFormik({
    initialValues: {
      address: "",
      district: "",
      city: "",
      is_default: false,
    },
    enableReinitialize: true,
    validationSchema: getProfileAddressSchema(t),
    onSubmit: async (values, { resetForm }) => {
      setUpdating(true);
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
          const msg = t("Địa chỉ này đã tồn tại trong sổ địa chỉ của bạn.");
          showToast("warning", t("Cảnh báo"), msg);
          setUpdating(false);
          return;
        }

        if (editingAddress) {
          // Update address details
          await updateCustomerAddressApi(editingAddress.id, {
            address: values.address,
            district: values.district,
            city: values.city,
          });

          // If is_default changed to true, trigger the default patch
          if (values.is_default && editingAddress.is_default === 0) {
            await setDefaultCustomerAddressApi(editingAddress.id);
          }

          const msg = t("Cập nhật địa chỉ thành công.");
          showToast("success", t("Thành công"), msg);
        } else {
          // Create new address
          await addCustomerAddressApi({
            address: values.address,
            district: values.district,
            city: values.city,
            is_default: values.is_default,
          });
          const msg = t("Thêm địa chỉ mới thành công.");
          showToast("success", t("Thành công"), msg);
        }

        setIsAddressModalOpen(false);
        setEditingAddress(null);
        resetForm();
        await fetchAddresses();
      } catch (error: any) {
        console.error("Address operation failed:", error);
        const msg = error?.response?.data?.message || t("Lỗi thao tác địa chỉ. Vui lòng thử lại.");
        showToast("error", t("Thất bại"), msg);
      } finally {
        setUpdating(false);
      }
    },
  });

  // Open address modal in edit mode
  const handleEditAddressClick = (addressItem: CustomerAddress) => {
    setEditingAddress(addressItem);
    addressForm.setValues({
      address: addressItem.address,
      district: addressItem.district || "",
      city: addressItem.city || "",
      is_default: addressItem.is_default === 1,
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
    try {
      await deleteCustomerAddressApi(id);
      const msg = t("Xóa địa chỉ thành công.");
      showToast("success", t("Thành công"), msg);
      await fetchAddresses();
    } catch (err: any) {
      console.error("Failed to delete address:", err);
      const msg = err?.response?.data?.message || t("Xóa địa chỉ thất bại.");
      showToast("error", t("Thất bại"), msg);
    } finally {
      setUpdating(false);
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (id: number) => {
    setUpdating(true);
    try {
      await setDefaultCustomerAddressApi(id);
      const msg = t("Đã thay đổi địa chỉ mặc định.");
      showToast("success", t("Thành công"), msg);
      await fetchAddresses();
    } catch (err: any) {
      console.error("Failed to set default address:", err);
      const msg = err?.response?.data?.message || t("Đặt địa chỉ mặc định thất bại.");
      showToast("error", t("Thất bại"), msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitVerification = async () => {
    setUpdating(true);
    try {
      const res = await submitHelperVerificationApi();
      const msg = res.message || t("Nộp hồ sơ xét duyệt thành công.");
      showToast("success", t("Thành công"), msg);
      await fetchAllData();
    } catch (err: any) {
      console.error("Failed to submit verification:", err);
      const msg = err?.response?.data?.message || t("Nộp hồ sơ xét duyệt thất bại.");
      showToast("error", t("Thất bại"), msg);
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
    handleRemoveWorkingArea,
    handleSubmitVerification,
  };
};
