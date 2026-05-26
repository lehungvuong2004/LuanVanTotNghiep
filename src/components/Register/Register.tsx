import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import registerImage from "../../assets/images/resgiter.png";
import { useRegister } from "./useHook";

export const Register = () => {
  const { 
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword
  } = useRegister();

  return (
    <div className="flex items-start md:items-center justify-center bg-[#f8f9fa] min-h-[calc(100vh-80px)] relative p-4 md:p-12">
      <div className="max-w-[1240px] w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row z-10 border border-gray-100 mt-6 md:mt-0">
        {/* Left Side: Image */}
        <div className="md:w-1/2 relative hidden md:block">
          <img
            src={registerImage}
            alt="Register background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#066d72]/90 via-[#066d72]/40 to-transparent flex flex-col justify-end p-10 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Icon icon="mdi:home-heart" className="w-7 h-7" />
              <span className="text-sm font-bold tracking-widest uppercase opacity-90">Home Helper Pro</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight leading-[1.2] max-w-md">Kiến tạo không gian<br/>sống hạnh phúc</h2>
            <p className="text-sm mb-10 font-medium opacity-90 max-w-md leading-relaxed">Đội ngũ cộng tác viên tận tâm, quy trình chuyên nghiệp giúp bạn dành trọn thời gian quý báu cho gia đình và bản thân.</p>
            
            <div className="flex items-center gap-14">
              <div>
                <p className="text-2xl font-bold mb-1.5">10k+</p>
                <p className="text-xs font-bold tracking-wider uppercase opacity-80">KHÁCH HÀNG TIN DÙNG</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1.5">4.9/5</p>
                <p className="text-xs font-bold tracking-wider uppercase opacity-80">ĐÁNH GIÁ TRUNG BÌNH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:px-14 md:py-10 flex flex-col justify-center bg-white">
          <div className="max-w-[400px] w-full mx-auto">
            <h2 className="text-2xl font-bold text-[#066d72] mb-2">Tạo tài khoản</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Đăng ký để đặt lịch dịch vụ, đăng tin tuyển dụng và quản lý công việc dễ dàng hơn.</p>

            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Icon icon="mdi:account-outline" className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-white text-sm transition-all placeholder:text-gray-400 ${
                      formik.touched.fullName && formik.errors.fullName ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-xs text-red-500">{formik.errors.fullName as string}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Icon icon="mdi:email-outline" className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-white text-sm transition-all placeholder:text-gray-400 ${
                      formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-500">{formik.errors.email as string}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Icon icon="mdi:phone-outline" className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="0123 456 789"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-white text-sm transition-all placeholder:text-gray-400 ${
                      formik.touched.phone && formik.errors.phone ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-xs text-red-500">{formik.errors.phone as string}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Mật khẩu</label>
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
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-white text-sm transition-all placeholder:text-gray-400 tracking-wider ${
                      formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-5 h-5" />
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-500">{formik.errors.password as string}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Icon icon="mdi:lock-outline" className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-white text-sm transition-all placeholder:text-gray-400 tracking-wider ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon icon={showConfirmPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-5 h-5" />
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{formik.errors.confirmPassword as string}</p>
                )}
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
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#066d72] focus:ring-[#066d72] transition-colors cursor-pointer" 
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                    Tôi đồng ý với{" "}
                    <Link to="/dieu-khoan" className="font-semibold text-[#066d72] hover:underline">điều khoản sử dụng</Link>
                    {" "}và{" "}
                    <Link to="/bao-mat" className="font-semibold text-[#066d72] hover:underline">chính sách bảo mật</Link>
                  </span>
                </label>
                {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                  <p className="text-xs text-red-500 mt-1.5">{formik.errors.agreeTerms as string}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#066d72] hover:bg-[#055a5e] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-sm shadow-[#066d72]/20 cursor-pointer"
              >
                Tạo tài khoản
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-5 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-xs font-bold text-gray-400 bg-white">HOẶC</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Login */}
            <button type="button" className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200 mb-6 shadow-sm cursor-pointer">
              <Icon icon="logos:google-icon" className="w-4 h-4" />
              <span className="text-sm">Đăng ký với Google</span>
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600 mb-8">
              Đã có tài khoản?{" "}
              <Link to="/dang-nhap" className="font-bold text-[#066d72] hover:text-[#055a5e] hover:underline transition-all cursor-pointer">
                Đăng nhập
              </Link>
            </div>

            {/* Info Message */}
            <div className="bg-[#f8f9fa] rounded-lg p-3.5 flex items-start gap-3 border border-gray-100 mx-auto max-w-[340px]">
              <Icon icon="mdi:information-outline" className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Bạn có thể đăng ký trở thành người giúp việc sau khi tạo tài khoản.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};