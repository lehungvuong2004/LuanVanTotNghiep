import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useHeader } from "./useHook";
import type { NotificationType, Notification } from "../../api/notificationsApi/notifications";

import { formatVietnamDateTime } from "../../utils";
import { ROLES, getRoleName, getRoleDashboard, getUserRole } from "../../constants/roles";

// Icon & colour mapping per notification type
const NOTIF_META: Record<NotificationType, { icon: string; bg: string; fg: string }> = {
  booking: { icon: "mdi:calendar-check", bg: "bg-teal-100 dark:bg-teal-900/40", fg: "text-teal-600 dark:text-teal-400" },
  payment: { icon: "mdi:credit-card-outline", bg: "bg-green-100 dark:bg-green-900/40", fg: "text-green-600 dark:text-green-400" },
  system: { icon: "mdi:bell-outline", bg: "bg-slate-100 dark:bg-slate-700", fg: "text-slate-500 dark:text-slate-300" },
  promotion: { icon: "mdi:tag-outline", bg: "bg-orange-100 dark:bg-orange-900/40", fg: "text-orange-500 dark:text-orange-400" },
  report: { icon: "mdi:alert-circle-outline", bg: "bg-red-100 dark:bg-red-900/40", fg: "text-red-500 dark:text-red-400" },
  recruitment: { icon: "mdi:briefcase-outline", bg: "bg-blue-100 dark:bg-blue-900/40", fg: "text-blue-600 dark:text-blue-400" },
};
const DEFAULT_META = NOTIF_META.system;

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
    removeNotification,
    notifLoading,
    notifPage,
    notifLastPage,
    loadMoreNotifications,
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

  const navigate = useNavigate();

  const handleNotificationClick = (notif: Notification) => {
    toggleRead(notif.id);
    if (notif.type === "booking" || notif.type === "recruitment") {
      const titleLower = notif.title?.toLowerCase() || "";
      const msgLower = notif.message?.toLowerCase() || "";
      const isRecruitment = notif.type === "recruitment" || titleLower.includes("ứng tuyển") || msgLower.includes("ứng tuyển") || msgLower.includes("tuyển dụng");

      if (isRecruitment) {
        if (getUserRole(user) === ROLES.CUSTOMER) {
          const match = notif.message?.match(/mã:\s*#(\d+)/i);
          if (match && match[1]) {
            navigate(`/lich-su-dat-lich?tab=job-posts&post_id=${match[1]}`);
          } else {
            navigate("/lich-su-dat-lich?tab=job-posts");
          }
        } else if (getUserRole(user) === ROLES.HELPER) {
          navigate("/lich-su-dat-lich?tab=helper-applications");
        } else {
          navigate("/lich-su-dat-lich");
        }
      } else {
        navigate("/lich-su-dat-lich");
      }
    }
  };

  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileNotifOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMobileNotifOpen]);

  const displayedNotifications = notifFilter === "all" ? notifications : notifications.filter((notif) => !notif.is_read);

  const handlePostJobClick = () => {
    if (isLoggedIn) {
      navigate("/dang-bai-tuyen");
    } else {
      navigate("/dang-nhap");
    }
  };

  const handlePostJobClickMobile = () => {
    toggleMobileMenu();
    if (isLoggedIn) {
      navigate("/dang-bai-tuyen");
    } else {
      navigate("/dang-nhap");
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#066d72] dark:bg-slate-800 ${isScrolled ? "shadow-md" : ""}`}>
        <div className="w-full px-4 md:px-16 mx-auto">
          <div className="flex items-stretch justify-between w-full transition-all duration-300">
            <div className={`flex-1 lg:hidden flex items-center ${isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"}`}>
              <Icon icon="lucide:menu" className="text-2xl text-white cursor-pointer" onClick={toggleMobileMenu} />
            </div>

            <nav className="hidden lg:flex flex-1 items-stretch text-white font-medium text-base">
              <div className="relative group/menu h-full flex items-center mr-2">
                <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 shadow-sm text-white font-medium text-base">
                  <Icon icon="bitcoin-icons:menu-outline" className="text-3xl" /> {t("Danh Mục")}
                </div>

                {/* Submenu Dropdown */}
                <div className="absolute top-full left-0 w-max max-w-7xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50">
                  <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-2xl border-b-2 border-slate-100 dark:border-slate-700/50 overflow-hidden text-slate-800 dark:text-slate-100 p-5 flex gap-5 h-144">
                    {/* Left Sidebar */}
                    <div className="w-56 shrink-0 flex flex-col gap-3 pr-4 border-r border-slate-100 dark:border-slate-700/50">
                      {/* Service Categories (Scrollable) */}
                      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {/* Top 4 Navigation Links */}
                        {navLinks.map((navLink) => (
                          <Link
                            key={navLink.name}
                            to={navLink.to}
                            className="w-full text-left px-3 py-2 rounded-xl text-base font-semibold flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          >
                            {t(navLink.name)}
                            <Icon icon="material-symbols:chevron-right" className="text-base opacity-0 group-hover:opacity-100" />
                          </Link>
                        ))}

                        <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1.5" />

                        {categories.map((cat) => {
                          const isActive = activeCategory === cat.name;
                          return (
                            <button
                              key={cat.name}
                              onMouseEnter={() => setActiveCategory(cat.name)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-base font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400"
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
                            className="w-full text-left px-3 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                          >
                            {t(link.name)}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col gap-4 min-w-140">
                      {/* Search bar inside submenu */}
                      <div className="relative">
                        <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input
                          type="text"
                          placeholder={t("Tìm dịch vụ, người giúp việc...")}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 flex flex-col gap-4">
                        {/* Active Category detail */}
                        {categoryDetails[activeCategory] && (
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <h1 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{t(activeCategory)}</h1>
                              <Link to="/dich-vu" className="text-sm text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-0.5">
                                {t("Xem tất cả")} <Icon icon="material-symbols:open-in-new" className="text-xs" />
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3.5">
                              {categoryDetails[activeCategory].services.map((service) => (
                                <div key={service.name} className="p-3.5 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-teal-500 dark:hover:border-teal-500 bg-white dark:bg-slate-900/30 transition-all duration-300 shadow-xs flex flex-col justify-between">
                                  <div>
                                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2 shrink-0">
                                      <Icon icon={service.icon} className="text-xl" />
                                    </div>
                                    <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-200 mb-1">{t(service.name)}</h4>
                                    <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed mb-2.5 line-clamp-2">{t(service.desc)}</p>
                                  </div>
                                  <p className="text-sm text-teal-600 dark:text-teal-400 font-extrabold">{service.price}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Featured Helpers */}
                        {categoryDetails[activeCategory] && (
                          <div>
                            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t("Người giúp việc nổi bật")}</h2>
                            <div className="grid grid-cols-2 gap-3.5">
                              {categoryDetails[activeCategory].helpers.map((helper) => (
                                <div key={helper.name} className="flex gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 items-start">
                                  <img src={helper.avatar} alt={helper.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <span className="font-extrabold text-base text-slate-800 dark:text-slate-200 truncate">{helper.name}</span>
                                      <span className="flex items-center gap-0.5 text-sm font-bold text-amber-500 shrink-0">
                                        <Icon icon="material-symbols:star" className="text-base" />
                                        {helper.rating}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
                                      {helper.exp} • {helper.area}
                                    </p>
                                    <p className="text-xs text-slate-450 dark:text-slate-500 italic line-clamp-1">"{t(helper.desc)}"</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-60 shrink-0 pl-5 flex flex-col gap-4 border-l border-slate-100 dark:border-slate-700/50">
                      {/* Promotion Banner */}
                      <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-900 flex items-end p-3 border border-slate-800 shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop"
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                          alt="Promo"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        <div className="relative z-10 text-left">
                          <span className="bg-teal-500 text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider mb-2.5 inline-block">{t("Khuyến mãi")}</span>
                          <h4 className="text-white font-extrabold text-xs leading-snug">{t("Giảm 20% cho khách hàng mới")}</h4>
                        </div>
                      </div>

                      {/* News list */}
                      <div className="text-left flex-1 min-h-0 overflow-y-auto pr-1">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t("Tin tức & kinh nghiệm")}</h4>
                        <div className="flex flex-col gap-2.5">
                          {newsItems.map((item) => (
                            <div key={item.title} className="flex flex-col gap-1 pb-2.5 border-b border-slate-100 dark:border-slate-700/30 last:border-0 last:pb-0">
                              <Link
                                to={`/tin-tuc/${item.slug}`}
                                className="font-bold text-xs text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors leading-snug line-clamp-2"
                              >
                                {t(item.title)}
                              </Link>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className={`flex items-center justify-center shrink-0 ${isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"}`}>
              <Link to="/" className="text-white font-bold text-xl md:text-3xl whitespace-nowrap">
                Gia Đình Việt
              </Link>
            </div>

            <div className="flex-1 lg:hidden flex justify-end items-center gap-2 text-white">
              {/* Dark mode toggle — always visible, clean borderless style on mobile */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <Icon icon={isDarkMode ? "circum:dark" : "entypo:light-up"} className="text-xl" />
              </button>

              {/* Notification bell — only when logged in */}
              {isLoggedIn && (
                <div className="relative cursor-pointer flex items-center justify-center">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileNotifOpen(!isMobileNotifOpen);
                      setIsMobileUserMenuOpen(false);
                    }}
                    className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 relative"
                  >
                    <Icon icon="mdi:bell-outline" className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold ring-2 ring-[#066d72] dark:ring-slate-800">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {isMobileNotifOpen && (
                    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col cursor-default" onClick={(e) => e.stopPropagation()}>
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-[#066d72] dark:bg-slate-800 text-white shadow-sm shrink-0">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsMobileNotifOpen(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                          >
                            <Icon icon="material-symbols:arrow-back" className="text-2xl" />
                          </button>
                          <span className="font-bold text-lg">{t("Thông báo")}</span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setIsMobileNotifOpen(false);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Icon icon="lucide:check-check" className="text-white text-sm" />
                            <span>{t("Đọc tất cả")}</span>
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => {
                            const isUnread = !notif.is_read;
                            const timeLabel = formatVietnamDateTime(notif.created_at);
                            const meta = NOTIF_META[notif.type] || DEFAULT_META;
                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  handleNotificationClick(notif);
                                  setIsMobileNotifOpen(false);
                                }}
                                className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer shadow-xs border ${
                                  isUnread
                                    ? "bg-teal-50/30 dark:bg-teal-950/10 border-teal-100 dark:border-teal-900/30 font-medium"
                                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50"
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${meta.bg}`}>
                                  <Icon icon={meta.icon} className={`text-xl ${meta.fg}`} />
                                </div>
                                <div className="flex flex-col flex-1 text-left min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm text-gray-800 dark:text-gray-100 leading-snug font-bold">{notif.title}</span>
                                    {isUnread && <span className="w-2 h-2 bg-teal-600 dark:bg-teal-400 rounded-full shrink-0 mt-1.5" />}
                                  </div>
                                  {notif.message && <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: notif.message }} />}
                                  {notif.type === "booking" && (
                                    <span className="text-xs text-[#026E5F] dark:text-teal-400 font-bold mt-2 flex items-center gap-0.5">
                                      <Icon icon="material-symbols:arrow-forward-rounded" className="text-xs" />
                                      {t("Xem chi tiết")}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">{timeLabel}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                            <Icon icon="material-symbols:notifications-off-outline-rounded" className="text-6xl mb-3" />
                            <span className="text-sm font-semibold">{t("Không có thông báo nào")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Avatar / Login */}
              {isLoggedIn ? (
                <div className="relative flex items-center cursor-pointer">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
                      setIsMobileNotifOpen(false);
                    }}
                    className="border-2 border-white/50 hover:border-white rounded-full p-0.5 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <Icon icon="lucide:circle-user" className="text-3xl cursor-pointer" />
                    )}
                  </div>

                  {isMobileUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsMobileUserMenuOpen(false)} />
                      <div className="absolute top-full right-0 pt-4 w-60 transition-all duration-200 z-50">
                        <div className="rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col bg-white dark:bg-slate-800 p-4 text-left">
                          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                            <img
                              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"}
                              alt="User Avatar"
                              className="w-10 h-10 rounded-full object-cover border border-[#026E5F] dark:border-teal-500"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">{user?.full_name || "Nguyễn Văn A"}</span>
                              <span className="text-xs text-gray-500 mt-0.5">{t(getRoleName(getUserRole(user)))}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 py-3">
                            {user && getUserRole(user) !== ROLES.CUSTOMER && (
                              <Link
                                to={getRoleDashboard(getUserRole(user))}
                                onClick={() => setIsMobileUserMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                              >
                                <Icon icon="lucide:layout-dashboard" className="text-lg text-gray-400" />
                                <span>{t("Bảng điều khiển")}</span>
                              </Link>
                            )}
                            <Link
                              to="/ho-so"
                              onClick={() => setIsMobileUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                            >
                              <Icon icon="mdi:account-outline" className="text-lg text-gray-400" />
                              <span>{t("Hồ sơ cá nhân")}</span>
                            </Link>
                            <Link
                              to="/lich-su-dat-lich"
                              onClick={() => setIsMobileUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:bg-slate-700/50 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-all duration-200"
                            >
                              <Icon icon="mdi:calendar-clock-outline" className="text-lg text-gray-400" />
                              <span>{t("Lịch sử đặt lịch")}</span>
                            </Link>
                          </div>

                          <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50">
                            <button
                              onClick={() => {
                                handleLogout();
                                setIsMobileUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold transition-all duration-200 cursor-pointer"
                            >
                              <Icon icon="material-symbols:logout" className="text-lg" />
                              <span>{t("Đăng xuất")}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/dang-nhap"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/20 whitespace-nowrap transition-all duration-200"
                >
                  <Icon icon="lucide:log-in" className="text-base shrink-0" />
                  <span>{t("Đăng nhập")}</span>
                </Link>
              )}
            </div>


            <div className="hidden lg:flex flex-1 justify-end items-center gap-6">
              {/* Language picker — own py = full header height */}
              <div className={`relative group h-full flex items-center cursor-pointer px-3 transition-all duration-300 ${isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"}`}>
                <div className="flex items-center gap-2 cursor-pointer font-medium text-base text-white transition-colors">
                  <Icon icon={isEn ? "twemoji:flag-us-outlying-islands" : "twemoji:flag-vietnam"} className="text-2xl shrink-0" />
                  <span>{isEn ? t("English") : t("Việt Nam")}</span>
                  <Icon icon="ri:arrow-drop-down-line" className="text-3xl -ml-1" />
                </div>

                <div className="absolute top-full right-0 w-max min-w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="rounded-b-lg shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col bg-white dark:bg-slate-800">
                    <div onClick={() => changeLanguage("vn")} className="flex items-center gap-3 px-4 py-3 cursor-pointer dark:hover:bg-slate-700 transition-colors group/item">
                      <Icon icon="twemoji:flag-vietnam" className="text-2xl shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-base text-gray-700 dark:text-gray-200 group-hover/item:text-teal-700 dark:group-hover/item:text-teal-400 font-medium transition-colors">
                        {t("Việt Nam")}
                      </span>
                    </div>
                    <div onClick={() => changeLanguage("en")} className="flex items-center gap-3 px-4 py-3 cursor-pointer dark:hover:bg-slate-700 rounded-b-lg transition-colors group/item">
                      <Icon icon="twemoji:flag-us-outlying-islands" className="text-2xl shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-base text-gray-700 dark:text-gray-200 group-hover/item:text-teal-700 dark:group-hover/item:text-teal-400 font-medium transition-colors">
                        {t("English")}
                      </span>
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
                  <Icon icon={isDarkMode ? "tdesign:mode-dark" : "entypo:light-up"} className="text-xl" />
                </button>
                <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs cursor-pointer self-center hover:scale-105">
                  <Icon icon="boxicons:location" className="text-xl" />
                </div>
                {/* 
                  Code cũ nút Tin nhắn / Chat trên Header (đã ghi chú lại, không xóa):
                  {isLoggedIn && (
                    <button
                      onClick={handleChatIconClick}
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs cursor-pointer self-center hover:scale-105 relative"
                    >
                      <Icon icon="material-symbols:chat-outline" className="text-xl" />
                      {chatUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-700">
                          {chatUnreadCount}
                        </span>
                      )}
                    </button>
                  )}
                */}
                <div className="relative group h-full flex items-center cursor-pointer">
                  <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/80 dark:border-slate-600 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-600/80 shadow-xs self-center hover:scale-105 relative">
                    <Icon icon="mdi:bell-outline" className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-700">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Desktop Notification Dropdown */}
                  <div className="absolute top-full right-0 w-96 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="rounded-b-xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col bg-white dark:bg-slate-800 text-left text-gray-800 dark:text-white h-120 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-2 relative">
                        <span className="font-bold text-xl text-gray-900 dark:text-white">{t("Thông báo")}</span>
                        <div className="relative">
                          <button
                            onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full transition-colors cursor-pointer"
                          >
                            <Icon icon="lucide:ellipsis" className="text-xl" />
                          </button>

                          {/* Popover Menu */}
                          {isNotifMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsNotifMenuOpen(false)} />
                              <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700/50 py-1.5 z-50 text-sm">
                                <button
                                  onClick={() => {
                                    markAllAsRead();
                                    setIsNotifMenuOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 flex items-center gap-2.5 font-medium cursor-pointer"
                                >
                                  <Icon icon="lucide:check-check" className="text-teal-600 dark:text-teal-400 text-lg" />
                                  <span>{t("Đánh dấu tất cả đã đọc")}</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex gap-2 px-4 pb-2 border-b border-gray-100 dark:border-gray-700/30 text-xs">
                        <button
                          onClick={() => setNotifFilter("all")}
                          className={`px-3 py-1.5 font-semibold rounded-full cursor-pointer transition-colors ${
                            notifFilter === "all" ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400" : "hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {t("Tất cả")}
                        </button>
                        <button
                          onClick={() => setNotifFilter("unread")}
                          className={`px-3 py-1.5 font-semibold rounded-full cursor-pointer transition-colors ${
                            notifFilter === "unread"
                              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                              : "hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {t("Chưa đọc")}
                        </button>
                      </div>

                      {/* Notification List (scroll flush to right edge) */}
                      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 flex flex-col py-1">
                        {notifLoading && notifications.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center py-12">
                            <Icon icon="lucide:loader-2" className="text-2xl text-teal-500 animate-spin" />
                          </div>
                        ) : displayedNotifications.length > 0 ? (
                          <>
                            {notifFilter === "all" && <div className="px-4 py-2 text-xs font-bold text-gray-900 dark:text-white">{t("Hôm nay")}</div>}
                            {displayedNotifications.map((notif) => {
                              const meta = NOTIF_META[notif.type as NotificationType] ?? DEFAULT_META;
                              const isUnread = !notif.is_read;

                              const timeLabel = formatVietnamDateTime(notif.created_at);
                              return (
                                <div
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`group/item flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-all duration-200 ${
                                    isUnread ? "bg-teal-50/40 dark:bg-teal-950/10 hover:bg-teal-50 dark:hover:bg-teal-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                  }`}
                                >
                                  {/* Avatar / Type icon */}
                                  <div className={`w-11 h-11 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                                    <Icon icon={meta.icon} className={`text-xl ${meta.fg}`} />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug wrap-break-word ${isUnread ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-700 dark:text-gray-300"}`}>
                                      {notif.title}
                                    </p>
                                    {notif.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: notif.message }} />}
                                    {notif.type === "booking" && (
                                      <span className="inline-flex items-center gap-1 text-xs text-[#026E5F] dark:text-teal-400 font-bold mt-1.5 hover:underline">
                                        <Icon icon="material-symbols:arrow-forward-rounded" className="text-xs" />
                                        {t("Xem chi tiết")}
                                      </span>
                                    )}
                                    <span className={`text-xs mt-1 block ${isUnread ? "text-teal-600 dark:text-teal-400 font-semibold" : "text-gray-400"}`}>{timeLabel}</span>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col items-center gap-1 shrink-0">
                                    {isUnread && <div className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-1" />}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(notif.id);
                                      }}
                                      className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded-full transition-all cursor-pointer"
                                      title={t("Xoá")}
                                    >
                                      <Icon icon="lucide:x" className="text-xs" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Load-more button */}
                            {notifPage < notifLastPage && (
                              <button
                                onClick={() => loadMoreNotifications()}
                                disabled={notifLoading}
                                className="mx-4 my-2 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {notifLoading ? <Icon icon="lucide:loader-2" className="text-sm animate-spin" /> : t("Xem thêm")}
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                            <Icon icon="mdi:bell-off-outline" className="text-4xl opacity-40" />
                            <span>{notifFilter === "unread" ? t("Không có thông báo chưa đọc") : t("Không có thông báo nào")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {isLoggedIn ? (
                  <div className="relative group h-full flex items-center cursor-pointer">
                    <div className="border-2 border-white/50 hover:border-white rounded-full p-0.5 transition-all duration-300 flex items-center justify-center cursor-pointer">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <Icon icon="lucide:circle-user" className="text-3xl cursor-pointer hover:text-teal-200 hover:scale-110 drop-shadow-sm" />
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
                            <span className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">{user?.full_name || "Nguyễn Văn A"}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{t(getRoleName(getUserRole(user)))}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 py-3">
                          {user && getUserRole(user) !== ROLES.CUSTOMER && (
                            <Link
                              to={getRoleDashboard(getUserRole(user))}
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
                  <div className="flex items-center gap-2">
                    <Link
                      to="/dang-nhap"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/15 transition-all duration-200"
                    >
                      <Icon icon="lucide:log-in" className="text-base" />
                      <span>{t("Đăng nhập")}</span>
                    </Link>
                    <Link
                      to="/dang-ky"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-white text-teal-700 hover:bg-teal-50 shadow-sm transition-all duration-200"
                    >
                      <Icon icon="lucide:user-plus" className="text-base" />
                      <span>{t("Đăng ký")}</span>
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={handlePostJobClick}
                className="bg-white dark:bg-teal-500 text-teal-700 dark:text-white dark:hover:bg-teal-400 hover:text-teal-800 font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-base"
              >
                {t("Đăng bài tuyển")}
              </button>
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.to}
                      className="text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 dark:hover:bg-slate-700 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300"
                      onClick={toggleMobileMenu}
                    >
                      {t(link.name)}
                    </Link>
                  ))}
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
                    className="w-full bg-[#026E5F] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-medium px-6 py-3.5 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 cursor-pointer"
                    onClick={handlePostJobClickMobile}
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
      <div className="w-full bg-[#066d72] dark:bg-slate-800 pointer-events-none select-none" aria-hidden="true">
        <div className="w-full px-4 md:px-16 mx-auto">
          <div className={`flex items-center justify-center transition-all duration-300 ${isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"}`}>
            <span className="text-white font-bold text-xl md:text-3xl invisible">Gia Đình Việt</span>
          </div>
        </div>
      </div>
    </>
  );
};
