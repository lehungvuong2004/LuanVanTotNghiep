import * as Yup from "yup";

export const newsValidationSchema = Yup.object().shape({
  title: Yup.string().required("Vui lòng nhập tiêu đề").max(150, "Tiêu đề không quá 150 ký tự"),
  thumbnail: Yup.string()
    .required("Vui lòng nhập đường dẫn hoặc tải lên hình thu nhỏ")
    .max(255, "Đường dẫn không quá 255 ký tự")
    .test("is-valid-image", "Hình ảnh phải là URL hoặc đường dẫn tải lên hợp lệ và có đuôi định dạng ảnh (.jpg, .jpeg, .png, .webp)", (value) => {
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
    }),
  summary: Yup.string().max(500, "Tóm tắt không quá 500 ký tự").nullable(),
  content: Yup.string().required("Vui lòng nhập nội dung bài viết"),
  status: Yup.string().oneOf(["draft", "published"]).required("Vui lòng chọn trạng thái"),
});
