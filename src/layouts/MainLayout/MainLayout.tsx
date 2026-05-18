import { Outlet } from "react-router-dom";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import InformationMarquee from "../../constants/description";

export const MainLayout = () => (
  <>
  <div className="w-full min-h-screen">
    {/* Header */}
    <div className="w-full bg-gray-300">
      <div className="container-layout">
        <Header />
      </div>
    </div>

    {/* infomation */}
    <div className="">
      <InformationMarquee />
    </div>

    {/* Main */}
    <main className="w-full">
      <div className="container-layout">
        <Outlet />
      </div>
    </main>

    {/* Footer */}
    <div className="w-full bg-gray-100">
      <div className="container-layout">
        <Footer />
      </div>
    </div>
  </div>
</>
);