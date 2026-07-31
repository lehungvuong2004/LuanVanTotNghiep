import { Outlet } from "react-router-dom";
import { Footer } from "../pages/Footer";
import { Header } from "../components/Header";
import InformationMarquee from "../components/Description";
import { FloatingActionMenu } from "../components/FloatingActionMenu";

export const MainLayout = () => (
  <>
    <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300 relative">
      {/* Header */}
      <Header />

      {/* Information ticker */}
      <InformationMarquee />

      {/* Main */}
      <main className="w-full px-4 md:px-16 mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <div className="w-full px-4 md:px-16 mx-auto">
        <Footer />
      </div>

      {/* Menu hành động nổi (Scroll to top & Chatbot) */}
      <FloatingActionMenu />
    </div>
  </>
);
