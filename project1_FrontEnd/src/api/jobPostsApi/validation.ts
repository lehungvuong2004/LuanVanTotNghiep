import * as Yup from "yup";

export const getPostJobSchema = (t: any) =>
  Yup.object({
    jobTitle: Yup.string()
      .required(t("job.validation.title_req"))
      .test("not-all-numbers", t("job.validation.title_no_num"), (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s+/g, "");
        return !/^\d+$/.test(cleaned);
      }),
    customCategory: Yup.string()
      .required(t("job.validation.category_req"))
      .test("not-all-numbers", t("job.validation.category_no_num"), (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s+/g, "");
        return !/^\d+$/.test(cleaned);
      }),
    customServices: Yup.string()
      .required(t("job.validation.services_req"))
      .test("not-all-numbers", t("job.validation.services_no_num"), (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s+/g, "");
        return !/^\d+$/.test(cleaned);
      }),
    salary: Yup.string()
      .required(t("job.validation.salary_req"))
      .test("min-salary", t("job.validation.salary_min"), (val) => {
        if (!val) return false;
        const num = Number(val.replace(/\D/g, ""));
        return num >= 10000;
      })
      .test("max-vnpay", t("job.validation.salary_max"), (val) => {
        if (!val) return true;
        const num = Number(val.replace(/\D/g, ""));
        return num <= 1000000000;
      }),
    workingDate: Yup.string().required("Vui lòng chọn ngày làm việc"),
    workingTimeOnly: Yup.string().required("Vui lòng chọn giờ làm việc"),
    workingTime: Yup.string().test("not-past", t("job.validation.working_time_past"), function () {
      const { workingDate, workingTimeOnly } = this.parent;
      if (!workingDate || !workingTimeOnly) return true;
      return new Date(`${workingDate}T${workingTimeOnly}`).getTime() >= Date.now();
    }),
    expirationDateOnly: Yup.string().required("Vui lòng chọn ngày hết hạn"),
    expirationTimeOnly: Yup.string().required("Vui lòng chọn giờ hết hạn"),
    expirationDate: Yup.string().test("after-working", t("job.validation.expire_after"), function () {
      const { workingDate, workingTimeOnly, expirationDateOnly, expirationTimeOnly } = this.parent;
      if (!expirationDateOnly || !expirationTimeOnly || !workingDate || !workingTimeOnly) return true;
      return new Date(`${expirationDateOnly}T${expirationTimeOnly}`).getTime() > new Date(`${workingDate}T${workingTimeOnly}`).getTime();
    }),
    specificAddress: Yup.string().required(t("job.validation.address_req")),
    district: Yup.string().required(t("job.validation.district_req")),
    city: Yup.string().required(t("job.validation.city_req")),
    jobDescription: Yup.string().required(t("job.validation.desc_req")),
  });
