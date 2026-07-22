import { ROLES } from "./roles";

const AVATAR_ADMIN =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA0N8i3T-XVxB0b6flIZ774aHkRfqFllMvUfRdy1LQw_83z4ofWxUYNv2aLhJnGD_5fPRnO332KHfQoRiV1rmIFLIZP_Alu_ycjAZ-bp_BJ56lQIHjdEQiRF1GrvUAifRjvxFW2VKYcd2hZZAkQpGLXHq4dY73aIpLd2CN9JgCoOfhdd1I6KA6bA4oScjHl1kD4PpgE4KvYNxHMyxcXAksasxtYSW7FP3gtuPhMPDzj3bsmXEjGZvpPZ-Q8lRdW_Xyfbfebl0e1Gw";

const AVATAR_DEFAULT =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop";

export const ROLE_THEME = {
  [ROLES.ADMIN]: {
    brandBg: "bg-cyan-900",
    brandText: "text-cyan-900 dark:text-cyan-400",
    subtitle: "Management Portal",
    activeClass:
      "text-cyan-700 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/30 border-l-4 border-cyan-700 dark:border-cyan-400 rounded-l-none",
    hoverClass:
      "text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: AVATAR_ADMIN },
  [ROLES.OPERATOR]: {
    brandBg: "bg-emerald-800",
    brandText: "text-emerald-800 dark:text-emerald-400",
    subtitle: "QTV Operations",
    activeClass:
      "text-emerald-800 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-l-4 border-emerald-800 dark:border-emerald-400 rounded-l-none",
    hoverClass:
      "text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: AVATAR_DEFAULT },
  [ROLES.HELPER]: {
    brandBg: "bg-emerald-700",
    brandText: "text-emerald-700 dark:text-emerald-400",
    subtitle: "Kênh Người Giúp Việc",
    activeClass:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-l-4 border-emerald-700 dark:border-emerald-400 rounded-l-none",
    hoverClass:
      "text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: AVATAR_DEFAULT },
  [ROLES.CUSTOMER]: {
    brandBg: "bg-violet-700",
    brandText: "text-violet-700 dark:text-violet-400",
    subtitle: "Kênh Khách Hàng",
    activeClass:
      "text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30 border-l-4 border-violet-700 dark:border-violet-400 rounded-l-none",
    hoverClass:
      "text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
    defaultAvatar: AVATAR_DEFAULT } };
