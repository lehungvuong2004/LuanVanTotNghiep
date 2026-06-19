import { Outlet } from "react-router-dom";
import { Footer } from "../pages/Footer";
import { Header } from "../components/Header";
import InformationMarquee from "../components/Description";

export const MainLayout = () => (
  <>
  <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300">
    {/* Header */}
    <Header />

    {/* Information ticker */}
    <InformationMarquee />

    {/* Main */}
    <div className="w-full px-4 md:px-16 mx-auto">
      <Outlet />
    </div>

    {/* Footer */}
    <div className="w-full px-4 md:px-16 mx-auto">
      <Footer />
    </div>
  </div>
  </>
);