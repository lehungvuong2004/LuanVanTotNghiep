import { Route, Routes, BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { useEffect, lazy, Suspense } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { LoginLayout } from "./layouts/LoginLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Loading } from "./components/Commom";
import { ROLES } from "./constants/roles";

// Lazy-loaded basic pages and components
const Errors404 = lazy(() => import("./components/Errors404"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const PostAJob = lazy(() => import("./pages/PostAJob"));
const Home = lazy(() => import("./pages/Home"));
const Service = lazy(() => import("./pages/Service"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const HelperDetail = lazy(() => import("./pages/HelperDetail"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const HistoryPage = lazy(() => import("./pages/History"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PaymentReturn = lazy(() => import("./pages/PaymentReturn"));
const Favorites = lazy(() => import("./pages/Favorites"));

// Admin Dashboard Components
const Schedules = lazy(() => import("./DashBoard/Admin/Schedules"));
const Services = lazy(() => import("./DashBoard/Admin/Services"));
const ServiceCategories = lazy(() => import("./DashBoard/Admin/Service_Categories"));
const DashboardOverview = lazy(() => import("./DashBoard/Admin/DashboardOverview"));
const Booking = lazy(() => import("./DashBoard/Admin/Booking"));
const Banners = lazy(() => import("./DashBoard/Admin/Banner"));
const Payments = lazy(() => import("./DashBoard/Admin/Payments"));
const Refunds = lazy(() => import("./DashBoard/Admin/Refunds"));
const Users = lazy(() => import("./DashBoard/Admin/Users"));
const Helpers = lazy(() => import("./DashBoard/Admin/Helper"));
const Reviews = lazy(() => import("./DashBoard/Admin/Reviews"));
const NewsAdmin = lazy(() => import("./DashBoard/Admin/News"));
const RolePage = lazy(() => import("./DashBoard/Admin/Role"));
const PermissionsMatrix = lazy(() => import("./DashBoard/Admin/Permissions"));
const ActivityLogs = lazy(() => import("./DashBoard/Admin/Log"));
const Contacts = lazy(() => import("./DashBoard/Admin/Contacts"));
const Notifications = lazy(() => import("./DashBoard/Admin/Notifications"));
const ChatbotKnowledgeBase = lazy(() => import("./DashBoard/Admin/ChatbotKnowledge"));

// Operator Dashboard Components
const ApplicationReview = lazy(() => import("./DashBoard/Operator/JobPosts"));
const Reports = lazy(() => import("./DashBoard/Admin/Reports"));

// Helper Dashboard Components
const HelperOverview = lazy(() => import("./DashBoard/Helper/Overview"));
const HelperAvailabilityPage = lazy(() => import("./DashBoard/Helper/Availabilities"));
const HelperReviewsPage = lazy(() => import("./DashBoard/Helper/Reviews"));

function App() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("vnp_ResponseCode") && searchParams.has("vnp_TxnRef")) {
      const hashQuery = searchParams.toString();
      window.location.href = `${window.location.origin}/#/thanh-toan/ket-qua?${hashQuery}`;
      return;
    }

    const sessionActive = sessionStorage.getItem("session_active");
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
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Suspense fallback={<Loading fullScreen={true} />}>
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
              <Route path="/danh-sach-yeu-thich" element={<Favorites />} />
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
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
