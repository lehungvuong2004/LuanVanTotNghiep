import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from "../../api/auth";

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

  // OTP inputs references
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Formik Step 1: Email/Phone ---
  const formikStep1 = useFormik({
    initialValues: {
      emailOrPhone: "",
    },
    validationSchema: Yup.object({
      emailOrPhone: Yup.string()
        .required(t("Vui lòng nhập email hoặc số điện thoại"))
        .min(5, t("Tài khoản phải có ít nhất 5 ký tự"))
        .max(30, t("Tài khoản không được vượt quá 30 ký tự"))
        .test("is-email-or-phone", t("Vui lòng nhập đúng định dạng Email (vd: example@gmail.com) hoặc Số điện thoại (10 số)"), (value) => {
          if (!value) return true;
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        }),
    }),
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
    validationSchema: Yup.object({
      otp: Yup.array()
        .of(
          Yup.string()
            .required()
            .matches(/^[0-9]$/, "Chỉ cho phép số"),
        )
        .min(6)
        .max(6)
        .test("is-6-digits", t("Vui lòng nhập đủ 6 số OTP"), (value) => {
          return value ? value.every((v) => v !== "") : false;
        }),
    }),
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

    if (value !== "" && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formikStep2.values.otp[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const formikStep3 = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("Vui lòng nhập mật khẩu mới"))
        .min(6, t("Mật khẩu phải có ít nhất 6 ký tự")),
      confirmPassword: Yup.string()
        .required(t("Vui lòng xác nhận mật khẩu"))
        .oneOf([Yup.ref("password")], t("Mật khẩu xác nhận không khớp")),
    }),
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
      // const res = await forgotPasswordApi(email);
      setSuccessMessage(t("Mã OTP mới đã được gửi lại thành công."));
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
    otpRefs,
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
