import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/ToastContext";

export const Footer = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleShare = () => {
    const shareUrl = window.location.origin;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        showToast("success", t("Chia sẻ"), t("Đã sao chép liên kết trang web vào bộ nhớ tạm!"));
      },
      () => {
        showToast("error", t("Lỗi"), t("Không thể sao chép liên kết."));
      }
    );
  };

  const handleMail = () => {
    window.location.href = `mailto:hungvuong04.dev@gmail.com?subject=${encodeURIComponent(t("Liên hệ - Vấn đề hỗ trợ"))}&body=${encodeURIComponent(t("Xin chào, tôi muốn trao đổi về..."))}`;
  };

  // 1. RENDER BRAND / INTRO COLUMN
  const renderBrandSection = () => (
    <div className="flex flex-col gap-4 pr-4">
      <Link to="/" className="text-teal-800 dark:text-teal-400 font-bold text-3xl mb-2 hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
        Gia Đình Việt
      </Link>
      <p className="text-gray-650 dark:text-gray-400 text-sm leading-relaxed">
        {t("Nền tảng kết nối gia đình và người giúp việc đáng tin cậy. Nhanh chóng - An toàn - Minh bạch.")}
      </p>
      <div className="flex items-center gap-4 mt-2">
        <span className="text-teal-700 dark:text-teal-400 font-medium text-sm">{t("Notebook")}</span>
        <button
          onClick={handleShare}
          className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-all duration-300 p-2 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:shadow-sm cursor-pointer"
        >
          <Icon icon="material-symbols:share-outline" className="text-xl" />
        </button>
        <button
          onClick={handleMail}
          className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-all duration-300 p-2 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:shadow-sm cursor-pointer"
        >
          <Icon icon="lucide:mail" className="text-xl" />
        </button>
      </div>
    </div>
  );

  // 2. RENDER ABOUT US LINKS COLUMN
  const renderAboutSection = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-teal-800 dark:text-teal-400 font-bold text-sm uppercase tracking-wider mb-2 relative inline-block after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-teal-500 after:-bottom-2 after:left-0">
        {t("Về Chúng Tôi")}
      </h3>
      <div className="flex flex-col gap-3 mt-2">
        {/* <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Giới thiệu Gia Đình Việt")}
        </Link> */}
        <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Cam kết chất lượng")}
        </Link>
        <Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Bảng giá dịch vụ")}
        </Link>
        <Link to="/tuyen-dung" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Tuyển dụng")}
        </Link>
      </div>
    </div>
  );

  // 3. RENDER LINKED SERVICES COLUMN
  const renderServicesSection = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-teal-800 dark:text-teal-400 font-bold text-sm uppercase tracking-wider mb-2 relative inline-block after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-teal-500 after:-bottom-2 after:left-0">
        {t("Dịch Vụ Liên Kết")}
      </h3>
      <div className="flex flex-col gap-3 mt-2">
        <Link to="/pricing#cleaning" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Giúp việc theo giờ")}
        </Link>
        <Link to="/pricing#laundry" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Vệ sinh Sofa - Nệm")}
        </Link>
        <Link to="/pricing#repair" className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300">
          {t("Vệ sinh máy lạnh")}
        </Link>
        <Link
          to="/pricing#cleaning"
          className="text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:translate-x-1 inline-block text-sm transition-all duration-300"
        >
          {t("Tổng vệ sinh nhà cửa")}
        </Link>
      </div>
    </div>
  );

  // 4. RENDER SOCIAL CONNECTIONS & ACTION BUTTON COLUMN
  const renderSocialSection = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-teal-800 dark:text-teal-400 font-bold text-sm uppercase tracking-wider mb-2 relative inline-block after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-teal-500 after:-bottom-2 after:left-0">
        {t("Kết Nối Với Chúng Tôi")}
      </h3>
      <div className="flex gap-3 mt-2">
        <Link
          to="https://www.facebook.com/lehungvuong2004/"
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-500 hover:text-[#1877F2] transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="selfhst:facebook" className="text-xl" />
        </Link>
        <Link
          to="https://zalo.me/0817692747"
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-500 hover:text-[#0068FF] transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="simple-icons:zalo" className="text-xl" />
        </Link>
        <a
          href={`mailto:hungvuong04.dev@gmail.com?subject=${encodeURIComponent(t("Liên hệ - Vấn đề hỗ trợ"))}&body=${encodeURIComponent(t("Xin chào, tôi muốn trao đổi về..."))}`}
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-500 hover:text-red-500 transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="skill-icons:gmail-light" className="text-xl" />
        </a>
      </div>
      <div className="mt-4">
        <Link to="/dang-bai-tuyen">
          <button className="bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-teal-500/30 hover:-translate-y-0.5 text-sm w-max float-right clear-both cursor-pointer">
            {t("Đăng bài tuyển ngay")}
          </button>
        </Link>
      </div>
    </div>
  );

  // 5. RENDER COPYRIGHT & PRIVACY LINKS FOOTER BAR
  const renderCopyrightSection = () => (
    <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} Gia Đình Việt. {t("Đã đăng ký bản quyền.")}
      </p>
      <div className="flex gap-6">
        <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-[#066d72] dark:hover:text-teal-400 text-sm transition-colors">
          {t("Chính sách bảo mật")}
        </Link>
        <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-[#066d72] dark:hover:text-teal-400 text-sm transition-colors">
          {t("Điều khoản dịch vụ")}
        </Link>
      </div>
    </div>
  );

  // ROOT RETURN (GRID LAYOUT)
  return (
    <footer className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-14">
        {renderBrandSection()}
        {renderAboutSection()}
        {renderServicesSection()}
        {renderSocialSection()}
      </div>
      {renderCopyrightSection()}
    </footer>
  );
};

export default Footer;
