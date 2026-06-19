import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginApi, googleLoginApi } from "../../api/auth";

export const useLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      emailOrPhone: state?.email || "",
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
          if (value === "admin") return true;
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        }),
      password: Yup.string()
        .required(t("Vui lòng nhập mật khẩu"))
        .test("password-strength", t("Mật khẩu không hợp lệ"), function (value) {
          if (!value) return true;
          if (value === "admin" && this.parent.emailOrPhone === "admin") return true;
          
          const hasMin = value.length >= 6;
          const hasMax = value.length <= 32;
          const noWhitespace = /^\S*$/.test(value);
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasDigit = /[0-9]/.test(value);

          if (!hasMin) return this.createError({ message: t("Mật khẩu phải có ít nhất 6 ký tự") });
          if (!hasMax) return this.createError({ message: t("Mật khẩu không được vượt quá 32 ký tự") });
          if (!noWhitespace) return this.createError({ message: t("Mật khẩu không được chứa khoảng trắng") });
          if (!hasUpper) return this.createError({ message: t("Mật khẩu phải chứa ít nhất 1 ký tự in hoa") });
          if (!hasLower) return this.createError({ message: t("Mật khẩu phải chứa ít nhất 1 ký tự in thường") });
          if (!hasDigit) return this.createError({ message: t("Mật khẩu phải chứa ít nhất 1 ký tự số") });

          return true;
        }),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        let response;
        if (values.emailOrPhone === "admin" && values.password === "admin") {
          // Simulated Admin Login Response
          response = {
            access_token: "mocked-admin-token-12345",
            user: {
              role_id: 1,
              full_name: "Admin User",
              email: "admin@gmail.com",
            },
          };
        } else {
          response = await loginApi({
            email: values.emailOrPhone,
            password: values.password,
          });
        }
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Redirect based on role
        if (response.user.role_id === 1) {
          navigate("/admin");
        } else if (response.user.role_id === 3) {
          navigate("/helper");
        } else if (response.user.role_id === 4) {
          navigate("/operator");
        } else {
          navigate("/");
        }
      } catch (error: any) {
        console.error("Login failed:", error);
        const serverError = error?.response?.data?.message || t("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.");
        setErrorMessage(serverError);
      } finally {
        setLoading(false);
      }
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Login Success:", tokenResponse);
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await googleLoginApi(tokenResponse.access_token, "login");
        
        // Store token & user details
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Redirect to Home (or specific role route if desired)
        if (response.user.role_id === 1) {
          navigate("/admin");
        } else if (response.user.role_id === 3) {
          navigate("/helper");
        } else if (response.user.role_id === 4) {
          navigate("/operator");
        } else {
          navigate("/");
        }
      } catch (error: any) {
        console.error("Google Login fail:", error);
        setErrorMessage(error?.response?.data?.message || t("Đăng nhập bằng Google thất bại. Tài khoản chưa đăng ký."));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.error("Google Login Failed");
      setErrorMessage(t("Đăng nhập bằng Google thất bại."));
    },
  });

  return { formik, loginWithGoogle, loading, errorMessage };
};
