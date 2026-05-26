import { useFormik } from "formik";
import * as Yup from "yup";

export const useLogin = () => {
  const formik = useFormik({
    initialValues: {
      emailOrPhone: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: Yup.object({
      emailOrPhone: Yup.string()
        .required("Vui lòng nhập email hoặc số điện thoại")
        .min(5, "Tài khoản phải có ít nhất 5 ký tự")
        .max(30, "Tài khoản không được vượt quá 30 ký tự")
        .test("is-email-or-phone", "Vui lòng nhập đúng định dạng Email (vd: example@gmail.com) hoặc Số điện thoại (10 số)", (value) => {
          if (!value) return true;
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        }),
      password: Yup.string()
        .required("Vui lòng nhập mật khẩu")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .max(32, "Mật khẩu không được vượt quá 32 ký tự")
        .matches(/^\S*$/, "Mật khẩu không được chứa khoảng trắng")
        .matches(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 ký tự in hoa")
        .matches(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 ký tự in thường")
        .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự số")
        .matches(/[@$!%*?&]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)"),
    }),
    onSubmit: (values) => {
      console.log("Form data", values);
    },
  });
  return { formik };
};
