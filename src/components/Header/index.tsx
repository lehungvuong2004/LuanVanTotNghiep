import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t, i18n } = useTranslation();
const changeLanguage = (lng: string) => {  // bằng changeLanguage("en")
    i18n.changeLanguage(lng);
  };

  const isEn = i18n.language === 'en'; // vào ra false bởi vì tiếng việt 

  const MainHeader = () => (
    <>
    <header className="flex items-center justify-between h-24 w-full">
      <nav className="flex-1 flex items-center gap-6 text-[#1a1a1a] font-medium text-base">
        <div className="flex items-center gap-1 cursor-pointer hover:text-[#026E5F] transition-colors bg-[#C4C4C8] rounded-full px-2">
         <Icon icon="bitcoin-icons:menu-outline" className="text-3xl"/> {t("Danh Mục")}
        </div>
        <Link to="/about" className="cursor-pointer hover:text-[#026E5F] transition-colors">
          {t("Trang Chủ")}
        </Link>
        <Link to="/about" className="cursor-pointer hover:text-[#026E5F] transition-colors">
          {t("Về chúng tôi")}
        </Link>
        <Link to="/jobs" className="cursor-pointer hover:text-[#026E5F] transition-colors">
          {t("Thông tin tuyển dụng")}
        </Link>
        <Link to="/contact" className="cursor-pointer hover:text-[#026E5F] transition-colors">
          {t("Liên hệ")}
        </Link>
      </nav>

      <div className="flex items-center justify-center shrink-0">
        <Link to="/" className="text-[#026E5F] font-bold text-3xl">
          Home Layout
        </Link>
      </div>
      <div className="flex-1 flex justify-end items-center gap-6">
        <div className="relative group flex items-center h-full">
          <div className="flex items-center gap-2 cursor-pointer font-medium text-base hover:text-[#026E5F] transition-colors">
            <Icon icon={isEn ? "twemoji:flag-us-outlying-islands" : "twemoji:flag-vietnam"} className="text-2xl" />
            <span>{isEn ? t("English") : t("Việt Nam")}</span>
            <Icon icon="ri:arrow-drop-down-line" className="text-3xl -ml-1" />
          </div>
          
          <div className="absolute top-full right-0 pt-4 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col py-2">
              <div 
                onClick={() => changeLanguage('vn')}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 hover:text-[#026E5F] transition-colors"
              >
                <Icon icon="twemoji:flag-vietnam" className="text-2xl" />
                <span className="text-base">{t("Việt Nam")}</span>
              </div>
              <div 
                onClick={() => changeLanguage('en')}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 hover:text-[#026E5F] transition-colors"
              >
                <Icon icon="twemoji:flag-us-outlying-islands" className="text-2xl" />
                <span className="text-base">{t("English")}</span>
              </div>
            </div>
          </div>
        </div>


        {/* Icons */}
        <div className="flex items-center gap-5 text-gray-700">
          <Icon icon="lucide:map-pin" className="text-2xl cursor-pointer hover:text-[#026E5F] transition-colors" />
          <Icon icon="lucide:bell" className="text-2xl cursor-pointer hover:text-[#026E5F] transition-colors" />
          <Icon icon="lucide:circle-user" className="text-2xl cursor-pointer hover:text-[#026E5F] transition-colors" />
        </div>

        <button className="bg-[#026E5F] hover:bg-[#02564a] text-white font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer text-base">{t("Đăng bài tuyển")}</button>
      </div>
    </header>
    
    </>
  );

  return (
    <>
      {MainHeader()}
    </>
  );
}
