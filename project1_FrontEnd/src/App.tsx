import { Route, Routes, HashRouter } from "react-router-dom";
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
import { DashboardManager } from "./layouts/DashboardManager";
import { Schedules } from "./DashBoard/Admin/Schedules";
import { Services } from "./DashBoard/Admin/Services";
import { DashboardOverview } from "./DashBoard/Admin/DashboardOverview";
import { Booking } from "./DashBoard/Admin/Booking";
import { Banners } from "./DashBoard/Admin/Banner";
import { PaymentsRefunds } from "./DashBoard/Admin/PayMent & Refund";
import { Account } from "./DashBoard/Admin/Account";
import { Reviews } from "./DashBoard/Admin/Reviews";
import { StaffReviews } from "./DashBoard/Staff/Reviews";
import { DashboardStaff } from "./layouts/DashboardStaff";

function App() {
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
        </Route>
        <Route element={<LoginLayout />}>
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/quen-mat-khau" element={<ForgetPassword />} />
        </Route>
        <Route path="/admin" element={<DashboardManager />}>
          {/* <Route  element={<DashboardOverview />} /> */}
          <Route path="dashboard"  index element={<DashboardOverview />} />
          <Route path="users" element={<Account />} />
          <Route path="services" element={<Services />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="bookings" element={<Booking />} />
          <Route path="banners" element={<Banners />} />
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
