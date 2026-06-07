import { Outlet } from "react-router-dom";
import { Header } from "../pages/Header";
import { Footer } from "../pages/Footer";

export const LoginLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full bg-[#066d72] dark:bg-slate-800">
        <div className="w-full px-4 md:px-16 mx-auto">
          <Header />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      <div className="w-full px-4 md:px-16 mx-auto">
        <Footer></Footer>
      </div>
    </div>
  );
};
