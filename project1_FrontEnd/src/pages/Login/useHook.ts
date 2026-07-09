import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginApi, googleLoginApi } from "../../api/authApi/auth";
import { getLoginSchema } from "../../api/authApi/validation";

export const useLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rememberedEmail = localStorage.getItem("remembered_email") || "";
  const initialRememberMe = localStorage.getItem("remember_me") === "true";

  const formik = useFormik({
    initialValues: {
      email: state?.email || rememberedEmail,
      password: "",
      rememberMe: initialRememberMe,
    },
    validationSchema: getLoginSchema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        if (values.rememberMe) {
          localStorage.setItem("remembered_email", values.email);
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remembered_email");
          localStorage.setItem("remember_me", "false");
        }

        const response = await loginApi({
          email: values.email,
          password: values.password,
        });
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Redirect based on role
        if (response.user.role_id === 1) {
          navigate("/admin");
        } else if (response.user.role_id === 2) {
          navigate("/operator");
        } else if (response.user.role_id === 3) {
          navigate("/");
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
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Redirect to Home (or specific role route if desired)
        if (response.user.role_id === 1) {
          navigate("/admin");
        } else if (response.user.role_id === 2) {
          navigate("/operator");
        } else if (response.user.role_id === 3) {
          navigate("/");
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
