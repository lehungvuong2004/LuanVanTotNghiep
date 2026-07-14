import { ROLES } from "./roles";

export const NAV_ITEMS = {
  // ADMIN PANEL
  [ROLES.ADMIN]: [
    { name: "Thống kê & Báo cáo",          path: "/admin/dashboard",      icon: "icon-park-outline:analysis",                        permission: "dashboard.view"      },
    { name: "Quản lý Người dùng",           path: "/admin/users",           icon: "material-symbols:group-outline-rounded",            permission: "users.view"          },
    { name: "Kiểm duyệt Hồ sơ",            path: "/admin/helpers",         icon: "material-symbols:engineering-outline-rounded",      permission: "helper_profile.verify"},
    { name: "Quản lý Dịch vụ",             path: "/admin/services",        icon: "grommet-icons:services",                            permission: "services.view"       },
    { name: "Quản lý Danh mục Phân loại",  path: "/admin/categories",      icon: "boxicons:categories",                               permission: "categories.view"     },
    { name: "Quản lý Thanh toán",           path: "/admin/payments",        icon: "material-symbols:payments-outline-rounded",         permission: "payments.view"       },
    { name: "Quản lý Hoàn tiền",            path: "/admin/refunds",         icon: "material-symbols:undo-rounded",                     permission: "refunds.view"        },
    { name: "Quản lý Báo cáo",             path: "/admin/reports",         icon: "material-symbols:report-outline",                   permission: "reports.view"        },
    { name: "Quản lý Tin nhắn",            path: "/admin/messages",        icon: "material-symbols:chat-outline",                     permission: "messages.view"       },
    { name: "Quản lý Thông báo",           path: "/admin/notifications",   icon: "material-symbols:notifications-outline-rounded",    permission: "notifications.view"  },
    { name: "Quản lý Liên hệ",             path: "/admin/contacts",        icon: "material-symbols:contact-phone-outline-rounded",    permission: "contacts.view"       },
    { name: "Quản lý Tin tức",             path: "/admin/news",            icon: "material-symbols:news",                             permission: "news.view"           },
    { name: "Quản lý Banner",              path: "/admin/banners",         icon: "material-symbols:ad-units-outline-rounded",         permission: "banners.view"        },
    { name: "Lịch sử Hoạt động",           path: "/admin/activity-logs",   icon: "material-symbols:history-rounded",                  permission: "activity_logs.view"  },
    { name: "Vai trò hệ thống",            path: "/admin/roles",           icon: "material-symbols:shield-person-outline-rounded",    permission: "roles.view"          },
    { name: "Ma trận quyền hạn",           path: "/admin/permissions",     icon: "dinkie-icons:display-dot-matrix",          permission: "permissions.view"    },
  ],

  // OPERATOR PANEL
  [ROLES.OPERATOR]: [
    { name: "Kiểm duyệt Hồ sơ Người giúp việc", path: "/operator/helpers",        icon: "material-symbols:engineering-outline",              permission: "helper_profile.verify"},
    { name: "Quản lý Bài đăng Tuyển dụng",       path: "/operator/job-posts",      icon: "material-symbols:post-add-rounded",                 permission: "job_posts.approve"   },
    { name: "Quản lý Đặt lịch",                  path: "/operator/bookings",       icon: "material-symbols:calendar-today-outline-rounded",   permission: "bookings.view"       },
    { name: "Quản lý Thanh toán",                path: "/operator/payments",       icon: "material-symbols:payments-outline-rounded",         permission: "payments.history"    },
    { name: "Quản lý Hoàn tiền",                 path: "/operator/refunds",        icon: "material-symbols:undo-rounded",                     permission: "refunds.process"     },
    { name: "Quản lý Dịch vụ",                   path: "/operator/services",       icon: "grommet-icons:services",                            permission: "services.view"       },
    { name: "Quản lý Đánh giá",                  path: "/operator/reviews",        icon: "material-symbols:rate-review-outline-rounded",      permission: "reviews.view"        },
    { name: "Quản lý Báo cáo",                   path: "/operator/reports",        icon: "material-symbols:report-outline",                   permission: "reports.process"     },
    { name: "Quản lý Liên hệ",                   path: "/operator/contacts",       icon: "material-symbols:contact-phone-outline-rounded",    permission: "contacts.process"    },
    { name: "Quản lý Tin nhắn",                  path: "/operator/messages",       icon: "material-symbols:chat-outline",                     permission: "messages.view"       },
    { name: "Quản lý Thông báo",                 path: "/operator/notifications",  icon: "material-symbols:notifications-outline-rounded",    permission: "notifications.view"  },
  ],

  // HELPER PANEL
  [ROLES.HELPER]: [
    { name: "Hồ sơ Cá nhân",        path: "/ho-so",                     icon: "material-symbols:person-outline-rounded",           permission: "helper_profile.view"  },
    { name: "Khu vực Làm việc",      path: "/helper/areas",              icon: "material-symbols:map-outline",                      permission: "working_areas.view"   },
    { name: "Thông báo",             path: "/helper/notifications",      icon: "material-symbols:notifications-outline-rounded",    permission: "notifications.view"   },
    { name: "Kỹ năng",               path: "/helper/skills",             icon: "material-symbols:star-outline",                     permission: "skills.view"          },
    { name: "Lịch Rảnh",             path: "/helper/availabilities",     icon: "material-symbols:calendar-today-outline-rounded",   permission: "availabilities.view"  },
    { name: "Hồ sơ Ứng tuyển",      path: "/helper/dashboard",          icon: "fluent-mdl2:recruitment-management",                permission: "job_applications.view"},
    { name: "Quản lý Đặt lịch",     path: "/lich-su-dat-lich",          icon: "material-symbols:calendar-month-outline-rounded",   permission: "bookings.view"        },
    { name: "Nhật ký Công việc",     path: "/helper/work-logs",          icon: "material-symbols:history-edu-outline",              permission: "work_logs.checkin"    },
    { name: "Tin nhắn",              path: "/helper/messages",           icon: "material-symbols:chat-outline",                     permission: "messages.view"        },
    { name: "Đánh giá",              path: "/helper/reviews",            icon: "material-symbols:rate-review-outline-rounded",      permission: "reviews.view"         },
    { name: "Thanh toán & Thu nhập", path: "/helper/payments",           icon: "material-symbols:payments-outline-rounded",         permission: "payments.history"     },
  ],
  // CUSTOMER PANEL
  [ROLES.CUSTOMER]: [] };
