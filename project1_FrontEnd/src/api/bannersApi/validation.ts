import * as Yup from "yup";

export const bannerValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Vui lòng nhập tiêu đề banner")
    .max(150, "Tiêu đề không được vượt quá 150 ký tự"),
  image: Yup.string()
    .required("Vui lòng nhập đường dẫn hình ảnh banner")
    .max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
    .test(
      "is-valid-image",
      "Hình ảnh phải là URL hoặc đường dẫn tải lên hợp lệ và có đuôi định dạng ảnh (.jpg, .jpeg, .png, .webp)",
      (value) => {
        if (!value) return false;
        const hasValidExtension = /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(value);
        if (!hasValidExtension) return false;

        if (!value.startsWith("http://") && !value.startsWith("https://")) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    ),
  link: Yup.string()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .max(255, "Đường dẫn liên kết không được vượt quá 255 ký tự"),
  status: Yup.string()
    .oneOf(["active", "inactive"])
    .required("Vui lòng chọn trạng thái"),
});
