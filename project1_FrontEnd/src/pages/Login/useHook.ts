import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../api/auth";

export const useLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      emailOrPhone: "",
      password: "",
      rememberMe: false,
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
      password: Yup.string()
        .required(t("Vui lòng nhập mật khẩu"))
        .min(6, t("Mật khẩu phải có ít nhất 6 ký tự"))
        .max(32, t("Mật khẩu không được vượt quá 32 ký tự"))
        .matches(/^\S*$/, t("Mật khẩu không được chứa khoảng trắng"))
        .matches(/[A-Z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in hoa"))
        .matches(/[a-z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in thường"))
        .matches(/[0-9]/, t("Mật khẩu phải chứa ít nhất 1 ký tự số"))
        .matches(/[@$!%*?&]/, t("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)")),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await loginApi({
          email: values.emailOrPhone,
          password: values.password,
        });

        // Store tokens & user details
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Redirect based on role
        if (response.user.role_id === 1) {
          navigate("/admin");
        } else if (response.user.role_id === 2) {
          navigate("/helper");
        } else {
          navigate("/");
        }
      } catch (error: any) {
        console.error("Login failed:", error);
        const serverError = error?.response?.data?.message || t("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        setErrorMessage(serverError);
      } finally {
        setLoading(false);
      }
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google Login Success:", tokenResponse);
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  return { formik, loginWithGoogle, loading, errorMessage };
};
