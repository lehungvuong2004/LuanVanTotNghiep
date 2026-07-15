import { useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from "../../api/authApi/auth";
import { getForgotPasswordStep1Schema, getForgotPasswordStep2Schema, getForgotPasswordStep3Schema } from "../../api/authApi/validation";

export type StepType = 1 | 2 | 3;

export const useForgetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<StepType>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Formik Step 1: Email/Phone ---
  const formikStep1 = useFormik({
    initialValues: {
      emailOrPhone: "",
    },
    validationSchema: getForgotPasswordStep1Schema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const res = await forgotPasswordApi(values.emailOrPhone);
        setEmail(values.emailOrPhone);
        setSuccessMessage(res.message);
        setStep(2);
      } catch (error: any) {
        console.error("Step 1 failed:", error);
        setErrorMessage(error?.response?.data?.message || t("Gửi yêu cầu thất bại. Vui lòng kiểm tra lại."));
      } finally {
        setLoading(false);
      }
    },
  });

  // --- Formik Step 2: OTP ---
  const formikStep2 = useFormik({
    initialValues: {
      otp: Array(6).fill(""),
    },
    validationSchema: getForgotPasswordStep2Schema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const otpString = values.otp.join("");
        const res = await verifyOtpApi(email, otpString);
        setSuccessMessage(res.message);
        setStep(3);
      } catch (error: any) {
        console.error("Step 2 failed:", error);
        setErrorMessage(error?.response?.data?.message || t("Xác thực OTP thất bại."));
      } finally {
        setLoading(false);
      }
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...formikStep2.values.otp];
    newOtp[index] = value.substring(value.length - 1);
    formikStep2.setFieldValue("otp", newOtp);

    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formikStep2.values.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;
      prevInput?.focus();
    }
  };

  const formikStep3 = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: getForgotPasswordStep3Schema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const otpString = formikStep2.values.otp.join("");
        const res = await resetPasswordApi({
          email: email,
          otp: otpString,
          password: values.password,
          password_confirmation: values.confirmPassword,
        });
        setSuccessMessage(res.message);
        setTimeout(() => {
          navigate("/dang-nhap");
        }, 2000);
      } catch (error: any) {
        console.error("Step 3 failed:", error);
        setErrorMessage(error?.response?.data?.message || t("Đặt lại mật khẩu thất bại."));
      } finally {
        setLoading(false);
      }
    },
  });

  const handleResendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await forgotPasswordApi(email);
      setSuccessMessage(res.message || t("Mã OTP mới đã được gửi lại thành công."));
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      setErrorMessage(error?.response?.data?.message || t("Không thể gửi lại mã OTP."));
    } finally {
      setLoading(false);
    }
  };

  return {
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
    email,
    handleResendOtp,
  };
};
