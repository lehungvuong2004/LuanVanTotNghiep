import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useHeader } from "./useHook";

export const Header = () => {
  const {
    t,
    isMobileMenuOpen,
    isScrolled,
    isLoggedIn,
    handleLogout,
    user,
    notifications,
    unreadCount,
    markAllAsRead,
    toggleRead,
    isDarkMode,
    toggleDarkMode,
    changeLanguage,
    isEn,
    toggleMobileMenu,
    activeCategory,
    setActiveCategory,
    navLinks,
    categories,
    bottomLinks,
    newsItems,
    categoryDetails,
  } = useHeader();

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#066d72] dark:bg-slate-800 ${
        isScrolled ? "shadow-md" : ""
      }`}>
      <div className="w-full px-4 md:px-16 mx-auto">
        <div className="flex items-stretch justify-between w-full transition-all duration-300">
        <div className={`flex-1 lg:hidden flex items-center ${
          isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"
        }`}>
          <Icon icon="gg:menu-round" className="text-4xl text-white cursor-pointer" onClick={toggleMobileMenu} />
        </div>

        <nav className="hidden lg:flex flex-1 items-stretch text-white font-medium text-base">
          <div className="relative group/menu h-full flex items-center mr-2">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 shadow-sm text-white font-medium text-base">
              <Icon icon="bitcoin-icons:menu-outline" className="text-3xl" /> {t("Danh Mục")}
            </div>

            {/* Submenu Dropdown */}
            <div className="absolute top-full left-0 w-max max-w-screen-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50">
              <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-2xl border-b-2 border-slate-100 dark:border-slate-700/50 overflow-hidden text-slate-800 dark:text-slate-100 p-5 flex gap-5">
                
                {/* Left Sidebar */}
                <div className="w-56 shrink-0 flex flex-col gap-3 pr-4">
                  {/* Service Categories (Scrollable) */}
                  <div className="max-h-95 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {/* Top 4 Navigation Links */}
                    {navLinks.map((navLink) => (
                      <Link
                        key={navLink.name}
                        to={navLink.to}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                      >
                        {t(navLink.name)}
                        <Icon icon="material-symbols:chevron-right" className="text-base opacity-0 group-hover:opacity-100" />
                      </Link>
                    ))}

                    <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1" />

                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.name;
                      return (
                        <button
                          key={cat.name}
                          onMouseEnter={() => setActiveCategory(cat.name)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isActive
                              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                              : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {t(cat.name)}
                          <Icon icon="material-symbols:chevron-right" className={`text-base ${isActive ? "opacity-100" : "opacity-0"}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Links Below */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-1">
                    {bottomLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.to}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                      >
                        {t(link.name)}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Search bar inside submenu */}
                  <div className="relative">
                    <Icon icon="material-symbols:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="text"
                      placeholder={t("Tìm dịch vụ, người giúp việc...")}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Active Category detail */}
                    {categoryDetails[activeCategory] && (
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{t(activeCategory)}</span>
                          <Link to="/dich-vu" className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-0.5">
                            {t("Xem tất cả")} <Icon icon="material-symbols:open-in-new" className="text-xs" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {categoryDetails[activeCategory].services.map((service) => (
                            <div key={service.name} className="p-3 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2">
                                <Icon icon={service.icon} className="text-lg" />
                              </div>
                              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">{t(service.name)}</h4>
                              <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mb-1">{service.price}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal line-clamp-2">{t(service.desc)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Featured Helpers */}
                    {categoryDetails[activeCategory] && (
                      <div className="col-span-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t("Người giúp việc nổi bật")}</h4>
                        <div className="flex flex-col gap-2">
                          {categoryDetails[activeCategory].helpers.map((helper) => (
                            <div key={helper.name} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <img src={helper.avatar} alt={helper.name} className="w-10 h-10 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{helper.name}</span>
                                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                                    <Icon icon="material-symbols:star" className="text-sm" />
                                    {helper.rating}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{helper.exp} • {helper.area}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic truncate">"{t(helper.desc)}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rightmost column: Tin tức & khuyến mãi */}
                <div className="w-60 shrink-0 pl-5 flex flex-col gap-4">
                  {/* Promotion Banner */}
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 flex items-end p-3 border border-slate-800">
                    <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Promo" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="relative z-10 text-left">
                      <span className="bg-teal-500 text-white text-xs font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">{t("Khuyến mãi")}</span>
                      <h4 className="text-white font-bold text-xs leading-snug">{t("Giảm 20% cho khách hàng mới")}</h4>
                    </div>
                  </div>

                  {/* News list */}
                  <div className="text-left">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t("Tin tức & kinh nghiệm")}</h4>
                    <div className="flex flex-col gap-2">
                      {newsItems.map((item) => (
                        <div key={item.title} className="flex flex-col gap-0.5 pb-2 border-b border-slate-100 dark:border-slate-700/30 last:border-0 last:pb-0">
                          <Link to="/tin-tuc" className="font-bold text-xs text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors leading-snug line-clamp-2">
                            {t(item.title)}
                          </Link>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{t(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </nav>

        <div className={`flex items-center justify-center shrink-0 ${
          isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"
        }`}>
          <Link to="/" className="text-white font-bold text-2xl md:text-3xl">
            Gia Đình Việt
          </Link>
        </div>

        <div className="flex-1 lg:hidden flex justify-end items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs cursor-pointer hover:scale-105"
            >
              <Icon icon={isDarkMode ? "circum:dark" : "entypo:light-up"} className="text-xl" />
            </button>
            <div className="relative group cursor-pointer flex items-center justify-center">
              <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs hover:scale-105 relative">
                <Icon icon="mdi:bell-outline" className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-700">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="absolute top-full right-0 pt-4 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col bg-white dark:bg-slate-800 p-3 text-left text-gray-800 dark:text-white">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="font-semibold text-xs">{t("Thông báo")}</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer"
                      >
                        {t("Đọc tất cả")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 py-2 max-h-56 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => toggleRead(notif.id)}
                          className={`flex items-start gap-2 p-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-200 ${!notif.read ? "bg-teal-50/50 dark:bg-teal-950/20 font-medium" : ""}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${!notif.read ? "bg-teal-600 dark:bg-teal-400" : "bg-transparent"}`} />
                          <div className="flex flex-col flex-1">
                            <span className="text-gray-700 dark:text-gray-200 leading-tight">{notif.title}</span>
                            <span className="text-xs text-gray-400 mt-0.5">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-xs">
                        {t("Không có thông báo nào")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isLoggedIn ? (
            <div className="relative group  flex items-center cursor-pointer">
              <div className="border-2 border-white/50 hover:border-white rounded-full p-1 -m-1 transition-all duration-300 flex items-center justify-center cursor-pointer">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <Icon icon="lucide:circle-user" className="text-4xl md:text-2xl cursor-pointer" />
                )}
              </div>
 
              <div className="absolute top-full right-0 pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col bg-white dark:bg-slate-800 p-4 text-left">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-[#026E5F] dark:border-teal-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">
                        {user?.full_name || "Nguyễn Văn A"}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {user?.role_id === 1 ? t("Quản trị viên") : user?.role_id === 2 ? t("Nhân viên vận hành") : user?.role_id === 3 ? t("Người giúp việc") : t("Khách hàng")}
                      </span>
                    </div>
                  </div>
 
                  <div className="flex flex-col gap-1 py-3">
                    {user && user.role_id !== 4 && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                      >
                        <Icon icon="lucide:layout-dashboard" className="text-lg text-gray-400" />
                        <span>{t("Bảng điều khiển")}</span>
                      </Link>
                    )}
                    <Link
                      to="/ho-so"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                    >
                      <Icon icon="mdi:account-outline" className="text-lg text-gray-400" />
                      <span>{t("Hồ sơ cá nhân")}</span>
                    </Link>
                    <Link
                      to="/lich-su-dat-lich"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                    >
                      <Icon icon="mdi:calendar-clock-outline" className="text-lg text-gray-400" />
                      <span>{t("Lịch sử đặt lịch")}</span>
                    </Link>
                  </div>
 
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold transition-all duration-200 cursor-pointer"
                    >
                      <Icon icon="material-symbols:logout" className="text-lg" />
                      <span>{t("Đăng xuất")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full flex items-center cursor-pointer">
              <Link to="/dang-nhap" className="border-2 border-white/50 hover:border-white rounded-full p-1 -m-1 transition-all duration-300 flex items-center justify-center cursor-pointer">
                <Icon icon="lucide:circle-user" className="text-4xl md:text-2xl cursor-pointer" />
              </Link>
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-1 justify-end items-center gap-6">
          {/* Language picker — own py = full header height */}
          <div className={`relative group h-full flex items-center cursor-pointer px-3 transition-all duration-300 ${
            isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"
          }`}>
            <div className="flex items-center gap-2 cursor-pointer font-medium text-base text-white transition-colors">
              <Icon icon={isEn ? "twemoji:flag-us-outlying-islands" : "twemoji:flag-vietnam"} className="text-2xl shrink-0" />
              <span>{isEn ? t("English") : t("Việt Nam")}</span>
              <Icon icon="ri:arrow-drop-down-line" className="text-3xl -ml-1" />
            </div>

            <div className="absolute top-full right-0 w-max min-w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="rounded-b-lg shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col bg-white dark:bg-slate-800">
                <div onClick={() => changeLanguage("vn")} className="flex items-center gap-3 px-4 py-3 cursor-pointer dark:hover:bg-slate-700 transition-colors group/item">
                  <Icon icon="twemoji:flag-vietnam" className="text-2xl shrink-0 group-hover/item:scale-110 transition-transform" />
                  <span className="text-base text-gray-700 dark:text-gray-200 group-hover/item:text-teal-700 dark:group-hover/item:text-teal-400 font-medium transition-colors">{t("Việt Nam")}</span>
                </div>
                <div onClick={() => changeLanguage("en")} className="flex items-center gap-3 px-4 py-3 cursor-pointer dark:hover:bg-slate-700 rounded-b-lg transition-colors group/item">
                  <Icon icon="twemoji:flag-us-outlying-islands" className="text-2xl shrink-0 group-hover/item:scale-110 transition-transform" />
                  <span className="text-base text-gray-700 dark:text-gray-200 group-hover/item:text-teal-700 dark:group-hover/item:text-teal-400 font-medium transition-colors">{t("English")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-stretch gap-3 text-white self-stretch">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs cursor-pointer self-center hover:scale-105"
            >
              <Icon
                icon={isDarkMode ? "tdesign:mode-dark" : "entypo:light-up"}
                className="text-xl"
              />
            </button>
            <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs cursor-pointer self-center hover:scale-105">
              <Icon icon="boxicons:location" className="text-xl" />
            </div>
            <div className="relative group h-full flex items-center cursor-pointer">
              <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs self-center hover:scale-105 relative">
                <Icon
                  icon="mdi:bell-outline"
                  className="text-xl"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-700">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Desktop Notification Dropdown */}
              <div className="absolute top-full right-0 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="rounded-b-xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col bg-white dark:bg-slate-800 p-4 text-left text-gray-800 dark:text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="font-semibold text-sm">{t("Thông báo")}</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer"
                      >
                        {t("Đánh dấu tất cả đã đọc")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 py-3 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => toggleRead(notif.id)}
                          className={`flex items-start gap-3 p-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-200 ${!notif.read ? "bg-teal-50/50 dark:bg-teal-950/20 font-medium" : ""}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? "bg-teal-600 dark:bg-teal-400" : "bg-transparent"}`} />
                          <div className="flex flex-col flex-1">
                            <span className="text-gray-700 dark:text-gray-200 leading-snug">{notif.title}</span>
                            <span className="text-xs text-gray-400 mt-1">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        {t("Không có thông báo nào")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isLoggedIn ? (
              <div className="relative group h-full flex items-center cursor-pointer">
                <div className="border-2 border-white/50 hover:border-white rounded-full p-1 -m-1 transition-all duration-300 flex items-center justify-center cursor-pointer">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="User Avatar" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <Icon icon="lucide:circle-user" className="text-2xl cursor-pointer hover:text-teal-200 hover:scale-110 drop-shadow-sm" />
                  )}
                </div>

                <div className="absolute top-full right-0 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-b-xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col bg-white dark:bg-slate-800 p-4 text-left">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                      <img
                        src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-[#026E5F] dark:border-teal-500"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">
                          {user?.full_name || "Nguyễn Văn A"}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {user?.role_id === 1 ? t("Quản trị viên") : user?.role_id === 2 ? t("Nhân viên vận hành") : user?.role_id === 3 ? t("Người giúp việc") : t("Khách hàng")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 py-3">
                      {user && user.role_id !== 4 && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                        >
                          <Icon icon="lucide:layout-dashboard" className="text-lg text-gray-400" />
                          <span>{t("Bảng điều khiển")}</span>
                        </Link>
                      )}
                      <Link
                        to="/ho-so"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                      >
                        <Icon icon="mdi:account-outline" className="text-lg text-gray-400" />
                        <span>{t("Hồ sơ cá nhân")}</span>
                      </Link>
                      <Link
                        to="/lich-su-dat-lich"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                      >
                        <Icon icon="mdi:calendar-clock-outline" className="text-lg text-gray-400" />
                        <span>{t("Lịch sử đặt lịch")}</span>
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold transition-all duration-200 cursor-pointer"
                      >
                        <Icon icon="material-symbols:logout" className="text-lg text-red-600 dark:text-red-400" />
                        <span>{t("Đăng xuất")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-full flex items-center cursor-pointer">
                <Link to="/dang-nhap" className="border-2 border-white/50 hover:border-white rounded-full p-1 -m-1 transition-all duration-300 flex items-center justify-center cursor-pointer">
                  <Icon icon="lucide:circle-user" className="text-2xl cursor-pointer hover:text-teal-200 hover:scale-110 drop-shadow-sm" />
                </Link>
              </div>
            )}
          </div>

          <Link to="/dang-bai-tuyen">
            <button className="bg-white dark:bg-teal-500 text-teal-700 dark:text-white dark:hover:bg-teal-400 hover:text-teal-800 font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-base">
              {t("Đăng bài tuyển")}
            </button>
          </Link>
        </div>
      </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={toggleMobileMenu}></div>

          {/* Sidebar Drawer */}
          <div className="relative w-[80%] max-w-7xl bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col z-40">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <span className="font-bold text-xl text-[#026E5F] dark:text-teal-400">Menu</span>
              <Icon icon="material-symbols:close" className="text-3xl text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer" onClick={toggleMobileMenu} />
            </div>

            <div className="flex flex-col p-5 gap-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 cursor-pointer bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl px-4 py-3 font-medium text-gray-800 dark:text-gray-200 transition-colors">
                <Icon icon="bitcoin-icons:menu-outline" className="text-2xl text-[#026E5F] dark:text-teal-400" />
                {t("Danh Mục")}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Link
                  to="/about"
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 dark:hover:bg-slate-700 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  {t("Trang Chủ")}
                </Link>
                <Link
                  to="/about"
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 dark:hover:bg-slate-700 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  {t("Về chúng tôi")}
                </Link>
                {/* <Link
                  to="/viec-lam"
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 dark:hover:bg-slate-700 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  {t("Dịch Vụ")}
                </Link> */}
                <Link
                  to="/lien-he"
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 dark:hover:bg-slate-700 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  {t("Liên hệ")}
                </Link>
              </div>

              <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium px-1">{t("Ngôn ngữ")}</p>
                <div className="flex gap-3">
                  <div
                    onClick={() => {
                      changeLanguage("vn");
                      toggleMobileMenu();
                    }}
                    className={`flex-1 flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${!isEn ? "border-[#026E5F] dark:border-teal-500 bg-[#026E5F]/5 dark:bg-teal-500/10 text-[#026E5F] dark:text-teal-400" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:hover:bg-slate-700"}`}
                  >
                    <Icon icon="twemoji:flag-vietnam" className="text-xl shrink-0" />
                    <span className="font-medium text-sm">VN</span>
                  </div>
                  <div
                    onClick={() => {
                      changeLanguage("en");
                      toggleMobileMenu();
                    }}
                    className={`flex-1 flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${isEn ? "border-[#026E5F] dark:border-teal-500 bg-[#026E5F]/5 dark:bg-teal-500/10 text-[#026E5F] dark:text-teal-400" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:hover:bg-slate-700"}`}
                  >
                    <Icon icon="twemoji:flag-us-outlying-islands" className="text-xl shrink-0" />
                    <span className="font-medium text-sm">EN</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 pb-4">
                <button
                  className="w-full bg-[#026E5F] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-medium px-6 py-3.5 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
                  onClick={toggleMobileMenu}
                >
                  {t("Đăng bài tuyển")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </header>
      {/* Spacer — invisible clone of header row so height matches perfectly without hardcoded values */}
      <div className="w-full px-4 md:px-16 mx-auto pointer-events-none select-none" aria-hidden="true">
        <div className={`flex items-center justify-center transition-all duration-300 ${
          isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"
        }`}>
          <span className="text-white font-bold text-2xl md:text-3xl invisible">Gia Đình Việt</span>
        </div>
      </div>
    </>
  );
};
