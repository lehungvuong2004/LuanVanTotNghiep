import * as Yup from "yup";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";

export default function useContact() {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
      agree: false,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required(t("Vui lòng nhập họ và tên")),
      phone: Yup.string()
        .matches(/^[0-9]+$/, t("Số điện thoại chỉ bao gồm số"))
        .min(10, t("Số điện thoại không hợp lệ"))
        .max(10, t("Số điện thoại dài hơn bình thường"))
        .required(t("Vui lòng nhập số điện thoại")),
      email: Yup.string().email(t("Email không hợp lệ")).required(t("Vui lòng nhập email")),
      message: Yup.string().required(t("Vui lòng nhập nội dung")),
      agree: Yup.boolean().oneOf([true], t("Bạn cần đồng ý với điều khoản")),
    }),
    onSubmit: (values) => {
      console.log(values);
      alert(t("Gửi yêu cầu thành công!"));
      formik.resetForm();
    },
  });
  const questions = [
    {
      id: 1,
      question: "Làm thế nào để tạo tài khoản?",
      answer: "Bạn có thể tạo tài khoản bằng cách truy cập vào website của chúng tôi và làm theo hướng dẫn.",
    },
    {
      id: 2,
      question: "Tôi đặt lịch như thế nào?",
      answer: "Bạn có thể đặt lịch thông qua ứng dụng hoặc gọi điện trực tiếp vào hotline của chúng tôi.",
    },
    {
      id: 3,
      question: "Tôi có thể hủy lịch không?",
      answer: "Có, bạn có thể hủy lịch trước 24h để không bị tính phí.",
    },
    {
      id: 4,
      question: "Bao lâu nhận phản hồi?",
      answer: "Thông thường chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.",
    },
    {
      id: 5,
      question: "Tôi có thể khiếu nại dịch vụ?",
      answer: "Nếu bạn không hài lòng, vui lòng liên hệ qua email support@homehelper.vn hoặc hotline để được giải quyết.",
    },
  ];

  return {
    questions,
    formik,
  };
}
