import * as Yup from "yup";
import { ROLES } from "../../constants/roles";

export const getAddUserSchema = (t: (key: string) => string = (key) => key) =>
  Yup.object().shape({
    full_name: Yup.string()
      .min(2, t("Họ tên phải có ít nhất 2 ký tự"))
      .max(100, t("Họ tên không được vượt quá 100 ký tự"))
      .required(t("Vui lòng nhập họ tên")),
    email: Yup.string()
      .email(t("Định dạng email không hợp lệ"))
      .required(t("Vui lòng nhập email")),
    phone: Yup.string()
      .matches(/^(0[3|5|7|8|9])[0-9]{8}$/, t("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"))
      .nullable(),
    role_id: Yup.number()
      .oneOf([ROLES.ADMIN, ROLES.OPERATOR, ROLES.HELPER, ROLES.CUSTOMER], t("Vai trò không hợp lệ"))
      .required(t("Vui lòng chọn vai trò")),
    password: Yup.string()
      .min(6, t("Mật khẩu phải chứa ít nhất 6 ký tự"))
      .matches(/[A-Z]/, t("Mật khẩu phải chứa ít nhất 1 chữ in hoa"))
      .matches(/[a-z]/, t("Mật khẩu phải chứa ít nhất 1 chữ thường"))
      .matches(/[0-9]/, t("Mật khẩu phải chứa ít nhất 1 số"))
      .required(t("Vui lòng nhập mật khẩu")),
    status: Yup.string()
      .oneOf(["active", "inactive", "banned"])
      .required(),
  });

export const getEditUserSchema = (t: (key) => string = (key) => key) =>
  Yup.object().shape({
    full_name: Yup.string()
      .min(2, t("Họ tên phải có ít nhất 2 ký tự"))
      .max(100, t("Họ tên không được vượt quá 100 ký tự"))
      .required(t("Vui lòng nhập họ tên")),
    email: Yup.string()
      .email(t("Định dạng email không hợp lệ"))
      .required(t("Vui lòng nhập email")),
    phone: Yup.string()
      .matches(/^(0[3|5|7|8|9])[0-9]{8}$/, t("Số điện thoại không hợp lệ"))
      .nullable(),
    role_id: Yup.number()
      .oneOf([ROLES.ADMIN, ROLES.OPERATOR, ROLES.HELPER, ROLES.CUSTOMER], t("Vai trò không hợp lệ"))
      .required(t("Vui lòng chọn vai trò")),
    password: Yup.string()
      .min(6, t("Mật khẩu phải chứa ít nhất 6 ký tự"))
      .matches(/[A-Z]/, t("Mật khẩu phải chứa ít nhất 1 chữ in hoa"))
      .matches(/[a-z]/, t("Mật khẩu phải chứa ít nhất 1 chữ thường"))
      .matches(/[0-9]/, t("Mật khẩu phải chứa ít nhất 1 số"))
      .nullable(),
    avatar: Yup.string().nullable(),
  });
