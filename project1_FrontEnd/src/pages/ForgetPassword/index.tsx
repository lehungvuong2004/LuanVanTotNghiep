import { useForgetPassword } from "./useHook";
import { Link } from "react-router-dom";
import forgetPasswordImg from "../../assets/images/forgetPassword.webp";
import { Icon } from "@iconify/react";

const ForgetPassword = () => {
  const {
    step,
    setStep,
    formikStep1,
    formikStep2,
    formikStep3,
    handleOtpChange,
    handleOtpKeyDown,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    errorMessage,
    successMessage,
    handleResendOtp } = useForgetPassword();

  const renderStep1 = () => (
    <form
      onSubmit={formikStep1.handleSubmit}
      className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md w-full mx-auto transition-colors duration-300"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quên mật khẩu?</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Nhập email của bạn để nhận mã xác thực khôi phục mật khẩu (chỉ sử dụng Gmail).</p>

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <Icon icon="heroicons-outline:exclamation-circle" className="text-xl shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Icon icon="mdi:gmail" className="text-2xl" />
          </div>
          <input
            type="text"
            name="emailOrPhone"
            className={`pl-10 w-full px-4 py-3 border rounded-lg outline-none transition-colors text-base dark:bg-slate-700/50 dark:text-white dark:placeholder:text-gray-500 ${formikStep1.touched.emailOrPhone && formikStep1.errors.emailOrPhone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"}`}
            placeholder="example@gmail.com"
            value={formikStep1.values.emailOrPhone}
            onChange={formikStep1.handleChange}
            onBlur={formikStep1.handleBlur}
            disabled={loading}
          />
        </div>
        {formikStep1.touched.emailOrPhone && formikStep1.errors.emailOrPhone && <div className="text-red-500 text-sm mt-1">{formikStep1.errors.emailOrPhone}</div>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#005C61] hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mb-6 text-base font-semibold"
      >
        {loading ? (
          <Icon icon="line-md:loading-twotone-loop" className="text-xl" />
        ) : (
          <>
            Gửi mã xác thực
            <Icon icon="solar:arrow-right-outline" className="text-xl" />
          </>
        )}
      </button>

      <div className="text-center">
        <Link to="/dang-nhap" className="text-base text-[rgb(0,92,97)] dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1 mb-4">
          <Icon icon="solar:arrow-left-outline" className="text-xl" />
          Quay lại đăng nhập
        </Link>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Chưa có tài khoản?{" "}
          <Link to="/dang-ky" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <div className="max-w-md w-full mx-auto">
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <Icon icon="heroicons-outline:check-circle" className="text-xl shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <Icon icon="heroicons-outline:exclamation-circle" className="text-xl shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      <form onSubmit={formikStep2.handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Xác thực mã OTP</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Mã xác thực đã được gửi đến email của bạn. Vui lòng nhập mã 6 chữ số bên dưới.</p>

        <div className="flex justify-between gap-2 mb-2">
          {formikStep2.values.otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              className={`w-12 h-12 text-center text-xl font-semibold border bg-gray-50 dark:bg-slate-700 dark:text-white rounded-lg outline-none transition-all ${formikStep2.submitCount > 0 && formikStep2.errors.otp ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              disabled={loading}
            />
          ))}
        </div>
        {formikStep2.submitCount > 0 && formikStep2.errors.otp && typeof formikStep2.errors.otp === "string" && <div className="text-red-500 text-xs text-center mb-6">{formikStep2.errors.otp}</div>}
        <div className="mb-6"></div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B2451C] hover:bg-orange-800 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-medium py-3 rounded-lg transition-colors mb-6 text-base flex justify-center items-center font-semibold disabled:opacity-50"
        >
          {loading ? <Icon icon="line-md:loading-twotone-loop" className="text-xl" /> : "Xác thực mã"}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Không nhận được mã?{" "}
            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[#005C61] dark:text-teal-400 font-medium hover:underline cursor-pointer disabled:opacity-50">
              Gửi lại mã OTP
            </button>
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <Icon icon="solar:arrow-left-outline" className="text-lg" />
            Quay lại bước 1
          </button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <form
      onSubmit={formikStep3.handleSubmit}
      className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md w-full mx-auto transition-colors duration-300"
    >
      <div className="inline-flex items-center gap-2 text-[#005C61] dark:text-teal-400 font-semibold text-sm mb-4 bg-teal-50 dark:bg-teal-500/10 px-3 py-1 rounded-full">
        <Icon icon="heroicons-outline:lock-closed" className="text-lg" />
        BƯỚC 3/3
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Đặt lại mật khẩu</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Vui lòng tạo mật khẩu mới an toàn để bảo vệ tài khoản của bạn.</p>

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <Icon icon="heroicons-outline:check-circle" className="text-xl shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <Icon icon="heroicons-outline:exclamation-circle" className="text-xl shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Mật khẩu mới</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <Icon icon="heroicons-outline:lock-closed" className="text-xl" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg outline-none transition-colors text-base dark:bg-slate-700/50 dark:text-white dark:placeholder:text-gray-500 ${formikStep3.touched.password && formikStep3.errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"}`}
              placeholder="••••••••"
              value={formikStep3.values.password}
              onChange={formikStep3.handleChange}
              onBlur={formikStep3.handleBlur}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon icon={showPassword ? "heroicons-outline:eye-off" : "heroicons-outline:eye"} className="text-xl" />
            </button>
          </div>
          {formikStep3.touched.password && formikStep3.errors.password && <div className="text-red-500 text-xs mt-1">{formikStep3.errors.password}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Xác nhận mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <Icon icon="heroicons-outline:shield-check" className="text-xl" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg outline-none transition-colors text-base dark:bg-slate-700/50 dark:text-white dark:placeholder:text-gray-500 ${formikStep3.touched.confirmPassword && formikStep3.errors.confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500"}`}
              placeholder="••••••••"
              value={formikStep3.values.confirmPassword}
              onChange={formikStep3.handleChange}
              onBlur={formikStep3.handleBlur}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon icon={showConfirmPassword ? "heroicons-outline:eye-off" : "heroicons-outline:eye"} className="text-xl" />
            </button>
          </div>
          {formikStep3.touched.confirmPassword && formikStep3.errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{formikStep3.errors.confirmPassword}</div>}
        </div>
      </div>

      <div className="bg-[#EEF2FF] dark:bg-indigo-500/10 rounded-lg p-4 mb-6 border border-transparent dark:border-indigo-500/20">
        <div className="flex items-start gap-2 text-sm text-indigo-900 dark:text-indigo-300 mb-2">
          <Icon icon="heroicons-outline:information-circle" className="text-lg mt-0.5 shrink-0" />
          <span className="font-medium">Mật khẩu mới phải có ít nhất:</span>
        </div>
        <ul className="text-sm text-indigo-800 dark:text-indigo-300 list-disc list-inside space-y-1 ml-6">
          <li>6 ký tự trở lên</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#005C61] hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mb-6 text-base font-semibold disabled:opacity-50"
      >
        {loading ? (
          <Icon icon="line-md:loading-twotone-loop" className="text-xl" />
        ) : (
          <>
            Cập nhật mật khẩu
            <Icon icon="solar:arrow-right-outline" className="text-xl" />
          </>
        )}
      </button>

      <div className="text-center">
        <Link to="/dang-nhap" className="text-base text-[#005C61] dark:text-teal-400 font-medium hover:underline">
          Quay lại trang Đăng nhập
        </Link>
      </div>
    </form>
  );

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center py-8 transition-colors duration-300">
      <div className="w-full px-4 md:px-16 mx-auto flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <img src={forgetPasswordImg} alt="Security Illustration" className="w-full max-w-md object-contain rounded-2xl" />
            </div>
            {step === 3 && (
              <div className="text-center max-w-sm mt-8">
                <h3 className="text-[#005C61] dark:text-teal-400 text-xl font-bold mb-3">Bảo mật là ưu tiên hàng đầu</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chúng tôi sử dụng mã hóa đa lớp để đảm bảo thông tin và các yêu cầu dịch vụ của bạn luôn được bảo vệ tuyệt đối.</p>
              </div>
            )}
          </div>

          <div className="w-full flex justify-center">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
