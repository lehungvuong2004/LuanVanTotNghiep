import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import loginImage from "../../assets/images/image_login.png";
import { useLogin } from "./useHook";
import { useState } from "react";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { formik } = useLogin();

  return (
    <div className="flex items-start md:items-center justify-center bg-[#f8f9fa] min-h-[calc(100vh-80px)] relative p-4 md:p-12">
      {/* <div className="absolute inset-0 z-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size[16px_16px] bg-repeat opacity-40 pointer-events-none"></div> */}
      <div className="max-w-[1240px] w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row z-10 border border-gray-100 mt-6 md:mt-0">
        <div className="md:w-1/2 relative hidden md:block">
          <img
            src={loginImage}
            alt="Login background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#066d72]/80 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Chào mừng trở lại!</h2>
            <p className="text-sm mb-4 font-medium opacity-90">Kết nối dịch vụ gia đình tận tâm.</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-0.5 bg-orange-400"></div>
              <span className="text-xs font-bold tracking-widest uppercase opacity-90">Home Helper Pro</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-lg w-full mx-auto">
            <h2 className="text-2xl font-bold text-[#066d72] mb-1">Đăng nhập</h2>
            <p className="text-sm text-gray-500 mb-8">Truy cập tài khoản để tiếp tục sử dụng dịch vụ</p>

            <form className="space-y-5" onSubmit={formik.handleSubmit}>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Email hoặc số điện thoại</label>
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
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-gray-50/50 text-sm transition-all placeholder:text-gray-400 ${
                      formik.touched.emailOrPhone && formik.errors.emailOrPhone
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {formik.touched.emailOrPhone && formik.errors.emailOrPhone ? (
                  <p className="text-xs text-red-500">{formik.errors.emailOrPhone}</p>
                ) : null}
              </div>

              {/* Password Field */}
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
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#066d72]/50 focus:border-[#066d72] bg-gray-50/50 text-sm transition-all placeholder:text-gray-400 tracking-wider ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : "border-gray-200"
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
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-xs text-red-500">{formik.errors.password}</p>
                ) : null}
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
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/quen-mat-khau" className="text-xs font-bold text-[#066d72] hover:text-[#055a5e] hover:underline transition-all cursor-pointer">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#066d72] hover:bg-[#055a5e] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-2 shadow-sm shadow-[#066d72]/20 cursor-pointer"
              >
                Đăng nhập
              </button>
            </form>

            {/* Divider */}
            <div className="mt-7 mb-6 flex items-center">
              <div className="flex-1 border-t border-gray-100"></div>
              <span className="px-4 text-xs font-medium text-gray-400 bg-white">Hoặc</span>
              <div className="flex-1 border-t border-gray-100"></div>
            </div>

            {/* Google Login */}
            <button type="button" className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200 mb-6 shadow-sm cursor-pointer">
              <Icon icon="logos:google-icon" className="w-4 h-4" />
              <span className="text-sm">Tiếp tục với Google</span>
            </button>

            {/* Register Link */}
            <div className="text-center text-sm text-gray-600 mb-6">
              Chưa có tài khoản?{" "}
              <Link to="/dang-ky" className="font-bold text-[#066d72] hover:text-[#055a5e] hover:underline transition-all cursor-pointer">
                Đăng ký ngay
              </Link>
            </div>

            <p className="text-[11px] leading-tight text-center text-gray-400 max-w-[280px] mx-auto">
              Hệ thống sẽ tự động chuyển đến trang phù hợp theo vai trò tài khoản của bạn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};