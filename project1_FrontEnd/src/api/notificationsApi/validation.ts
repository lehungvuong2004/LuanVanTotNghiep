import * as Yup from "yup";

export const notificationValidationSchema = Yup.object().shape({
  title: Yup.string().required("Vui lòng nhập tiêu đề").max(100, "Tiêu đề không quá 100 ký tự"),
  message: Yup.string().required("Vui lòng nhập nội dung").max(500, "Nội dung không quá 500 ký tự"),
  type: Yup.string().required("Vui lòng chọn loại thông báo"),
  targetType: Yup.string().required("Vui lòng chọn đối tượng nhận"),
});
