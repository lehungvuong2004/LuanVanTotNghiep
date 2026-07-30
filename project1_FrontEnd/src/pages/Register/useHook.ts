import { useFormik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { registerApi, googleLoginApi } from "../../api/authApi/auth";
import { getRegisterSchema } from "../../api/authApi/validation";

export const useRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    validationSchema: getRegisterSchema(t),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        await registerApi({
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
        });
        // console.log("Register response:", response);

        // Redirect to login page
        navigate("/dang-nhap", { state: { email: values.email } });
      } catch (error: any) {
        // console.error("Register failed:", error);
        const validationErrors = error?.response?.data?.errors;
        if (validationErrors) {
          if (validationErrors.email) {
            formik.setFieldError("email", validationErrors.email[0]);
          }
          if (validationErrors.phone) {
            formik.setFieldError("phone", validationErrors.phone[0]);
          }
          setErrorMessage(error?.response?.data?.message || t("Thông tin đăng ký trùng lặp hoặc không hợp lệ."));
        } else {
          const serverError = error?.response?.data?.message || t("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
          setErrorMessage(serverError);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // console.log("Google Register Success:", tokenResponse);
      setLoading(true);
      setErrorMessage(null);
      try {
        await googleLoginApi(tokenResponse.access_token, "register");
        // console.log("Google Register response:", response);

        // Redirect to login page
        navigate("/dang-nhap");
      } catch (error: any) {
        // console.error("Google Register fail:", error);
        setErrorMessage(error?.response?.data?.message || t("Đăng ký bằng Google thất bại."));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      // console.error("Google Register Failed");
      setErrorMessage(t("Đăng ký bằng Google thất bại."));
    },
  });

  return {
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    registerWithGoogle,
    loading,
    errorMessage,
  };
};
