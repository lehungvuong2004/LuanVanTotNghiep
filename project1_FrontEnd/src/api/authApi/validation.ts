import * as Yup from "yup";

export const getLoginSchema = (t: any) =>
  Yup.object({
    email: Yup.string().required(t("Vui lòng nhập email")).email(t("Vui lòng nhập đúng định dạng email")),
    password: Yup.string()
      .required(t("Vui lòng nhập mật khẩu"))
      .min(6, t("Mật khẩu phải có ít nhất 6 ký tự"))
      .max(32, t("Mật khẩu không được vượt quá 32 ký tự"))
      .matches(/^\S*$/, t("Mật khẩu không được chứa khoảng trắng"))
      .matches(/[A-Z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in hoa"))
      .matches(/[a-z]/, t("Mật khẩu phải chứa ít nhất 1 ký tự in thường"))
      .matches(/[0-9]/, t("Mật khẩu phải chứa ít nhất 1 ký tự số")),
  });

export const getRegisterSchema = (t: any) =>
  Yup.object({
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
  });

export const getForgotPasswordStep1Schema = (t: any) =>
  Yup.object({
    emailOrPhone: Yup.string()
      .required(t("Vui lòng nhập email"))
      .max(50, t("Email không được vượt quá 50 ký tự"))
      .test("is-email", t("Vui lòng nhập đúng định dạng Email (vd: example@gmail.com)"), (value) => {
        if (!value) return true;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(value);
      }),
  });

export const getForgotPasswordStep2Schema = (t: any) =>
  Yup.object({
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
  });

export const getForgotPasswordStep3Schema = (t: any) =>
  Yup.object({
    password: Yup.string().required(t("Vui lòng nhập mật khẩu mới")).min(6, t("Mật khẩu phải có ít nhất 6 ký tự")),
    confirmPassword: Yup.string()
      .required(t("Vui lòng xác nhận mật khẩu"))
      .oneOf([Yup.ref("password")], t("Mật khẩu xác nhận không khớp")),
  });
