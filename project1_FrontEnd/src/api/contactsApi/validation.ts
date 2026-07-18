import * as Yup from "yup";

export const getContactValidationSchema = (t: (key) => string) =>
  Yup.object({
    fullName: Yup.string().required(t("Vui lòng nhập họ và tên")),
    phone: Yup.string()
      .matches(/^[0-9]+$/, t("Số điện thoại chỉ bao gồm số"))
      .min(10, t("Số điện thoại không hợp lệ"))
      .max(10, t("Số điện thoại dài hơn bình thường"))
      .required(t("Vui lòng nhập số điện thoại")),
    email: Yup.string().email(t("Email không hợp lệ")).required(t("Vui lòng nhập email")),
    message: Yup.string().required(t("Vui lòng nhập nội dung")),
    agree: Yup.boolean().oneOf([true], t("Bạn cần đồng ý với điều khoản")),
  });
