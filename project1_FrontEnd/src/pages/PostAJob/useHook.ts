import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

export const serviceCategories = [
  { value: "don_dep_nha_cua", label: "Dọn dẹp nhà cửa" },
  { value: "cham_soc_nguoi_benh", label: "Chăm sóc người bệnh" },
  { value: "nau_an", label: "Nấu ăn gia đình" },
  { value: "trong_tre", label: "Trông trẻ" },
];

export const requiredServicesOptions = [
  { value: "don_dep", label: "Dọn dẹp" },
  { value: "giat_ui", label: "Giặt ủi" },
  { value: "nau_an", label: "Nấu ăn" },
  { value: "trong_tre", label: "Trồng trẻ" },
];

export const usePostAJobHook = () => {
  const { t } = useTranslation();
  
  const validationSchema = Yup.object({
    jobTitle: Yup.string().required(t("Tiêu đề bài tuyển là bắt buộc")),
    serviceCategory: Yup.string().required(t("Danh mục dịch vụ là bắt buộc")),
    salary: Yup.string().required(t("Mức lương là bắt buộc")),
    requiredServices: Yup.array().min(1, t("Chọn ít nhất một dịch vụ")),
    workingTime: Yup.string().required(t("Thời gian làm việc là bắt buộc")),
    expirationDate: Yup.date().required(t("Ngày hết hạn là bắt buộc")).nullable(),
    specificAddress: Yup.string().required(t("Địa chỉ cụ thể là bắt buộc")),
    district: Yup.string().required(t("Quận/Huyện là bắt buộc")),
    city: Yup.string().required(t("Thành phố là bắt buộc")),
    jobDescription: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      jobTitle: "",
      serviceCategory: "don_dep_nha_cua",
      salary: "",
      requiredServices: [],
      workingTime: "",
      expirationDate: "",
      specificAddress: "",
      district: "",
      city: "",
      jobDescription: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form values:", values);
      // Có thể gọi API ở đây
    },
  });

  const handleRequiredServiceToggle = (value: string) => {
    const currentServices = formik.values.requiredServices as string[];
    if (currentServices.includes(value)) {
      formik.setFieldValue(
        "requiredServices",
        currentServices.filter((s) => s !== value),
      );
    } else {
      formik.setFieldValue("requiredServices", [...currentServices, value]);
    }
  };

  return {
    formik,
    serviceCategories,
    requiredServicesOptions,
    handleRequiredServiceToggle,
  };
};
