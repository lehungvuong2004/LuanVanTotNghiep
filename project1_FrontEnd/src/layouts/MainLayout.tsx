import { Outlet } from "react-router-dom";
import { Footer } from "../pages/Footer";
import { Header } from "../pages/Header";
import InformationMarquee from "../constants/description";

export const MainLayout = () => (
  <>
  <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300">
    {/* Header */}
    <div className="w-full bg-[#066d72] dark:bg-slate-800">
      <div className="container-layout">
        <Header />
      </div>
    </div>

    {/* infomation */}
    <div className="">
      <InformationMarquee />
    </div>

    {/* Main */}
      <div className="w-full">
        <Outlet />
      </div>

    {/* Footer */}
    {/* <div className="w-full bg-gray-200"> */}
      <div className="container-layout">
        <Footer />
      </div>
    </div>
  {/* </div> */}
</>
);