import { Icon } from "@iconify/react";
import { useProfile } from "./useHook";

export const Profile = () => {
  const {
    t,
    activeTab,
    setActiveTab,
    loading,
    updating,
    userProfile,
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
    handleAvatarUpload,
  } = useProfile();

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

  // Get user role display name & styles
  const getRoleBadge = (roleId?: number) => {
    switch (roleId) {
      case 1:
        return { name: t("Quản trị viên"), style: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50" };
      case 2:
        return { name: t("Nhân viên vận hành"), style: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50" };
      case 3:
        return { name: t("Người giúp việc"), style: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50" };
      case 4:
      default:
        return { name: t("Khách hàng"), style: "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50" };
    }
  };

  const role = getRoleBadge(userProfile?.role_id);

  // 1. RENDER HEADER (TITLE & DESCRIPTION)
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
          {t("Hồ sơ cá nhân")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("Quản lý thông tin cá nhân, địa chỉ liên hệ và bảo mật tài khoản.")}
        </p>
      </div>
    </div>
  );

  // 2. RENDER STATUS ALERTS
  const renderAlerts = () => (
    <>
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in shadow-xs">
          <Icon icon="solar:check-circle-bold" className="text-2xl shrink-0 text-emerald-500" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in shadow-xs">
          <Icon icon="solar:danger-circle-bold" className="text-2xl shrink-0 text-red-500" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}
    </>
  );

  // 3. RENDER PROFILE CARD (LEFT COLUMN SUMMARY)
  const renderProfileCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs p-6 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-teal-600 to-[#034d54] dark:from-teal-900 dark:to-slate-800"></div>
      
      <div className="relative z-10 mt-6 mb-4">
        <img
          src={userProfile?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
          alt="User Avatar"
          className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md bg-slate-100"
        />
      </div>

      <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
        {userProfile?.full_name}
      </h2>
      
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 break-all px-2">
        {userProfile?.email}
      </p>

      <span className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${role.style}`}>
        {role.name}
      </span>

      <div className="w-full border-t border-slate-100 dark:border-slate-700/60 my-6"></div>

      <div className="w-full flex justify-center text-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">
            {t("Trạng thái tài khoản")}
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 capitalize mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t("Hoạt động")}
          </span>
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
            activeTab === "info"
              ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon icon="solar:user-circle-bold-duotone" className="text-2xl" />
            <span>{t("Thông tin cá nhân")}</span>
          </div>
          <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "info" ? "translate-x-1" : "opacity-0"}`} />
        </button>

        {userProfile?.role_id === 4 && (
          <button
            onClick={() => setActiveTab("address")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "address"
                ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon icon="solar:map-point-wave-bold-duotone" className="text-2xl" />
              <span>{t("Sổ địa chỉ")}</span>
            </div>
            <Icon icon="solar:alt-arrow-right-bold" className={`text-base transition-transform ${activeTab === "address" ? "translate-x-1" : "opacity-0"}`} />
          </button>
        )}

        <button
          onClick={() => setActiveTab("password")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
            activeTab === "password"
              ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon icon="solar:lock-keyhole-minimalistic-bold-duotone" className="text-2xl" />
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
      <h3 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">
        {t("Thông tin cá nhân")}
      </h3>
      
      <form onSubmit={profileForm.handleSubmit} className="space-y-6">
        {/* Avatar Upload Container */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t("Ảnh đại diện")}
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700/40">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <img
                src={profileForm.values.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"}
                alt="Avatar Preview"
                className={`w-20 h-20 rounded-full object-cover border-2 border-teal-500 shadow-md bg-slate-100 dark:bg-slate-800 ${
                  avatarUploading ? "opacity-40 blur-xs" : ""
                }`}
              />
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon icon="line-md:loading-twotone-loop" className="text-2xl text-teal-600 dark:text-teal-400" />
                </div>
              )}
            </div>
            
            {/* File Upload Area */}
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                {t("Ảnh đại diện tài khoản")}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                {t("Hỗ trợ JPG, PNG, GIF. Dung lượng tối đa 2MB.")}
              </p>
              
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 cursor-pointer shadow-xs transition-all hover:scale-[1.02] disabled:opacity-50">
                <Icon icon="solar:upload-bold-duotone" className="text-base" />
                <span>{t("Tải ảnh mới")}</span>
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
            </div>
          </div>
          {profileForm.touched.avatar && profileForm.errors.avatar && (
            <div className="text-red-500 text-xs mt-1">{profileForm.errors.avatar}</div>
          )}
        </div>

        {/* Info Grid (Email, Name, Phone) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t("Địa chỉ Email")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="solar:letter-bold" className="text-lg" />
              </div>
              <input
                type="email"
                disabled
                className="pl-10 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 cursor-not-allowed"
                value={userProfile?.email || ""}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {t("Email định danh không thể thay đổi.")}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t("Họ và tên")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="solar:user-bold" className="text-lg" />
              </div>
              <input
                type="text"
                name="full_name"
                className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors ${
                  profileForm.touched.full_name && profileForm.errors.full_name
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                }`}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                value={profileForm.values.full_name}
              />
            </div>
            {profileForm.touched.full_name && profileForm.errors.full_name && (
              <div className="text-red-500 text-xs mt-1">{profileForm.errors.full_name}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t("Số điện thoại")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="solar:phone-bold" className="text-lg" />
              </div>
              <input
                type="text"
                name="phone"
                placeholder="e.g. 0912345678"
                className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors ${
                  profileForm.touched.phone && profileForm.errors.phone
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                }`}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                value={profileForm.values.phone}
              />
            </div>
            {profileForm.touched.phone && profileForm.errors.phone && (
              <div className="text-red-500 text-xs mt-1">{profileForm.errors.phone}</div>
            )}
          </div>
        </div>

        {/* Customer Extended Info (Gender, Birthday, Note) */}
        {userProfile?.role_id === 4 && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {t("Thông tin mở rộng")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Giới tính")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["male", "female", "other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => profileForm.setFieldValue("gender", g)}
                      className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
                        profileForm.values.gender === g
                          ? "border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                      }`}
                    >
                      <Icon
                        icon={
                          g === "male"
                            ? "ph:gender-male-bold"
                            : g === "female"
                            ? "ph:gender-female-bold"
                            : "ph:gender-neuter-bold"
                        }
                        className="text-lg"
                      />
                      {g === "male" ? t("Nam") : g === "female" ? t("Nữ") : t("Khác")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("Ngày sinh")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon icon="solar:calendar-bold" className="text-lg" />
                  </div>
                  <input
                    type="date"
                    name="birthday"
                    className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors ${
                      profileForm.touched.birthday && profileForm.errors.birthday
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    }`}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    value={profileForm.values.birthday}
                  />
                </div>
                {profileForm.touched.birthday && profileForm.errors.birthday && (
                  <div className="text-red-500 text-xs mt-1">{profileForm.errors.birthday}</div>
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("Ghi chú cá nhân")}
              </label>
              <div className="relative">
                <textarea
                  name="note"
                  rows={3}
                  placeholder={t("Mô tả ghi chú về sở thích dọn dẹp hoặc yêu cầu đặc biệt...")}
                  className={`w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors resize-none ${
                    profileForm.touched.note && profileForm.errors.note
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={profileForm.handleChange}
                  onBlur={profileForm.handleBlur}
                  value={profileForm.values.note}
                />
              </div>
              {profileForm.touched.note && profileForm.errors.note && (
                <div className="text-red-500 text-xs mt-1">{profileForm.errors.note}</div>
              )}
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
            {updating ? (
              <Icon icon="line-md:loading-twotone-loop" className="text-lg" />
            ) : (
              <Icon icon="solar:diskette-bold" className="text-lg" />
            )}
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
        <h3 className="text-lg font-bold text-slate-850 dark:text-white">
          {t("Sổ địa chỉ")}
        </h3>
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
                <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                  addressItem.is_default === 1 
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                }`}>
                  <Icon icon="solar:map-point-bold-duotone" className="text-2xl" />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">
                      {addressItem.address}
                    </span>
                    {addressItem.is_default === 1 && (
                      <span className="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50 rounded-md text-[10px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                        {t("Mặc định")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {addressItem.district}, {addressItem.city}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {addressItem.is_default === 0 && (
                  <button
                    onClick={() => handleSetDefaultAddress(addressItem.id)}
                    title={t("Đặt làm mặc định")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                  >
                    <Icon icon="solar:star-bold" className="text-lg" />
                  </button>
                )}
                <button
                  onClick={() => handleEditAddressClick(addressItem)}
                  title={t("Chỉnh sửa")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                >
                  <Icon icon="solar:pen-bold" className="text-lg" />
                </button>
                <button
                  onClick={() => handleDeleteAddress(addressItem.id)}
                  title={t("Xóa")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="text-lg" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
            <Icon icon="solar:streets-map-point-broken" className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t("Bạn chưa lưu địa chỉ nào.")}
            </p>
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
      <h3 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">
        {t("Đổi mật khẩu tài khoản")}
      </h3>

      <form onSubmit={passwordForm.handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
              className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors ${
                passwordForm.touched.password && passwordForm.errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              }`}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              value={passwordForm.values.password}
            />
          </div>
          {passwordForm.touched.password && passwordForm.errors.password && (
            <div className="text-red-500 text-xs mt-1">{passwordForm.errors.password}</div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
              className={`pl-10 w-full px-4 py-3 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors ${
                passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              }`}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              value={passwordForm.values.confirmPassword}
            />
          </div>
          {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && (
            <div className="text-red-500 text-xs mt-1">{passwordForm.errors.confirmPassword}</div>
          )}
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
            {updating ? (
              <Icon icon="line-md:loading-twotone-loop" className="text-lg" />
            ) : (
              <Icon icon="solar:key-bold" className="text-lg" />
            )}
            {t("Đổi mật khẩu")}
          </button>
        </div>
      </form>
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
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {editingAddress ? t("Chỉnh sửa địa chỉ") : t("Thêm địa chỉ mới")}
            </h3>
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Icon icon="solar:close-circle-bold" className="text-xl" />
            </button>
          </div>

          <form onSubmit={addressForm.handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Address detail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("Địa chỉ chi tiết (Số nhà, đường...)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder={t("Ví dụ: 123 Nguyễn Huệ")}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white ${
                    addressForm.touched.address && addressForm.errors.address
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={addressForm.handleChange}
                  onBlur={addressForm.handleBlur}
                  value={addressForm.values.address}
                />
                {addressForm.touched.address && addressForm.errors.address && (
                  <div className="text-red-500 text-[11px] mt-1">{addressForm.errors.address}</div>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("Quận / Huyện")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder={t("Ví dụ: Quận 1")}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white ${
                    addressForm.touched.district && addressForm.errors.district
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={addressForm.handleChange}
                  onBlur={addressForm.handleBlur}
                  value={addressForm.values.district}
                />
                {addressForm.touched.district && addressForm.errors.district && (
                  <div className="text-red-500 text-[11px] mt-1">{addressForm.errors.district}</div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("Tỉnh / Thành phố")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder={t("Ví dụ: TP. Hồ Chí Minh")}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-slate-50/50 dark:bg-slate-900 dark:text-white ${
                    addressForm.touched.city && addressForm.errors.city
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  }`}
                  onChange={addressForm.handleChange}
                  onBlur={addressForm.handleBlur}
                  value={addressForm.values.city}
                />
                {addressForm.touched.city && addressForm.errors.city && (
                  <div className="text-red-500 text-[11px] mt-1">{addressForm.errors.city}</div>
                )}
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t("Hủy")}
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-xs transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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

  // MAIN PAGE LAYOUT (GRID STRUCTURE)
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-8 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Page Header */}
        {renderHeader()}

        {/* Status Messages */}
        {renderAlerts()}

        {/* 12-column Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Panel (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {renderProfileCard()}
            {renderSidebarNavigation()}
          </div>

          {/* Right Main Content (8 Columns) */}
          <div className="lg:col-span-8">
            {activeTab === "info" && renderProfileInfoTab()}
            {activeTab === "address" && userProfile?.role_id === 4 && renderAddressTab()}
            {activeTab === "password" && renderPasswordTab()}
          </div>

        </div>

      </div>

      {/* Address Book Modal Portal Overlay */}
      {renderAddressModal()}
    </div>
  );
};

export default Profile;
