import { Route, Routes, HashRouter } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { Errors404 } from "./components/Errors404";
import { Contact } from "./pages/Contact";
import { LoginLayout } from "./layouts/LoginLayout";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import { ForgetPassword } from "./pages/ForgetPassword";
import { PostAJob } from "./pages/PostAJob";
import { Home } from "./pages/Home";
import { Service } from "./pages/Service";
import { ServiceDetail } from "./pages/ServiceDetail";
import { HelperDetail } from "./pages/HelperDetail";
import { Recruitment } from "./pages/Recruitment";
import { HistoryPage } from "./pages/History";
import { News } from "./pages/News";
import { NewsDetail } from "./pages/NewsDetail";
import { Profile } from "./pages/Profile";
import { Pricing } from "./pages/Pricing";
import { TermsOfService } from "./pages/TermsOfService";
import { PaymentReturn } from "./pages/PaymentReturn";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ROLES } from "./constants/roles";
import { Schedules } from "./dashboard/Admin/Schedules";
import { Services } from "./dashboard/Admin/Services";
import { ServiceCategories } from "./dashboard/Admin/Service_Categories";
import { DashboardOverview } from "./dashboard/Admin/DashboardOverview";
import { Booking } from "./dashboard/Admin/Booking";
import { Banners } from "./dashboard/Admin/Banner";
import { Payments } from "./dashboard/Admin/Payments";
import { Refunds } from "./dashboard/Admin/Refunds";
import { Users } from "./dashboard/Admin/Users";
import { Helpers } from "./dashboard/Admin/Helper";
import { Reviews } from "./dashboard/Admin/Reviews";
import { NewsAdmin } from "./dashboard/Admin/News";
import { Role as RolePage } from "./dashboard/Admin/Role";
import { PermissionsMatrix } from "./dashboard/Admin/Permissions";
import { ActivityLogs } from "./dashboard/Admin/Log";
import { ApplicationReview } from "./dashboard/Operator/JobPosts";
import { Reports } from "./dashboard/Admin/Reports";
import { HelperOverview } from "./dashboard/Helper/Overview";
import { HelperAvailabilityPage } from "./dashboard/Helper/Availabilities";
import { HelperReviewsPage } from "./dashboard/Helper/Reviews";
import { Contacts } from "./dashboard/Admin/Contacts";
import { Notifications } from "./dashboard/Admin/Notifications";
import { ChatbotKnowledgeBase } from "./dashboard/Admin/ChatbotKnowledge";

function App() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("vnp_ResponseCode") && searchParams.has("vnp_TxnRef")) {
      const hashQuery = searchParams.toString();
      window.location.href = `${window.location.origin}/#/thanh-toan/ket-qua?${hashQuery}`;
      return;
    }

    const sessionActive = sessionStorage.getItem("session_active");
    // console.log(sessionActive);
    if (!sessionActive) {
      const rememberMe = localStorage.getItem("remember_me");
      if (rememberMe !== "true") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
      sessionStorage.setItem("session_active", "true");
    }
  }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/lien-he" element={<Contact />} />
            <Route path="/dich-vu" element={<Service />} />
            <Route path="/dich-vu/:id" element={<ServiceDetail />} />
            <Route path="/nguoi-giup-viec/:id" element={<HelperDetail />} />
            <Route path="/tuyen-dung" element={<Recruitment />} />
            <Route path="/dang-bai-tuyen" element={<PostAJob />} />
            <Route path="/lich-su-dat-lich" element={<HistoryPage />} />
            <Route path="/tin-tuc" element={<News />} />
            <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
            <Route path="/ho-so" element={<Profile />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/thanh-toan/ket-qua" element={<PaymentReturn />} />
          </Route>
          <Route element={<LoginLayout />}>
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/quen-mat-khau" element={<ForgetPassword />} />
          </Route>
          <Route path="/admin" element={<DashboardLayout allowedRole={ROLES.ADMIN} />}>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="users" element={<Users />} />
            <Route path="helpers" element={<Helpers />} />
            <Route path="categories" element={<ServiceCategories />} />
            <Route path="services" element={<Services />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="bookings" element={<Booking />} />
            <Route path="job-posts" element={<ApplicationReview />} />
            <Route path="banners" element={<Banners />} />
            <Route path="news" element={<NewsAdmin />} />
            <Route path="payments" element={<Payments />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="chatbot-knowledge" element={<ChatbotKnowledgeBase />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="roles" element={<RolePage />} />
            <Route path="permissions" element={<PermissionsMatrix />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
          <Route path="/operator" element={<DashboardLayout allowedRole={ROLES.OPERATOR} />}>
            <Route index element={<Reviews />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
            <Route path="bookings" element={<Booking />} />
            <Route path="job-posts" element={<ApplicationReview />} />
            <Route path="helpers" element={<Helpers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="services" element={<Services />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="chatbot-knowledge" element={<ChatbotKnowledgeBase />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
          <Route path="/helper" element={<DashboardLayout allowedRole={ROLES.HELPER} />}>
            <Route index element={<HelperOverview />} />
            <Route path="availabilities" element={<HelperAvailabilityPage />} />
            <Route path="reviews" element={<HelperReviewsPage />} />
          </Route>
          <Route path="*" element={<Errors404 />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;
