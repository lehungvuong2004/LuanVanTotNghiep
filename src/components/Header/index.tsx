import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    // bằng changeLanguage("en")
    i18n.changeLanguage(lng);
  };

  const isEn = i18n.language === "en"; // vào ra false bởi vì tiếng việt

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative w-full">
      <div className="flex items-center justify-between h-20 md:h-24 w-full">
        
        <div className="flex-1 lg:hidden flex items-center">
          <Icon 
            icon="gg:menu-round" 
            className="text-4xl text-white cursor-pointer" 
            onClick={toggleMobileMenu}
          />
        </div>

        {/* nav left destop */}
        <nav className="hidden lg:flex flex-1 items-center gap-6 text-white font-medium text-base">
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 shadow-sm">
            <Icon icon="bitcoin-icons:menu-outline" className="text-3xl" /> {t("Danh Mục")}
          </div>
          <Link to="/about" className="cursor-pointer hover:text-teal-200 hover:-translate-y-0.5 transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-teal-200 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
            {t("Trang Chủ")}
          </Link>
          <Link to="/about" className="cursor-pointer hover:text-teal-200 hover:-translate-y-0.5 transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-teal-200 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
            {t("Về chúng tôi")}
          </Link>
          <Link to="/jobs" className="cursor-pointer hover:text-teal-200 hover:-translate-y-0.5 transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-teal-200 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
            {t("Thông tin tuyển dụng")}
          </Link>
          <Link to="/lien-he" className="cursor-pointer hover:text-teal-200 hover:-translate-y-0.5 transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-teal-200 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
            {t("Liên hệ")}
          </Link>
        </nav>

        {/* Logo (Center) */}
        <div className="flex items-center justify-center shrink-0">
          <Link to="/" className="text-white font-bold text-2xl md:text-3xl">
            Home Layout
          </Link>
        </div>

        {/* Mobile Right Icons */}
        <div className="flex-1 lg:hidden flex justify-end items-center gap-4 text-white">
          <Icon icon="lucide:bell" className="text-4xl md:text-2xl cursor-pointer" />
          <Icon icon="lucide:circle-user" className="text-4xl md:text-2xl cursor-pointer" />
        </div>

        {/* Desktop Right Nav */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-6">
          <div className="relative group flex items-center h-full">
            <div className="flex items-center gap-2 cursor-pointer font-medium text-base text-white transition-colors">
              <Icon icon={isEn ? "twemoji:flag-us-outlying-islands" : "twemoji:flag-vietnam"} className="text-2xl" />
              <span>{isEn ? t("English") : t("Việt Nam")}</span>
              <Icon icon="ri:arrow-drop-down-line" className="text-3xl -ml-1" />
            </div>

            <div className="absolute top-full right-0 pt-4 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="rounded-lg shadow-lg border border-gray-100 flex flex-col bg-white ">
                <div onClick={() => changeLanguage("vn")} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-teal-50 rounded-t-lg transition-colors group/item">
                  <Icon icon="twemoji:flag-vietnam" className="text-2xl group-hover/item:scale-110 transition-transform" />
                  <span className="text-base text-gray-700 group-hover/item:text-teal-700 font-medium transition-colors">{t("Việt Nam")}</span>
                </div>
                <div onClick={() => changeLanguage("en")} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-teal-50 rounded-b-lg transition-colors group/item">
                  <Icon icon="twemoji:flag-us-outlying-islands" className="text-2xl group-hover/item:scale-110 transition-transform" />
                  <span className="text-base text-gray-700 group-hover/item:text-teal-700 font-medium transition-colors">{t("English")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-5 text-white">
            <Icon icon="lucide:map-pin" className="text-2xl cursor-pointer hover:text-teal-200 hover:scale-110 transition-all duration-300 drop-shadow-sm" />
            <Icon icon="lucide:bell" className="text-2xl cursor-pointer hover:text-teal-200 hover:scale-110 transition-all duration-300 drop-shadow-sm" />
            <Link to="/dang-nhap"><Icon icon="lucide:circle-user" className="text-2xl cursor-pointer hover:text-teal-200 hover:scale-110 transition-all duration-300 drop-shadow-sm" /></Link>
          </div>

          <button className="bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-800 font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-base">
            {t("Đăng bài tuyển")}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 transition-opacity" 
            onClick={toggleMobileMenu}
          ></div>
          
          {/* Sidebar Drawer */}
          <div className="relative w-[80%] max-w-7xl bg-white h-full shadow-2xl flex flex-col z-40">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="font-bold text-xl text-[#026E5F]">Menu</span>
              <Icon 
                icon="material-symbols:close" 
                className="text-3xl text-gray-500 hover:text-gray-800 cursor-pointer" 
                onClick={toggleMobileMenu}
              />
            </div>

            <div className="flex flex-col p-5 gap-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 font-medium text-gray-800 transition-colors">
                <Icon icon="bitcoin-icons:menu-outline" className="text-2xl text-[#026E5F]" /> 
                {t("Danh Mục")}
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/about" className="text-gray-700 hover:text-teal-700 hover:bg-teal-50/80 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300" onClick={toggleMobileMenu}>
                  {t("Trang Chủ")}
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-teal-700 hover:bg-teal-50/80 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300" onClick={toggleMobileMenu}>
                  {t("Về chúng tôi")}
                </Link>
                <Link to="/jobs" className="text-gray-700 hover:text-teal-700 hover:bg-teal-50/80 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300" onClick={toggleMobileMenu}>
                  {t("Thông tin tuyển dụng")}
                </Link>
                <Link to="/lien-he" className="text-gray-700 hover:text-teal-700 hover:bg-teal-50/80 hover:pl-5 rounded-lg font-medium text-base px-3 py-3 transition-all duration-300" onClick={toggleMobileMenu}>
                  {t("Liên hệ")}
                </Link>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500 mb-3 font-medium px-1">{t("Ngôn ngữ")}</p>
                <div className="flex gap-3">
                  <div 
                    onClick={() => { changeLanguage("vn"); toggleMobileMenu(); }} 
                    className={`flex-1 flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${!isEn ? 'border-[#026E5F] bg-[#026E5F]/5 text-[#026E5F]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Icon icon="twemoji:flag-vietnam" className="text-xl" />
                    <span className="font-medium text-sm">VN</span>
                  </div>
                  <div 
                    onClick={() => { changeLanguage("en"); toggleMobileMenu(); }} 
                    className={`flex-1 flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${isEn ? 'border-[#026E5F] bg-[#026E5F]/5 text-[#026E5F]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Icon icon="twemoji:flag-us-outlying-islands" className="text-xl" />
                    <span className="font-medium text-sm">EN</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 pb-4">
                 <button className="w-full bg-[#026E5F] hover:bg-[#025E50] text-white font-medium px-6 py-3.5 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5" onClick={toggleMobileMenu}>
                  {t("Đăng bài tuyển")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
