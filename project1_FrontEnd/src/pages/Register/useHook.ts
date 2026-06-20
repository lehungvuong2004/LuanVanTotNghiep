import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { registerApi, googleLoginApi } from "../../api/auth";

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
    validationSchema: Yup.object({
      fullName: Yup.string().required(t("Vui lòng nhập họ và tên")).min(2, t("Họ và tên phải có ít nhất 2 ký tự")).max(50, t("Họ và tên không được vượt quá 50 ký tự")),
      email: Yup.string().required(t("Vui lòng nhập email")).email(t("Vui lòng nhập đúng định dạng email")),
      phone: Yup.string()
        .required(t("Vui lòng nhập số điện thoại"))
        .matches(/^(0[3|5|7|8|9])[0-9]{8}$/, t("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)")),
      password: Yup.string()
        .required(t("Vui lòng nhập mật khẩu"))
        .min(6, t("Mật khẩu phải có ít nhất 6 ký tự"))
        .max(32, t("Mật khẩu không được vượt quá 32 ký tự"))
        .matches(/^\S*$/, t("Mật khẩu không được chứa khoảng trắng"))
        .matches(/[A-Z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in hoa"))
        .matches(/[a-z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in thường"))
        .matches(/[0-9]/, t("Mật khẩu phải chứa ít nhất 1 ký tự số")),
      confirmPassword: Yup.string()
        .required(t("Vui lòng xác nhận mật khẩu"))
        .oneOf([Yup.ref("password")], t("Mật khẩu xác nhận không khớp")),
      agreeTerms: Yup.boolean().oneOf([true], t("Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật")),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await registerApi({
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
        });
        console.log("Register response:", response);

        // Redirect to login page
        navigate("/dang-nhap", { state: { email: values.email } });
      } catch (error: any) {
        console.error("Register failed:", error);
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
      console.log("Google Register Success:", tokenResponse);
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await googleLoginApi(tokenResponse.access_token, "register");
        console.log("Google Register response:", response);

        // Redirect to login page
        navigate("/dang-nhap");
      } catch (error: any) {
        console.error("Google Register fail:", error);
        setErrorMessage(error?.response?.data?.message || t("Đăng ký bằng Google thất bại."));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.error("Google Register Failed");
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
