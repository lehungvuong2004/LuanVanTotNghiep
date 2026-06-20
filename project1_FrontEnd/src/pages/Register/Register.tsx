import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import registerImage from "../../assets/images/resgiter.webp";
import { useRegister } from "./useHook";
import { useTranslation } from "react-i18next";

export const Register = () => {
  const { formik, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, registerWithGoogle, loading, errorMessage } = useRegister();
  const { t } = useTranslation();
  // console.log("error message : ",errorMessage);
  const imgRegister = () => (
    <div className="relative hidden md:block h-full">
      <img src={registerImage} alt="Register background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-[#066d72]/90 via-[#066d72]/40 to-transparent flex flex-col justify-end p-10 text-white z-10">
        <div className="flex items-center gap-3 mb-3">
          <Icon icon="mdi:home-heart" className="w-7 h-7" />
          <span className="text-sm font-bold tracking-widest uppercase opacity-90">Home Helper Pro</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight leading-[1.2] max-w-md">
          {t("Kiến tạo không gian")}
          <br />
          {t("Sống hạnh phúc")}
        </h2>
        <p className="text-sm mb-10 font-medium opacity-90 max-w-md leading-relaxed">
          {t("Đội ngũ cộng tác viên tận tâm, quy trình chuyên nghiệp giúp bạn dành trọn thời gian quý báu cho gia đình và bản thân.")}
        </p>

        <div className="flex items-center gap-14">
          <div>
            <p className="text-2xl font-bold mb-1.5">10k+</p>
            <p className="text-xs font-bold tracking-wider uppercase opacity-80">{t("KHÁCH HÀNG TIN DÙNG")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1.5">4.9/5</p>
            <p className="text-xs font-bold tracking-wider uppercase opacity-80">{t("ĐÁNH GIÁ TRUNG BÌNH")}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const formRegister = () => (
    <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 h-full transition-colors duration-300">
      <div className="max-w-lg w-full mx-auto">
        <h2 className="text-3xl font-bold text-[#066d72] dark:text-teal-400 mb-2">{t("Tạo tài khoản")}</h2>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{t("Đăng ký để đặt lịch dịch vụ, đăng tin tuyển dụng và quản lý công việc dễ dàng hơn.")}</p>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
            <Icon icon="mdi:alert-circle-outline" className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 dark:text-gray-200 block">{t("Họ và tên")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon icon="mdi:account-outline" className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-white dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all ${
                  formik.touched.fullName && formik.errors.fullName ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
            </div>
            {formik.touched.fullName && formik.errors.fullName && <p className="text-base text-red-500">{formik.errors.fullName as string}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 dark:text-gray-200 block">{t("Email")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon icon="mdi:email-outline" className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="email"
                placeholder="example@gmail.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-white dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all ${
                  formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
            </div>
            {formik.touched.email && formik.errors.email && <p className="text-base text-red-500">{formik.errors.email as string}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 dark:text-gray-200 block">{t("Số điện thoại")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon icon="mdi:phone-outline" className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="phone"
                placeholder="0123 456 789"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-white dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all ${
                  formik.touched.phone && formik.errors.phone ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
            </div>
            {formik.touched.phone && formik.errors.phone && <p className="text-base text-red-500">{formik.errors.phone as string}</p>}
          </div>

          {/* Password */}
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
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-white dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all tracking-wider ${
                  formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-5 h-5" />
              </button>
            </div>
            {formik.touched.password && formik.errors.password && <p className="text-base text-red-500">{formik.errors.password as string}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-gray-700 dark:text-gray-200 block">{t("Xác nhận mật khẩu")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon icon="mdi:lock-outline" className="w-5 h-5" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 dark:focus:ring-teal-500/50 focus:border-[#066d72] dark:focus:border-teal-500 bg-white dark:bg-slate-700/50 text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all tracking-wider ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon icon={showConfirmPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-5 h-5" />
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-base text-red-500">{formik.errors.confirmPassword as string}</p>}
          </div>

          {/* Agree Terms Checkbox */}
          <div className="pt-1 pb-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formik.values.agreeTerms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#066d72] focus:ring-[#066d72] dark:focus:ring-teal-500 transition-colors cursor-pointer"
              />
              <span className="text-base text-gray-600 dark:text-gray-300 leading-tight">
                {t("Tôi đồng ý với")}{" "}
                <Link to="/dieu-khoan" className="font-semibold text-[#066d72] dark:text-teal-400 hover:underline">
                  {t("điều khoản sử dụng")}
                </Link>{" "}
                {t("và")}{" "}
                <Link to="/bao-mat" className="font-semibold text-[#066d72] dark:text-teal-400 hover:underline">
                  {t("chính sách bảo mật")}
                </Link>
              </span>
            </label>
            {formik.touched.agreeTerms && formik.errors.agreeTerms && <p className="text-base text-red-500 mt-1.5">{formik.errors.agreeTerms as string}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#066d72] hover:bg-[#055a5e] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-sm shadow-[#066d72]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="line-md:loading-loop" className="w-5 h-5" />
                <span>{t("Đang tạo tài khoản...")}</span>
              </>
            ) : (
              t("Tạo tài khoản")
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 mb-5 flex items-center">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
          <span className="px-4 text-base font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800">{t("HOẶC")}</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => registerWithGoogle()}
          className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2.5 rounded-lg transition-all duration-200 mb-6 shadow-sm cursor-pointer"
        >
          <Icon icon="logos:google-icon" className="w-4 h-4" />
          <span className="text-base">{t("Đăng ký với Google")}</span>
        </button>

        {/* Login Link */}
        <div className="text-center text-base text-gray-600 dark:text-gray-400 mb-8">
          {t("Đã có tài khoản?")}{" "}
          <Link to="/dang-nhap" className="font-bold text-[#066d72] dark:text-teal-400 hover:text-[#055a5e] dark:hover:text-teal-300 hover:underline transition-all cursor-pointer">
            {t("Đăng nhập")}
          </Link>
        </div>

        {/* Info Message */}
        <div className="rounded-lg p-3.5 flex items-start gap-3 border border-amber-300/30 dark:border-amber-500/30 mx-auto max-w-[21.25rem] bg-amber-300/10 dark:bg-amber-500/10">
          <Icon icon="mdi:information-outline" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-900 dark:text-amber-300 leading-relaxed text-center">{t("Bạn có thể đăng ký trở thành người giúp việc sau khi tạo tài khoản.")}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col justify-center w-full bg-[#f8f9fa] dark:bg-slate-900 py-8 relative transition-colors duration-300">
      <div className="w-full px-4 md:px-16 mx-auto">
        <div className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden border border-gray-100 dark:border-gray-700 mt-6 md:mt-0 grid grid-cols-1 md:grid-cols-2 z-10">
          {imgRegister()}
          {formRegister()}
        </div>
      </div>
    </div>
  );
};
