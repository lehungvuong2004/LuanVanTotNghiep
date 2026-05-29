import { Outlet } from "react-router-dom";
import { Header } from "../pages/Header";
import { Footer } from "../pages/Footer";

export const LoginLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full bg-[#066d72]">
        <div className="container-layout">
          <Header />
        </div>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>

      <div className="container-layout">
        <Footer></Footer>
      </div>
    </div>
  );
};
