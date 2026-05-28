import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

export type StepType = 1 | 2 | 3;

export const useForgetPassword = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<StepType>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // OTP inputs references
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Formik Step 1: Email/Phone ---
  const formikStep1 = useFormik({
    initialValues: {
      emailOrPhone: '',
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
    onSubmit: (values) => {
      console.log('Submit Step 1:', values);
      setStep(2);
    }
  });

  // --- Formik Step 2: OTP ---
  const formikStep2 = useFormik({
    initialValues: {
      otp: Array(6).fill(''),
    },
    validationSchema: Yup.object({
      otp: Yup.array()
        .of(Yup.string().required().matches(/^[0-9]$/, "Chỉ cho phép số"))
        .min(6)
        .max(6)
        .test('is-6-digits', t("Vui lòng nhập đủ 6 số OTP"), (value) => {
          return value ? value.every(v => v !== '') : false;
        }),
    }),
    onSubmit: (values) => {
      console.log('Submit Step 2:', values);
      setStep(3);
    }
  });

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...formikStep2.values.otp];
    newOtp[index] = value.substring(value.length - 1); 
    formikStep2.setFieldValue('otp', newOtp);

    if (value !== '' && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formikStep2.values.otp[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const formikStep3 = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("Vui lòng nhập mật khẩu mới"))
        .min(8, t("Mật khẩu phải có ít nhất 8 ký tự"))
        .matches(/[a-z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in thường"))
        .matches(/[A-Z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in hoa"))
        .matches(/[0-9]/, t("Mật khẩu phải chứa ít nhất 1 ký tự số"))
        .matches(/[@$!%*?&]/, t("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)")),
      confirmPassword: Yup.string()
        .required(t("Vui lòng xác nhận mật khẩu"))
        .oneOf([Yup.ref('password')], t("Mật khẩu xác nhận không khớp")),
    }),
    onSubmit: (values) => {
      console.log('Submit Step 3:', values);
      console.log('Password reset successfully');
    }
  });

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
  };
};
