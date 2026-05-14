import { Outlet } from "react-router-dom";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
export const MainLayout = () => (
  <div className="main-layout">
    <div className="">
      <Header />
    </div>
    <div className="page-content">
      <Outlet />
    </div>
    <div className="">
      <Footer />
    </div>
  </div>
);
