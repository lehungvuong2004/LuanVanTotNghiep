import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import loginImage from "../../assets/images/image_login.png";
import { useLogin } from "./useHook";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { formik } = useLogin();
  const { t } = useTranslation();

  const imgLogin = () => (
    <div className="relative hidden md:block h-full">
      <img src={loginImage} alt="Login background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-[#066d72]/80 via-transparent to-transparent flex flex-col justify-end p-10 text-white z-10">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">{t("Chào mừng trở lại!")}</h2>
        <p className="text-base mb-4 font-medium opacity-90">{t("Kết nối dịch vụ gia đình tận tâm.")}</p>
        <div className="flex items-center gap-3">
          <div className="w-14 h-0.5 bg-orange-400"></div>
          <span className="text-sm font-bold tracking-widest uppercase opacity-90">{t("Gia đình Việt")}</span>
        </div>
      </div>
    </div>
  );

  const formLogin = () => (
    <div className="p-8 md:p-12 flex flex-col justify-center bg-white h-full">
      <div className="max-w-lg w-full mx-auto">
        <h2 className="text-3xl font-bold text-[#066d72] mb-2">{t("Đăng nhập tài khoản")}</h2>
        <p className="text-sm text-gray-500 mb-8">{t("Truy cập tài khoản để tiếp tục sử dụng dịch vụ")}</p>

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 block">{t("Email hoặc số điện thoại")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Icon icon="mdi:email-outline" className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="name@example.com"
                value={formik.values.emailOrPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-gray-50/50 text-base transition-all placeholder:text-gray-400 ${
                  formik.touched.emailOrPhone && formik.errors.emailOrPhone ? "border-red-500" : "border-gray-200"
                }`}
              />
            </div>
            {formik.touched.emailOrPhone && formik.errors.emailOrPhone ? <p className="text-sm text-red-500">{formik.errors.emailOrPhone}</p> : null}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 block">{t("Mật khẩu")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Icon icon="mdi:lock-outline" className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-gray-50/50 text-base transition-all placeholder:text-gray-400 tracking-wider ${
                  formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-5 h-5" />
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? <p className="text-base text-red-500">{formik.errors.password}</p> : null}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[#066d72] focus:ring-[#066d72] transition-colors cursor-pointer"
              />
              <span className="text-base font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{t("Ghi nhớ đăng nhập")}</span>
            </label>
            <Link to="/quen-mat-khau" className="text-base font-bold text-[#066d72] hover:text-[#055a5e] hover:underline transition-all cursor-pointer">
              {t("Quên mật khẩu?")}
            </Link>
          </div>

          <button
            type="submit"
            className="w-full text-base bg-[#066d72] hover:bg-[#055a5e] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-2 shadow-sm shadow-[#066d72]/20 cursor-pointer"
          >
            {t("Đăng nhập")}
          </button>
        </form>

        <div className="mt-7 mb-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-base font-medium text-gray-400 bg-white">{t("Hoặc")}</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200 mb-6 shadow-sm cursor-pointer"
        >
          <Icon icon="logos:google-icon" className="w-4 h-4" />
          <span className="text-base">{t("Tiếp tục với Google")}</span>
        </button>

        {/* Register Link */}
        <div className="text-center text-base text-gray-600 mb-6">
          {t("Chưa có tài khoản?")}{" "}
          <Link to="/dang-ky" className="font-bold text-[#066d72] text-base hover:text-[#055a5e] hover:underline transition-all cursor-pointer">
            {t("Đăng ký ngay")}
          </Link>
        </div>

        <p className="text-sm leading-tight text-center text-gray-400 max-w-[280px] mx-auto">{t("Hệ thống sẽ tự động chuyển đến trang phù hợp theo vai trò tài khoản của bạn")}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex items-center justify-center w-full bg-[#f8f9fa] py-8 relative"> 
      <div className="container-layout">
        <div className="w-full md:min-h-[680px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100 mt-6 md:mt-0 grid grid-cols-1 md:grid-cols-2 z-10">
          {imgLogin()}
          {formLogin()}
        </div>
      </div>
    </div>
  );
};
