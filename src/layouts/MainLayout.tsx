import { Outlet } from "react-router-dom";
import { Footer } from "../pages/Footer";
import { Header } from "../pages/Header";
import InformationMarquee from "../constants/description";

export const MainLayout = () => (
  <>
  <div className="w-full min-h-screen">
    {/* Header */}
    <div className="w-full bg-[#066d72]">
      <div className="container-layout">
        <Header />
      </div>
    </div>

    {/* infomation */}
    <div className="">
      <InformationMarquee />
    </div>

    {/* Main */}
    {/* <main className="w-full"> */}
      <div className="container-layout">
        <Outlet />
      </div>
    {/* </main> */}

    {/* Footer */}
    {/* <div className="w-full bg-gray-200"> */}
      <div className="container-layout">
        <Footer />
      </div>
    </div>
  {/* </div> */}
</>
);