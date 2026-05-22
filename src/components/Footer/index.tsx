import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-14">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="flex flex-col gap-4 pr-4">
            <Link to="/" className="text-[#066d72] font-bold text-3xl mb-2">
              SạchSẽ
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t("Nền tảng kết nối dịch vụ gia đình hàng đầu Việt Nam. Chuyên nghiệp - Tận tâm - Minh bạch.")}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[#066d72] font-medium text-sm">Notebook</span>
              <button className="text-[#066d72] hover:text-[#02564a] transition-colors p-1.5 rounded-full hover:bg-gray-200">
                <Icon icon="material-symbols:share-outline" className="text-2xl" />
              </button>
              <button className="text-[#066d72] hover:text-[#02564a] transition-colors p-1.5 rounded-full hover:bg-gray-200">
                <Icon icon="lucide:mail" className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Cột 2: Về Chúng Tôi */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#066d72] font-semibold text-sm uppercase tracking-wider mb-2">
              {t("Về Chúng Tôi")}
            </h3>
            <div className="flex flex-col gap-3">
              <Link to="/about" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Giới thiệu SạchSẽ")}</Link>
              <Link to="/quality" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Cam kết chất lượng")}</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Bảng giá dịch vụ")}</Link>
              <Link to="/careers" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Tuyển dụng")}</Link>
            </div>
          </div>

          {/* Cột 3: Dịch vụ */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#066d72] font-semibold text-sm uppercase tracking-wider mb-2">
              {t("Dịch Vụ Liên Kết")}
            </h3>
            <div className="flex flex-col gap-3">
              <Link to="/services/hourly" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Giúp việc theo giờ")}</Link>
              <Link to="/services/sofa" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Vệ sinh Sofa - Nệm")}</Link>
              <Link to="/services/ac" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Vệ sinh máy lạnh")}</Link>
              <Link to="/services/deep-clean" className="text-gray-600 hover:text-[#066d72] text-sm transition-colors">{t("Tổng vệ sinh nhà cửa")}</Link>
            </div>
          </div>

          {/* Cột 4: Kết nối */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#066d72] font-semibold text-sm uppercase tracking-wider mb-2">
              {t("Kết Nối Với Chúng Tôi")}
            </h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#066d72] hover:text-[#1877F2] transition-all bg-white shadow-sm hover:shadow-md" target="_blank" rel="noopener noreferrer">
                <Icon icon="ic:outline-facebook" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#066d72] hover:text-[#0068FF] transition-all bg-white shadow-sm hover:shadow-md" target="_blank" rel="noopener noreferrer">
                <Icon icon="simple-icons:zalo" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#066d72] hover:text-[#229ED9] transition-all bg-white shadow-sm hover:shadow-md" target="_blank" rel="noopener noreferrer">
                <Icon icon="ic:sharp-telegram" className="text-xl" />
              </a>
              <a href="mailto:[EMAIL_ADDRESS]" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#066d72] transition-all bg-white shadow-sm hover:shadow-md" target="_blank" rel="noopener noreferrer">
                <Icon icon="skill-icons:gmail-light" className="text-xl" />
              </a>
            </div>
            <div className="mt-2">
              <button className="bg-[#066d72] hover:bg-[#02564a] text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm w-max float-right clear-both">
                {t("Đăng bài tuyển ngay")}
              </button>
            </div>
          </div>
        </div>

        {/* Phần Bản Quyền */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SạchSẽ Inc. {t("Đã đăng ký bản quyền.")}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-[#066d72] text-sm transition-colors">
              {t("Chính sách bảo mật")}
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-[#066d72] text-sm transition-colors">
              {t("Điều khoản dịch vụ")}
            </Link>
          </div>
        </div>
    </footer>
  );
};
