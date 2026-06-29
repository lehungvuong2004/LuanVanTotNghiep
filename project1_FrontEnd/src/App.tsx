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
import { Recruitment } from "./pages/Recruitment";
import { HistoryPage } from "./pages/History";
import { News } from "./pages/News";
import { NewsDetail } from "./pages/NewsDetail";
import { Profile } from "./pages/Profile";
import { Pricing } from "./pages/Pricing";
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
import { StaffReviews } from "./DashBoard/Staff/Reviews";
import { DashboardStaff } from "./layouts/DashboardStaff";

function App() {
  useEffect(() => {
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
          <Route path="/tuyen-dung" element={<Recruitment />} />
          <Route path="/dang-bai-tuyen" element={<PostAJob />} />
          <Route path="/lich-su-dat-lich" element={<HistoryPage />} />
          <Route path="/tin-tuc" element={<News />} />
          <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
          <Route path="/ho-so" element={<Profile />} />
          <Route path="/pricing" element={<Pricing />} />
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
        </Route>
        <Route path="*" element={<Errors404 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
