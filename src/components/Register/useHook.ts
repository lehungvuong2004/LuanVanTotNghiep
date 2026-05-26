import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

export const useRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      fullName: Yup.string()
        .required("Vui lòng nhập họ và tên")
        .min(2, "Họ và tên phải có ít nhất 2 ký tự")
        .max(50, "Họ và tên không được vượt quá 50 ký tự"),
      email: Yup.string()
        .required("Vui lòng nhập email")
        .email("Vui lòng nhập đúng định dạng email"),
      phone: Yup.string()
        .required("Vui lòng nhập số điện thoại")
        .matches(/^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"),
      password: Yup.string()
        .required("Vui lòng nhập mật khẩu")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .max(32, "Mật khẩu không được vượt quá 32 ký tự")
        .matches(/^\S*$/, "Mật khẩu không được chứa khoảng trắng")
        .matches(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 ký tự in hoa")
        .matches(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 ký tự in thường")
        .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự số")
        .matches(/[@$!%*?&]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)"),
      confirmPassword: Yup.string()
        .required("Vui lòng xác nhận mật khẩu")
        .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
      agreeTerms: Yup.boolean()
        .oneOf([true], "Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật"),
    }),
    onSubmit: (values) => {
      console.log("Form register data", values);
    },
  });

  return { 
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword
  };
};
