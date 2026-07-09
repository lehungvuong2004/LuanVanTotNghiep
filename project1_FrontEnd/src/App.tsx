import { Route, Routes, HashRouter } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { Errors404 } from "./components/Errors404";
import { Contact } from "./pages/Contact";
import { LoginLayout } from "./layouts/LoginLayout";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import ForgetPassword from "./pages/ForgetPassword";
import PostAJob from "./pages/PostAJob";
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
// [NOTE] Trang Thanh toán độc lập đã được loại bỏ.
// Chức năng thanh toán được tích hợp trực tiếp vào trang Lịch sử đặt lịch (/lich-su-dat-lich).
// import { Payment } from "./pages/Payment";
import { PaymentReturn } from "./pages/PaymentReturn";
import { DashboardManager } from "./layouts/DashboardManager";
import { Schedules } from "./DashBoard/Admin/Schedules";
import { Services } from "./DashBoard/Admin/Services";
import { ServiceCategories } from "./DashBoard/Admin/Service_Categories";
import { DashboardOverview } from "./DashBoard/Admin/DashboardOverview";
import { Booking } from "./DashBoard/Admin/Booking";
import { Banners } from "./DashBoard/Admin/Banner";
import { PaymentsRefunds } from "./DashBoard/Admin/PayMent & Refund";
import { Account } from "./DashBoard/Admin/Users";
import { Helpers } from "./DashBoard/Admin/Helper";
import { Reviews } from "./DashBoard/Admin/Reviews";
import { NewsAdmin } from "./DashBoard/Admin/News";
import { StaffReviews } from "./DashBoard/Operator/Reviews";
import { DashboardStaff } from "./layouts/DashboardStaff";
import { FollowingOrder } from "./DashBoard/Operator/FollowingOrder";
import { ApplicationReview } from "./DashBoard/Operator/ApplicationReview";
import { HelperReview } from "./DashBoard/Operator/HelperReview";


function App() {
  useEffect(() => {
    // VNPay strips hashes from returnUrl, resulting in query parameters before hash.
    // We detect and route them to HashRouter's /thanh-toan/ket-qua route.
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
          <Route path="/thanh-toan/ket-qua" element={<PaymentReturn />} />
          {/* [NOTE] Route thanh toán độc lập đã loại bỏ — tích hợp vào /lich-su-dat-lich */}
          {/* <Route path="/thanh-toan" element={<Payment />} /> */}
        </Route>
        <Route element={<LoginLayout />}>
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/quen-mat-khau" element={<ForgetPassword />} />
        </Route>
        <Route path="/admin" element={<DashboardManager />}>
          <Route index  element={<DashboardOverview />} />
          <Route path="dashboard"  element={<DashboardOverview />} />
          <Route path="users" element={<Account />} />
          <Route path="helpers" element={<Helpers />} />
          <Route path="categories" element={<ServiceCategories />} />
          <Route path="services" element={<Services />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="bookings" element={<Booking />} />
          <Route path="banners" element={<Banners />} />
          <Route path="news" element={<NewsAdmin />} />
          <Route path="payments" element={<PaymentsRefunds defaultTab="payments" />} />
          <Route path="refunds" element={<PaymentsRefunds defaultTab="refunds" />} />
          <Route path="reviews" element={<Reviews />} />
        </Route>
        <Route path="/operator" element={<DashboardStaff />}>
          <Route index element={<StaffReviews />} />
          <Route path="dashboard" element={<StaffReviews />} />
          <Route path="reviews" element={<StaffReviews />} />
          <Route path="bookings" element={<FollowingOrder />} />
          <Route path="job-posts" element={<ApplicationReview />} />
          <Route path="helpers" element={<HelperReview />} />
        </Route>
        <Route path="*" element={<Errors404 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
