import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import loginImage from "../../assets/images/image_login.webp";
import { useLogin } from "./useHook";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { formik, loginWithGoogle, loading, errorMessage } = useLogin();
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
    <div className="p-8 md:p-12 lg:py-24 flex flex-col justify-center bg-white dark:bg-slate-800 h-full transition-colors duration-300">
      <div className="max-w-lg w-full mx-auto">
        <h2 className="text-3xl font-bold text-[#066d72] dark:text-teal-400 mb-2">{t("Đăng nhập tài khoản")}</h2>
        <p className=" text-gray-500 dark:text-gray-400 mb-8">{t("Truy cập tài khoản để tiếp tục sử dụng dịch vụ")}</p>
        
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
            <Icon icon="mdi:alert-circle-outline" className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 dark:text-gray-200 block">{t("Email hoặc số điện thoại")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon icon="mdi:email-outline" className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="name@example.com"
                value={formik.values.emailOrPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all ${
                  formik.touched.emailOrPhone && formik.errors.emailOrPhone ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
            </div>
            {formik.touched.emailOrPhone && formik.errors.emailOrPhone ? <p className="text-sm text-red-500">{formik.errors.emailOrPhone}</p> : null}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 dark:text-gray-200 block">{t("Mật khẩu")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon icon="mdi:lock-outline" className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all tracking-wider ${
                  formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-5 h-5" />
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? <p className="text-sm text-red-500">{formik.errors.password}</p> : null}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#066d72] focus:ring-[#066d72] dark:focus:ring-teal-500 transition-colors cursor-pointer"
              />
              <span className="text-base font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">{t("Ghi nhớ đăng nhập")}</span>
            </label>
            <Link to="/quen-mat-khau" className="text-base font-bold text-[#066d72] dark:text-teal-400 hover:text-[#055a5e] dark:hover:text-teal-300 hover:underline transition-all cursor-pointer">
              {t("Quên mật khẩu?")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-base bg-[#066d72] hover:bg-[#055a5e] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 mt-2 shadow-sm shadow-[#066d72]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="line-md:loading-loop" className="w-5 h-5" />
                <span>{t("Đang đăng nhập...")}</span>
              </>
            ) : (
              t("Đăng nhập")
            )}
          </button>
        </form>

        <div className="mt-7 mb-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-4 text-base font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800">{t("Hoặc")}</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2.5 rounded-lg transition-all duration-200 mb-6 shadow-sm cursor-pointer"
        >
          <Icon icon="logos:google-icon" className="w-4 h-4" />
          <span className="text-base">{t("Tiếp tục với Google")}</span>
        </button>

        {/* Register Link */}
        <div className="text-center text-base text-gray-600 dark:text-gray-400 mb-6">
          {t("Chưa có tài khoản?")}{" "}
          <Link to="/dang-ky" className="font-bold text-[#066d72] dark:text-teal-400 text-base hover:text-[#055a5e] dark:hover:text-teal-300 hover:underline transition-all cursor-pointer">
            {t("Đăng ký ngay")}
          </Link>
        </div>

        <p className="text-sm  text-center text-gray-400 dark:text-gray-500 max-w-70 mx-auto">{t("Hệ thống sẽ tự động chuyển đến trang phù hợp theo vai trò tài khoản của bạn")}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col justify-center w-full bg-[#f8f9fa] dark:bg-slate-900 py-8 relative transition-colors duration-300">
      <div className="w-full px-4 md:px-16 mx-auto">
        <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden border border-gray-100 dark:border-gray-700 mt-6 md:mt-0 grid grid-cols-1 md:grid-cols-2 z-10">
          {imgLogin()}
          {formLogin()}
        </div>
      </div>
    </div>
  );
};
