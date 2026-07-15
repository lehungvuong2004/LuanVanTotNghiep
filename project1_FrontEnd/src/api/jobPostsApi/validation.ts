import * as Yup from "yup";

export const getPostJobSchema = (t: any) =>
  Yup.object({
    jobTitle: Yup.string()
      .required(t("Tiêu đề bài tuyển là bắt buộc"))
      .test("not-all-numbers", t("Tiêu đề không được chỉ chứa chữ số"), (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s+/g, "");
        return !/^\d+$/.test(cleaned);
      }),
    customCategory: Yup.string()
      .required(t("Vui lòng nhập tên danh mục của bạn"))
      .test("not-all-numbers", t("Tên danh mục không được chỉ chứa chữ số"), (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s+/g, "");
        return !/^\d+$/.test(cleaned);
      }),
    customServices: Yup.string()
      .required(t("Vui lòng nhập dịch vụ của bạn"))
      .test("not-all-numbers", t("Tên dịch vụ không được chỉ chứa chữ số"), (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s+/g, "");
        return !/^\d+$/.test(cleaned);
      }),
    salary: Yup.string()
      .required(t("Mức lương là bắt buộc"))
      .test("min-salary", t("Mức lương tối thiểu phải là 10.000 đ"), (val) => {
        if (!val) return false;
        const num = Number(val.replace(/\D/g, ""));
        return num >= 10000;
      })
      .test("max-vnpay", t("Mức lương tối đa không vượt quá giới hạn 1.000.000.000 đ của VNPay"), (val) => {
        if (!val) return true;
        const num = Number(val.replace(/\D/g, ""));
        return num <= 1000000000;
      }),
    workingTime: Yup.string()
      .required(t("Thời gian làm việc là bắt buộc"))
      .test("not-past", t("Thời gian làm việc không được là thời điểm trong quá khứ"), (val) => {
        if (!val) return true;
        return new Date(val).getTime() >= Date.now();
      }),
    expirationDate: Yup.string()
      .required(t("Ngày hết hạn là bắt buộc"))
      .test(
        "after-working",
        t("Ngày hết hạn phải sau thời gian làm việc"),
        function (val) {
          const { workingTime } = this.parent;
          if (!val || !workingTime) return true;
          return new Date(val).getTime() > new Date(workingTime).getTime();
        }
      ),
    specificAddress: Yup.string().required(t("Địa chỉ cụ thể là bắt buộc")),
    district: Yup.string().required(t("Quận/Huyện là bắt buộc")),
    city: Yup.string().required(t("Thành phố là bắt buộc")),
    jobDescription: Yup.string().required(t("Mô tả công việc là bắt buộc")) });
