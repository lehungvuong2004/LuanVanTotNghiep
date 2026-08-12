import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useProfile } from "./useHook";
import { ROLES } from "../../constants/roles";
import { useGeolocation } from "../../hooks/useGeolocation";
import { parseVietnamAddress } from "../../types/location";
import { getRoleBadge, formatDate } from "../../utils";
import { ExpandToggleButton } from "../../components/ExpandToggleButton";

export const Profile = () => {
  const {
    t,
    activeTab,
    setActiveTab,
    loading,
    updating,
    userProfile,
    customerProfile,
    addresses,
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
    helperProfile,
    helperSkills,
    helperWorkingAreas,
    allCategories,
    handleAddSkill,
    handleRemoveSkill,
    handleAddWorkingArea,
    handleRemoveWorkingArea,
    handleSubmitVerification,
    handleUpgradeToHelper,
  } = useProfile();

  const [workingDistrict, setWorkingDistrict] = useState("");
  const [workingCity, setWorkingCity] = useState("");
  const [activeAddressDropdownId, setActiveAddressDropdownId] = useState<number | null>(null);
  const [geoTarget, setGeoTarget] = useState<"address" | "workingArea" | "residential" | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { getCurrentLocation, addressDetails, address: rawAddress, loading: geoLoading, error: geoError, clearLocation } = useGeolocation();

  const getGenderText = () => {
    const gender = userProfile?.role_id === ROLES.HELPER ? helperProfile?.gender : customerProfile?.gender;
    if (!gender) return null;
    if (gender === "male") return t("Nam");
    if (gender === "female") return t("Nữ");
    if (gender === "other") return t("Khác");
    return gender;
  };

  const getGenderIcon = () => {
    const gender = userProfile?.role_id === ROLES.HELPER ? helperProfile?.gender : customerProfile?.gender;

    if (gender === "male") return "ph:gender-male-bold";
    if (gender === "female") return "ph:gender-female-bold";
    return "ph:gender-neuter-bold";
  };

  const getBirthdayText = () => {
    const birthday = userProfile?.role_id === ROLES.HELPER ? helperProfile?.birthday : customerProfile?.birthday;

    if (!birthday) return null;
    return formatDate(birthday);
  };

  useEffect(() => {
    if ((addressDetails || rawAddress) && geoTarget) {
      const parsed = parseVietnamAddress(addressDetails, rawAddress);

      Promise.resolve().then(() => {
        if (geoTarget === "address") {
          addressForm.setFieldValue("address", parsed.specificAddress);
          addressForm.setFieldValue("district", parsed.district);
          addressForm.setFieldValue("city", parsed.city);
        } else if (geoTarget === "workingArea") {
          setWorkingDistrict(parsed.district);
          setWorkingCity(parsed.city);
        } else if (geoTarget === "residential") {
          const fullAddr = [parsed.specificAddress, parsed.district, parsed.city].filter((val) => val && val.trim() !== "").join(", ");
          profileForm.setFieldValue("address", fullAddr);
        }
        setGeoTarget(null);
        clearLocation();
      });
    }
  }, [addressDetails, rawAddress, geoTarget, addressForm, profileForm, clearLocation]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="line-md:loading-twotone-loop" className="text-5xl text-teal-600 dark:text-teal-400" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t("Đang tải thông tin hồ sơ...")}</p>
        </div>
      </div>
    );
  }

  // 1. RENDER HEADER (TITLE & DESCRIPTION)
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">{t("Hồ sơ cá nhân")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("Quản lý thông tin cá nhân, địa chỉ liên hệ và bảo mật tài khoản.")}</p>
      </div>
    </div>
  );

  // 2. RENDER STATUS ALERTS
  const renderAlerts = () => null;

  // 3. RENDER PROFILE CARD (LEFT COLUMN SUMMARY)
  const renderProfileCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-6 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-teal-600 to-[#034d54] dark:from-teal-900 dark:to-slate-800"></div>

      <div className="relative z-10 mt-6 mb-4 flex flex-col items-center">
        <div className="relative">
          <img
            src={userProfile?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
            alt="User Avatar"
            className={`w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-700 ${avatarUploading ? "opacity-40 blur-xs" : ""}`}
          />
          {avatarUploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40">
              <Icon icon="line-md:loading-twotone-loop" className="text-2xl text-white" />
            </div>
          ) : (
            <label className="absolute bottom-0 right-0 p-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white rounded-full shadow-md cursor-pointer transition-all hover:scale-110">
              <Icon icon="solar:camera-bold" className="text-base" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarUpload(e.target.files[0]);
                  }
                }}
                disabled={avatarUploading}
              />
            </label>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{userProfile?.full_name}</h2>

      {userProfile?.role_id === ROLES.HELPER && helperProfile && (
        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">
          {helperProfile.experience_year} {t("năm kinh nghiệm")}
        </p>
      )}

      <p className="text-sm text-slate-950 dark:text-slate-305 mt-1 break-all px-2 font-medium">{userProfile?.email}</p>

      <div className="mt-4 flex flex-col items-center gap-2">
        {/* Row 1: Role & Gender */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {getRoleBadge(userProfile?.role_id)}
          {getGenderText() && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-50 dark:bg-slate-900/50 text-slate-955 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 whitespace-nowrap flex items-center gap-1">
              <Icon icon={getGenderIcon()} className="text-sm shrink-0 text-slate-500 dark:text-slate-400" />
              {getGenderText()}
            </span>
          )}
        </div>

        {/* Row 2: Birthday */}
        {getBirthdayText() && (
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-50 dark:bg-slate-900/50 text-slate-955 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 whitespace-nowrap flex items-center gap-1">
            <Icon icon="solar:calendar-bold" className="text-sm shrink-0 text-slate-500 dark:text-slate-400" />
            {getBirthdayText()}
          </span>
        )}
      </div>

      <div className="w-full border-t border-slate-100 dark:border-slate-700/60 my-6"></div>

      <div className="w-full flex justify-center text-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">{t("Trạng thái tài khoản")}</span>
          {userProfile?.role_id === ROLES.HELPER ? (
            (() => {
              const status = helperProfile?.status || "pending";
              let text = t("Chờ xét duyệt");
              let colorClass = "text-amber-600 dark:text-amber-400";
              let bgDot = "bg-amber-500";
              if (status === "active") {
                text = t("Hoạt động");
                colorClass = "text-emerald-600 dark:text-emerald-400";
                bgDot = "bg-emerald-500";
              } else if (status === "rejected") {
                text = t("Bị từ chối");
                colorClass = "text-rose-600 dark:text-rose-455";
                bgDot = "bg-rose-500";
              } else if (status === "suspended") {
                text = t("Tạm khóa");
                colorClass = "text-red-600 dark:text-red-500";
                bgDot = "bg-red-500";
              }
              return (
                <span className={`text-sm font-bold capitalize mt-1 flex items-center gap-1.5 ${colorClass}`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${bgDot}`}></span>
                  {text}
                </span>
              );
            })()
          ) : (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 capitalize mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t("Hoạt động")}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // 4. RENDER SIDEBAR NAVIGATION (TAB TRIGGERS)
  const renderSidebarNavigation = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-3">
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => setActiveTab("info")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
            activeTab === "info" ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon icon="mingcute:profile-fill" className="text-2xl" />
            <span>{t("Thông tin cá nhân")}</span>
          </div>
          <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "info" ? "translate-x-1" : "opacity-0"}`} />
        </button>

        {userProfile?.role_id === ROLES.CUSTOMER && (
          <>
            <button
              onClick={() => setActiveTab("address")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "address" ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon icon="mdi:location" className="text-2xl" />
                <span>{t("Sổ địa chỉ")}</span>
              </div>
              <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "address" ? "translate-x-1" : "opacity-0"}`} />
            </button>
            <button
              onClick={() => setActiveTab("upgrade_helper" as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "upgrade_helper" ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon icon="solar:shield-up-bold-duotone" className="text-2xl" />
                <span>{t("Đăng ký Người giúp việc")}</span>
              </div>
              <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "upgrade_helper" ? "translate-x-1" : "opacity-0"}`} />
            </button>
          </>
        )}

        {userProfile?.role_id === ROLES.HELPER && (
          <>
            <button
              onClick={() => setActiveTab("working_areas")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "working_areas" ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon icon="solar:map-point-bold-duotone" className="text-2xl" />
                <span>{t("Khu vực hoạt động")}</span>
              </div>
              <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "working_areas" ? "translate-x-1" : "opacity-0"}`} />
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("password")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
            activeTab === "password" ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon icon="mdi:password" className="text-2xl" />
            <span>{t("Đổi mật khẩu")}</span>
          </div>
          <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "password" ? "translate-x-1" : "opacity-0"}`} />
        </button>
      </nav>
    </div>
  );

  // 5. RENDER PERSONAL INFORMATION TAB FORM
  const renderProfileInfoTab = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-6 md:p-8 transition-all duration-300">
      <h3 className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">{t("Thông tin cá nhân")}</h3>

      <form onSubmit={profileForm.handleSubmit} className="space-y-6">
        {/* Info Grid (Email, Name, Phone) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-950 dark:text-slate-300 mb-2">{t("Địa chỉ Email")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="solar:letter-bold" className="text-lg" />
              </div>
              <input
                type="email"
                disabled
                className="pl-10 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-950/80 cursor-not-allowed font-medium"
                value={userProfile?.email || ""}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">{t("Email định danh không thể thay đổi.")}</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-950 dark:text-slate-300 mb-2">
              {t("Họ và tên")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="solar:user-bold" className="text-lg" />
              </div>
              <input
                type="text"
                name="full_name"
                className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-950 dark:text-white transition-colors ${
                  profileForm.touched.full_name && profileForm.errors.full_name
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                }`}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                value={profileForm.values.full_name}
              />
            </div>
            {profileForm.touched.full_name && profileForm.errors.full_name && <div className="text-red-500 text-xs mt-1">{profileForm.errors.full_name}</div>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-950 dark:text-slate-300 mb-2">{t("Số điện thoại")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="solar:phone-bold" className="text-lg" />
              </div>
              <input
                type="text"
                name="phone"
                placeholder="e.g. 0912345678"
                className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-950 dark:text-white transition-colors ${
                  profileForm.touched.phone && profileForm.errors.phone
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                }`}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                value={profileForm.values.phone}
              />
            </div>
            {profileForm.touched.phone && profileForm.errors.phone && <div className="text-red-500 text-xs mt-1">{profileForm.errors.phone}</div>}
          </div>
        </div>

        {/* Customer Extended Info (Gender, Birthday, Note) */}
        {userProfile?.role_id === ROLES.CUSTOMER && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">{t("Thông tin mở rộng")}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-950 dark:text-slate-300 mb-2">{t("Giới tính")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {["male", "female", "other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => profileForm.setFieldValue("gender", g)}
                      className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
                        profileForm.values.gender === g
                          ? "border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-950 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                      }`}
                    >
                      <Icon icon={g === "male" ? "ph:gender-male-bold" : g === "female" ? "ph:gender-female-bold" : "ph:gender-neuter-bold"} className="text-lg" />
                      {g === "male" ? t("Nam") : g === "female" ? t("Nữ") : t("Khác")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-semibold text-slate-950 dark:text-slate-300 mb-2">{t("Ngày sinh")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon icon="solar:calendar-bold" className="text-lg" />
                  </div>
                  <input
                    type="date"
                    name="birthday"
                    className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-950 dark:text-white transition-colors ${
                      profileForm.touched.birthday && profileForm.errors.birthday
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    }`}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    value={profileForm.values.birthday}
                  />
                </div>
                {profileForm.touched.birthday && profileForm.errors.birthday && <div className="text-red-500 text-xs mt-1">{profileForm.errors.birthday}</div>}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-slate-950 dark:text-slate-300 mb-2">{t("Ghi chú cá nhân")}</label>
              <div className="relative">
                <textarea
                  name="note"
                  rows={3}
                  placeholder={t("Mô tả ghi chú về sở thích dọn dẹp hoặc yêu cầu đặc biệt...")}
                  className={`w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-950 dark:text-white transition-colors resize-none ${
                    profileForm.touched.note && profileForm.errors.note
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={profileForm.handleChange}
                  onBlur={profileForm.handleBlur}
                  value={profileForm.values.note}
                />
              </div>
              {profileForm.touched.note && profileForm.errors.note && <div className="text-red-500 text-xs mt-1">{profileForm.errors.note}</div>}
            </div>
          </div>
        )}

        {/* Helper Extended Info (Gender, Birthday, Experience Year, Address, Bio) */}
        {userProfile?.role_id === ROLES.HELPER && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-955 dark:text-white uppercase tracking-wider">{t("Thông tin mở rộng cho Người giúp việc")}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-955 dark:text-slate-350 mb-2">
                  {t("Giới tính")} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["male", "female", "other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => profileForm.setFieldValue("gender", g)}
                      className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
                        profileForm.values.gender === g
                          ? "border-teal-500 bg-teal-50 text-teal-650 dark:bg-teal-950/20 dark:text-teal-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-955 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                      }`}
                    >
                      <Icon icon={g === "male" ? "ph:gender-male-bold" : g === "female" ? "ph:gender-female-bold" : "ph:gender-neuter-bold"} className="text-lg" />
                      {g === "male" ? t("Nam") : g === "female" ? t("Nữ") : t("Khác")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-semibold text-slate-955 dark:text-slate-300 mb-2">
                  {t("Ngày sinh")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon icon="solar:calendar-bold" className="text-lg" />
                  </div>
                  <input
                    type="date"
                    name="birthday"
                    className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white transition-colors ${
                      profileForm.touched.birthday && profileForm.errors.birthday
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    }`}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    value={profileForm.values.birthday}
                  />
                </div>
                {profileForm.touched.birthday && profileForm.errors.birthday && <div className="text-red-500 text-xs mt-1">{profileForm.errors.birthday}</div>}
              </div>

              {/* Experience Year */}
              <div>
                <label className="block text-sm font-semibold text-slate-955 dark:text-slate-300 mb-2">{t("Kinh nghiệm (Năm)")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon icon="solar:ranking-bold" className="text-lg" />
                  </div>
                  <input
                    type="number"
                    name="experience_year"
                    min={0}
                    className="pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    value={profileForm.values.experience_year}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-955 dark:text-slate-350">
                    {t("Địa chỉ cư trú hiện tại")} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setGeoTarget("residential");
                      getCurrentLocation();
                    }}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 bg-teal-50 text-teal-650 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/30 dark:border-teal-900/50 py-1 px-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {geoLoading && geoTarget === "residential" ? <Icon icon="line-md:loading-twotone-loop" className="text-xs animate-spin" /> : <Icon icon="solar:gps-bold" className="text-xs" />}
                    {t("Định vị")}
                  </button>
                </div>
                {geoError && geoTarget === "residential" && <p className="text-red-500 text-xs font-semibold mb-2 text-right">{geoError}</p>}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon icon="solar:map-point-bold" className="text-lg" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. 123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                    className="pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    value={profileForm.values.address}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{t("Địa chỉ nhà ở của bạn dùng để đối chiếu hồ sơ, xác minh thông tin cá nhân.")}</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-955 dark:text-slate-300 mb-2">
                {t("Giới thiệu bản thân")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  name="bio"
                  rows={3}
                  placeholder={t("Mô tả kỹ năng, thế mạnh, thái độ làm việc của bạn...")}
                  className="w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white transition-colors resize-none border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  onChange={profileForm.handleChange}
                  onBlur={profileForm.handleBlur}
                  value={profileForm.values.bio}
                />
              </div>
            </div>

            {/* Professional Skills block inside the same tab! */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/60">
              <h4 className="text-sm font-bold text-slate-955 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Icon icon="solar:star-ring-bold-duotone" className="text-teal-600 dark:text-teal-400 text-lg" />
                {t("Kỹ năng chuyên môn")}{" "}
                <span className="text-xs text-slate-400 font-normal">
                  ({t("Tối đa 3 kỹ năng, hiện tại:")} {helperSkills.length}/3)
                </span>
              </h4>

              <div>
                <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">{t("Kỹ năng hiện tại của bạn (kỹ năng đầu tiên là kỹ năng chính)")}</h5>
                {helperSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {helperSkills.map((sk, idx) => (
                      <div
                        key={sk.id}
                        className="flex items-center gap-2 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/50 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all animate-fade-in"
                      >
                        {idx === 0 && (
                          <span title={t("Kỹ năng chính")}>
                            <Icon icon="solar:star-bold" className="text-amber-500 text-sm" />
                          </span>
                        )}
                        <span>{sk.service?.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk.service_id)}
                          className="w-4 h-4 rounded-full bg-teal-200/50 hover:bg-red-200 dark:bg-teal-900/50 dark:hover:bg-red-950/50 flex items-center justify-center text-teal-800 dark:text-teal-300 hover:text-red-650 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title={t("Xóa kỹ năng")}
                        >
                          <Icon icon="solar:close-circle-bold" className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 rounded-2xl border border-amber-200/30 dark:border-amber-900/30 text-xs font-medium">
                    {t("Bạn chưa chọn kỹ năng nào. Vui lòng thêm các dịch vụ bạn có thể làm bên dưới.")}
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">{t("Thêm kỹ năng mới")}</h5>
                <div className="space-y-6">
                  {(() => {
                    const activeCategories = allCategories.filter((category) => category.services && category.services.length > 0);
                    const displayedCategories = showAllCategories ? activeCategories : activeCategories.slice(0, 4);

                    return (
                      <>
                        {displayedCategories.map((category) => (
                          <div key={category.id} className="border-b border-slate-100 dark:border-slate-700/40 pb-4 last:border-0 last:pb-0">
                            <h6 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">{category.name}</h6>
                            <div className="flex flex-wrap gap-2.5">
                              {category.services?.map((svc) => {
                                const isAdded = helperSkills.some((sk) => sk.service_id === svc.id);
                                return (
                                  <button
                                    key={svc.id}
                                    type="button"
                                    onClick={() => (isAdded ? handleRemoveSkill(svc.id) : handleAddSkill(svc.id))}
                                    disabled={updating}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isAdded
                                        ? "border-teal-500 bg-teal-50 text-teal-600 dark:border-teal-500 dark:bg-teal-950/30 dark:text-teal-400"
                                        : "border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                    }`}
                                  >
                                    <Icon icon={isAdded ? "solar:check-circle-bold" : "solar:add-circle-bold"} className="text-sm" />
                                    {svc.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {activeCategories.length > 4 && (
                          <div className="flex justify-center pt-2">
                            <ExpandToggleButton isExpanded={showAllCategories} onClick={() => setShowAllCategories(!showAllCategories)} />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-teal-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {updating ? <Icon icon="line-md:loading-twotone-loop" className="text-lg" /> : <Icon icon="solar:diskette-bold" className="text-lg" />}
            {t("Lưu thay đổi")}
          </button>
        </div>
      </form>
    </div>
  );

  // 6. RENDER CUSTOMER ADDRESS LIST TAB
  const renderAddressTab = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-6 md:p-8 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">
        <h3 className="text-lg font-bold text-slate-850 dark:text-white">{t("Sổ địa chỉ")}</h3>
        <button
          onClick={handleAddAddressClick}
          className="flex items-center gap-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/30 dark:border-teal-900/50 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
        >
          <Icon icon="solar:add-circle-bold" className="text-lg" />
          {t("Thêm địa chỉ")}
        </button>
      </div>

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((addressItem) => (
            <div
              key={addressItem.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-4 ${
                addressItem.is_default === 1
                  ? "border-teal-500/60 bg-teal-50/10 dark:bg-teal-950/5"
                  : "border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${addressItem.is_default === 1 ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}
                >
                  <Icon icon="mdi:location" className="text-2xl" />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">{addressItem.address}</span>
                    {addressItem.is_default === 1 && (
                      <span className="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50 rounded-md text-xs font-extrabold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                        {t("Mặc định")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {addressItem.district ? (typeof addressItem.district === "object" ? (addressItem.district as any).name : addressItem.district) : ""},{" "}
                    {addressItem.city ? (typeof addressItem.city === "object" ? (addressItem.city as any).name : addressItem.city) : ""}
                  </p>
                </div>
              </div>

              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAddressDropdownId(activeAddressDropdownId === addressItem.id ? null : addressItem.id);
                  }}
                  title={t("Thêm tùy chọn")}
                  className="p-2 rounded-full text-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Icon icon="ri:more-fill" className="text-xl" />
                </button>

                {activeAddressDropdownId === addressItem.id && (
                  <>
                    {/* Invisible overlay window click detector */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAddressDropdownId(null);
                      }}
                    />
                    {/* Dropdown popup */}
                    <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 py-1.5 z-20 animate-fade-in text-black dark:text-white">
                      {addressItem.is_default === 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAddressDropdownId(null);
                            handleSetDefaultAddress(addressItem.id);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                        >
                          <Icon icon="solar:star-bold" className="text-sm text-yellow-550" />
                          <span>{t("Đặt làm mặc định")}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAddressDropdownId(null);
                          handleEditAddressClick(addressItem);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Icon icon="solar:pen-bold" className="text-sm text-black dark:text-white" />
                        <span>{t("Chỉnh sửa")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAddressDropdownId(null);
                          handleDeleteAddress(addressItem.id);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="text-sm text-red-650 dark:text-red-400" />
                        <span>{t("Xóa")}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
            <Icon icon="solar:streets-map-point-broken" className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Bạn chưa lưu địa chỉ nào.")}</p>
            <button
              onClick={handleAddAddressClick}
              className="mt-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-sm"
            >
              {t("Thêm địa chỉ ngay")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 7. RENDER PASSWORD CHANGE FORM TAB
  const renderPasswordTab = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-6 md:p-8 transition-all duration-300">
      <h3 className="text-lg font-bold text-slate-955 dark:text-white border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">{t("Đổi mật khẩu tài khoản")}</h3>

      <form onSubmit={passwordForm.handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-955 dark:text-slate-300 mb-2">
            {t("Mật khẩu hiện tại")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon icon="solar:lock-bold" className="text-lg" />
            </div>
            <input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white transition-colors ${
                passwordForm.touched.currentPassword && passwordForm.errors.currentPassword
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              }`}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              value={passwordForm.values.currentPassword}
            />
          </div>
          {passwordForm.touched.currentPassword && passwordForm.errors.currentPassword && <div className="text-red-500 text-xs mt-1">{passwordForm.errors.currentPassword}</div>}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-955 dark:text-slate-300 mb-2">
            {t("Mật khẩu mới")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon icon="solar:lock-keyhole-bold" className="text-lg" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white transition-colors ${
                passwordForm.touched.password && passwordForm.errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              }`}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              value={passwordForm.values.password}
            />
          </div>
          {passwordForm.touched.password && passwordForm.errors.password && <div className="text-red-500 text-xs mt-1">{passwordForm.errors.password}</div>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-955 dark:text-slate-300 mb-2">
            {t("Nhập lại mật khẩu mới")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon icon="solar:shield-check-bold" className="text-lg" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white transition-colors ${
                passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              }`}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              value={passwordForm.values.confirmPassword}
            />
          </div>
          {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && <div className="text-red-500 text-xs mt-1">{passwordForm.errors.confirmPassword}</div>}
        </div>

        {/* Guidelines */}
        <div className="bg-[#EEF2FF] dark:bg-indigo-500/10 rounded-2xl p-4 border border-indigo-100/10 dark:border-indigo-500/20">
          <div className="flex items-start gap-2 text-sm text-indigo-900 dark:text-indigo-300 mb-2">
            <Icon icon="solar:info-circle-bold-duotone" className="text-lg shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold">{t("Yêu cầu độ bảo mật của mật khẩu mới:")}</span>
          </div>
          <ul className="text-xs text-indigo-800 dark:text-indigo-300 list-disc list-inside space-y-1 ml-6">
            <li>{t("Có độ dài từ 6 đến 32 ký tự")}</li>
            <li>{t("Chứa ít nhất 1 chữ cái in hoa (A-Z)")}</li>
            <li>{t("Chứa ít nhất 1 chữ cái in thường (a-z)")}</li>
            <li>{t("Chứa ít nhất 1 chữ số (0-9)")}</li>
            <li>{t("Không chứa khoảng trắng")}</li>
          </ul>
        </div>

        {/* Form Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="bg-[#B2451C] hover:bg-orange-800 dark:bg-orange-600 dark:hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {updating ? <Icon icon="line-md:loading-twotone-loop" className="text-lg" /> : <Icon icon="solar:key-bold" className="text-lg" />}
            {t("Đổi mật khẩu")}
          </button>
        </div>
      </form>
    </div>
  );

  // 9. RENDER UPGRADE TO HELPER CONSENT TAB
  const renderUpgradeHelperTab = () => (
    <div className="transition-all duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-900 p-6 md:p-8 text-white mb-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 bg-white/20 rounded-xl">
              <Icon icon="solar:shield-up-bold-duotone" className="text-2xl" />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase opacity-90">{t("Cơ hội gia nhập đội ngũ")}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            {t("Trở thành cộng tác viên giúp việc")}
          </h3>
          <p className="text-sm font-medium opacity-90 max-w-xl leading-relaxed">
            {t("Kiếm thêm thu nhập ổn định lên tới 15.000.000đ/tháng với thời gian làm việc linh hoạt, hoàn toàn do bạn chủ động quyết định.")}
          </p>
        </div>
      </div>

      <h4 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <Icon icon="solar:info-circle-bold-duotone" className="text-teal-600 dark:text-teal-400 text-lg" />
        {t("Quy trình 4 Bước chuẩn hóa hồ sơ")}
      </h4>

      {/* 4 Steps Visual Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="h-full bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-3">1</span>
          <div className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">{t("Nâng cấp vai trò")}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-normal">{t("Xác nhận chuyển đổi tài khoản thành Người làm")}</p>
        </div>
        <div className="h-full bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-3">2</span>
          <div className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">{t("Hoàn thiện hồ sơ")}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-normal">{t("Thêm kỹ năng, địa bàn nhận việc, cập nhật lý lịch")}</p>
        </div>
        <div className="h-full bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-3">3</span>
          <div className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">{t("Kiểm duyệt")}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-normal">{t("Ban quản lý kiểm tra đối chiếu thông tin nộp xác minh")}</p>
        </div>
        <div className="h-full bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-3">4</span>
          <div className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">{t("Hoạt động")}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-normal">{t("Bắt đầu nhận lịch giúp việc và kiếm thu nhập")}</p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-4 rounded-2xl border border-amber-200/30 dark:border-amber-900/30 text-xs leading-relaxed mb-8 flex gap-3">
        <Icon icon="solar:danger-triangle-bold-duotone" className="text-xl text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-1">{t("Lưu ý quan trọng:")}</span>
          {t("Sau khi nâng cấp, giao diện tài khoản của bạn sẽ chuyển sang chế độ Người làm. Bạn vẫn có thể đặt dịch vụ khác khi cần, nhưng hồ sơ thợ của bạn cần được hoàn thiện và được Admin phê duyệt mới có thể bắt đầu nhận lịch.")}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("Bạn có chắc chắn muốn nâng cấp tài khoản của mình thành Người giúp việc không?"))) {
              handleUpgradeToHelper();
            }
          }}
          disabled={updating}
          className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-teal-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {updating ? <Icon icon="line-md:loading-twotone-loop" className="text-lg" /> : <Icon icon="solar:verified-check-bold" className="text-lg" />}
          {t("Xác nhận Đăng ký ngay")}
        </button>
      </div>
    </div>
  );

  // 8. RENDER ADDRESS DIALOG MODAL
  const renderAddressModal = () => {
    if (!isAddressModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsAddressModalOpen(false)}></div>

        <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-700 animate-scale-up">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">{editingAddress ? t("Chỉnh sửa địa chỉ") : t("Thêm địa chỉ mới")}</h3>
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Icon icon="solar:close-circle-bold" className="text-xl" />
            </button>
          </div>

          <form onSubmit={addressForm.handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Geolocation Autocomplete Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setGeoTarget("address");
                    getCurrentLocation();
                  }}
                  disabled={geoLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/80 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shadow-xs hover:scale-[1.01] disabled:opacity-50"
                >
                  {geoLoading && geoTarget === "address" ? <Icon icon="line-md:loading-twotone-loop" className="text-lg animate-spin" /> : <Icon icon="solar:gps-linear" className="text-lg" />}
                  {t("Định vị vị trí hiện tại của tôi")}
                </button>
                {geoError && geoTarget === "address" && <p className="text-red-500 text-xs font-semibold mt-1.5 text-center">{geoError}</p>}
              </div>

              {/* Address detail */}
              <div>
                <label className="block text-xs font-bold text-slate-955 dark:text-slate-300 mb-1.5">
                  {t("Địa chỉ chi tiết (Số nhà, đường...)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder={t("Ví dụ: 123 Nguyễn Huệ")}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white ${
                    addressForm.touched.address && addressForm.errors.address
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={addressForm.handleChange}
                  onBlur={addressForm.handleBlur}
                  value={addressForm.values.address}
                />
                {addressForm.touched.address && addressForm.errors.address && <div className="text-red-500 text-xs mt-1">{addressForm.errors.address}</div>}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-955 dark:text-slate-300 mb-1.5">
                  {t("Quận / Huyện")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder={t("Ví dụ: Quận 1")}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white ${
                    addressForm.touched.district && addressForm.errors.district
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={addressForm.handleChange}
                  onBlur={addressForm.handleBlur}
                  value={addressForm.values.district}
                />
                {addressForm.touched.district && addressForm.errors.district && <div className="text-red-500 text-xs mt-1">{addressForm.errors.district}</div>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-955 dark:text-slate-300 mb-1.5">
                  {t("Tỉnh / Thành phố")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder={t("Ví dụ: TP. Hồ Chí Minh")}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white ${
                    addressForm.touched.city && addressForm.errors.city
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={addressForm.handleChange}
                  onBlur={addressForm.handleBlur}
                  value={addressForm.values.city}
                />
                {addressForm.touched.city && addressForm.errors.city && <div className="text-red-500 text-xs mt-1">{addressForm.errors.city}</div>}
              </div>

              {/* Default checkbox */}
              {(!editingAddress || editingAddress.is_default === 0) && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 focus:ring-2 accent-teal-650 cursor-pointer"
                    onChange={addressForm.handleChange}
                    checked={addressForm.values.is_default}
                  />
                  <label htmlFor="is_default" className="text-xs font-medium text-slate-650 dark:text-slate-400 cursor-pointer select-none">
                    {t("Đặt làm địa chỉ liên hệ mặc định")}
                  </label>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t("Hủy")}
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {updating && <Icon icon="line-md:loading-twotone-loop" className="text-sm" />}
                {editingAddress ? t("Lưu thay đổi") : t("Tạo mới")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 10. RENDER HELPER WORKING AREAS TAB
  const renderWorkingAreasTab = () => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-6 md:p-8 transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-2">{t("Khu vực hoạt động")}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {t("Chọn các Quận/Huyện và Tỉnh/Thành phố nơi bạn sẵn sàng di chuyển đến để nhận công việc. Khách hàng sẽ tìm thấy bạn dựa trên danh sách này.")}
        </p>

        <div className="mb-8">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t("Khu vực đang hoạt động")}</h4>
          {helperWorkingAreas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {helperWorkingAreas.map((wa) => (
                <div key={wa.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Icon icon="solar:map-point-bold-duotone" className="text-xl text-teal-550" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {wa.district ? (typeof wa.district === "object" ? (wa.district as any).name : wa.district) : ""}, {wa.city ? (typeof wa.city === "object" ? (wa.city as any).name : wa.city) : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveWorkingArea(wa.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title={t("Xóa khu vực")}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 rounded-2xl border border-amber-200/30 dark:border-amber-900/30 text-xs font-medium">
              {t("Bạn chưa chọn khu vực hoạt động nào. Hãy thêm khu vực bạn có thể hỗ trợ dọn dẹp bên dưới.")}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("Thêm khu vực hoạt động mới")}</h4>
            <button
              type="button"
              onClick={() => {
                setGeoTarget("workingArea");
                getCurrentLocation();
              }}
              disabled={geoLoading}
              className="flex items-center gap-1.5 bg-teal-50 text-teal-650 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/30 dark:border-teal-900/50 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {geoLoading && geoTarget === "workingArea" ? <Icon icon="line-md:loading-twotone-loop" className="text-sm animate-spin" /> : <Icon icon="solar:gps-bold" className="text-sm" />}
              {t("Định vị vị trí")}
            </button>
          </div>
          {geoError && geoTarget === "workingArea" && <p className="text-red-500 text-xs font-semibold mb-2">{geoError}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddWorkingArea(workingDistrict, workingCity);
              setWorkingDistrict("");
              setWorkingCity("");
            }}
            className="space-y-4 max-w-md"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-955 dark:text-slate-300 mb-1.5">
                  {t("Quận / Huyện")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder={t("Ví dụ: Quận 1")}
                  required
                  value={workingDistrict}
                  onChange={(e) => setWorkingDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white outline-none text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-955 dark:text-slate-300 mb-1.5">
                  {t("Tỉnh / Thành phố")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder={t("Ví dụ: TP. Hồ Chí Minh")}
                  required
                  value={workingCity}
                  onChange={(e) => setWorkingCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-955 dark:text-white outline-none text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updating}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {updating ? <Icon icon="line-md:loading-twotone-loop" className="text-sm" /> : <Icon icon="solar:add-circle-bold" className="text-sm" />}
                {t("Thêm khu vực")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render Helper verification status & submission card
  const renderHelperVerificationWidget = () => {
    const status = helperProfile ? helperProfile.status : "new";

    // Check missing items
    const missingItems = [];
    if (!helperProfile?.bio || helperProfile.bio.trim() === "") {
      missingItems.push(t("Giới thiệu bản thân"));
    }
    if (!helperProfile?.gender) {
      missingItems.push(t("Giới tính"));
    }
    if (!helperProfile?.birthday) {
      missingItems.push(t("Ngày sinh"));
    }
    if (!helperProfile?.address || helperProfile.address.trim() === "") {
      missingItems.push(t("Địa chỉ cư trú"));
    }
    if (helperSkills.length === 0) {
      missingItems.push(t("Kỹ năng chuyên môn"));
    }
    if (helperWorkingAreas.length === 0) {
      missingItems.push(t("Khu vực hoạt động"));
    }



    // Get latest verification note
    const latestVerification = helperProfile?.verifications && helperProfile.verifications.length > 0 ? [...helperProfile.verifications].sort((a: any, b: any) => b.id - a.id)[0] : null;

    if (status === "active") {
      return (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <Icon icon="solar:verified-check-bold-duotone" className="text-3xl" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{t("Hồ sơ đã hoạt động")}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("Hồ sơ người giúp việc của bạn đã được duyệt và kích hoạt thành công. Bạn đã có thể nhận các lịch đặt dịch vụ từ khách hàng trên hệ thống.")}
            </p>
          </div>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
            <Icon icon="solar:hourglass-line-dynamic-bold-duotone" className="text-3xl animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{t("Hồ sơ đang chờ xét duyệt")}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("Thông tin hồ sơ và kỹ năng của bạn đang được nhân viên vận hành (Operator) kiểm tra. Vui lòng chờ phản hồi trong vòng 24h làm việc.")}
            </p>
          </div>
        </div>
      );
    }

    if (status === "suspended") {
      return (
        <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-red-500/10 text-red-650 dark:text-red-400 rounded-2xl shrink-0">
            <Icon icon="solar:shield-close-bold-duotone" className="text-3xl" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-1">{t("Tài khoản đang bị tạm ngưng")}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              {t("Hồ sơ của bạn đã bị khóa tạm thời bởi ban quản lý. Vui lòng liên hệ Operator để giải quyết thắc mắc.")}
            </p>
            {latestVerification?.note && (
              <div className="bg-white/40 dark:bg-slate-900/40 border border-red-200/50 dark:border-red-950/50 p-3 rounded-xl text-xs text-red-650 dark:text-red-400 italic">
                <strong>{t("Ghi chú vận hành:")} </strong>"{latestVerification.note}"
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 flex flex-col gap-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${status === "rejected" ? "bg-rose-500/10 text-rose-600 dark:text-rose-450" : "bg-teal-500/10 text-teal-600 dark:text-teal-400"}`}>
            <Icon icon={status === "rejected" ? "solar:shield-warning-bold-duotone" : "solar:cloud-upload-bold-duotone"} className="text-3xl" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{status === "rejected" ? t("Hồ sơ bị từ chối xét duyệt") : t("Nộp hồ sơ xét duyệt")}</h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              {status === "rejected"
                ? t("Hồ sơ của bạn đã bị từ chối phê duyệt. Vui lòng cập nhật các thông tin thiếu sót dưới đây và gửi lại yêu cầu xét duyệt.")
                : t("Bạn cần gửi hồ sơ thông tin và kỹ năng của mình cho nhân viên vận hành (Operator) phê duyệt trước khi có thể hiển thị trên ứng dụng và nhận lịch đặt.")}
            </p>

            {status === "rejected" && latestVerification?.note && (
              <div className="mt-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-3 rounded-xl text-xs text-rose-700 dark:text-rose-400 italic">
                <strong>{t("Lý do từ chối:")} </strong>"{latestVerification.note}"
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4">
          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">{t("Danh sách điều kiện cần hoàn thiện:")}</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Icon icon={helperProfile?.bio ? "solar:check-circle-bold" : "solar:close-circle-bold"} className={helperProfile?.bio ? "text-emerald-500" : "text-slate-300 dark:text-slate-650"} />
              <span className={helperProfile?.bio ? "text-slate-600 dark:text-slate-350" : "text-slate-400"}>{t("Giới thiệu bản thân")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Icon
                icon={helperProfile?.gender && helperProfile?.birthday ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                className={helperProfile?.gender && helperProfile?.birthday ? "text-emerald-500" : "text-slate-300 dark:text-slate-650"}
              />
              <span className={helperProfile?.gender && helperProfile?.birthday ? "text-slate-600 dark:text-slate-350" : "text-slate-400"}>{t("Giới tính & Ngày sinh")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Icon
                icon={helperProfile?.address ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                className={helperProfile?.address ? "text-emerald-500" : "text-slate-300 dark:text-slate-650"}
              />
              <span className={helperProfile?.address ? "text-slate-600 dark:text-slate-350" : "text-slate-400"}>{t("Địa chỉ cư trú")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Icon
                icon={helperSkills.length > 0 ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                className={helperSkills.length > 0 ? "text-emerald-500" : "text-slate-300 dark:text-slate-650"}
              />
              <span className={helperSkills.length > 0 ? "text-slate-600 dark:text-slate-350" : "text-slate-400"}>{t("Kỹ năng chuyên môn ({count})", { count: helperSkills.length })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:col-span-2">
              <Icon
                icon={helperWorkingAreas.length > 0 ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                className={helperWorkingAreas.length > 0 ? "text-emerald-500" : "text-slate-300 dark:text-slate-650"}
              />
              <span className={helperWorkingAreas.length > 0 ? "text-slate-600 dark:text-slate-350" : "text-slate-400"}>{t("Khu vực hoạt động ({count})", { count: helperWorkingAreas.length })}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmitVerification}
            disabled={updating}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 dark:bg-teal-50 dark:hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl text-xs transition-all duration-300 shadow-sm hover:shadow-teal-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {updating ? <Icon icon="line-md:loading-twotone-loop" className="text-sm" /> : <Icon icon="solar:shield-check-bold" className="text-sm" />}
            {status === "rejected" ? t("Gửi lại hồ sơ xét duyệt") : t("Nộp hồ sơ xét duyệt")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen transition-colors duration-300 py-8 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {renderHeader()}

        {renderAlerts()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6">
            {renderProfileCard()}
            {renderSidebarNavigation()}
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            {userProfile?.role_id === ROLES.HELPER && renderHelperVerificationWidget()}
            {activeTab === "info" && renderProfileInfoTab()}
            {activeTab === "address" && userProfile?.role_id === ROLES.CUSTOMER && renderAddressTab()}
            {activeTab === ("upgrade_helper" as any) && userProfile?.role_id === ROLES.CUSTOMER && renderUpgradeHelperTab()}
            {activeTab === "working_areas" && userProfile?.role_id === ROLES.HELPER && renderWorkingAreasTab()}
            {activeTab === "password" && renderPasswordTab()}
          </div>
        </div>
      </div>
      {renderAddressModal()}
    </div>
  );
};

export default Profile;
