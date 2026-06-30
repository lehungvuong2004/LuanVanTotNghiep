import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getCustomerAddressesApi, addCustomerAddressApi, type CustomerAddress } from "../../api/profile";
import { createJobPostApi } from "../../api/jobPosts";

// ----------------------------------------------------------------
// Derive urgency level and multiplier from (expirationDate - workingTime)
//   diff < 2 days  → urgent  → x0.4
//   diff < 4 days  → normal  → x0.2
//   diff >= 4 days → long    → x1.0 (original price)
// ----------------------------------------------------------------
export const getUrgencyFromDates = (workingTime: string, expirationDate: string) => {
  if (!workingTime || !expirationDate) return null;
  const diffDays =
    (new Date(expirationDate).getTime() - new Date(workingTime).getTime()) / 86400000;
  if (diffDays < 2)
    return {
      level: "urgent",
      multiplier: 1.4,
      label: "Cần gấp (< 2 ngày) — x0.4",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900",
    };
  if (diffDays < 4)
    return {
      level: "normal",
      multiplier: 1.2,
      label: "Bình thường (< 4 ngày) — x0.2",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900",
    };
  return {
    level: "long",
    multiplier: 1.0,
    label: "Lâu dài (≥ 4 ngày) — giá gốc",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900",
  };
};

export const usePostAJobHook = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | string>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validationSchema = Yup.object({
    jobTitle: Yup.string().required(t("Tiêu đề bài tuyển là bắt buộc")),
    customCategory: Yup.string().required(t("Vui lòng nhập tên danh mục của bạn")),
    customServices: Yup.string().required(t("Vui lòng nhập dịch vụ của bạn")),
    salary: Yup.string().required(t("Mức lương là bắt buộc")),
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
    jobDescription: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      jobTitle: "",
      serviceCategory: "other",
      customCategory: "",
      customServices: "",
      salary: "",
      requiredServices: [] as number[],
      workingTime: "",
      expirationDate: "",
      specificAddress: "",
      district: "",
      city: "",
      jobDescription: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        // Save new address to customer profile if needed
        if (isNewAddress) {
          const isDuplicate = addresses.some(
            (item) =>
              item.address.trim().toLowerCase() ===
                values.specificAddress.trim().toLowerCase() &&
              (item.district || "").trim().toLowerCase() ===
                values.district.trim().toLowerCase() &&
              (item.city || "").trim().toLowerCase() ===
                values.city.trim().toLowerCase()
          );
          if (isDuplicate) {
            formik.setFieldError(
              "specificAddress",
              t(
                "Địa chỉ này đã tồn tại trong sổ địa chỉ của bạn. Vui lòng chọn từ danh sách."
              )
            );
            setIsLoading(false);
            return;
          }
          try {
            await addCustomerAddressApi({
              address: values.specificAddress,
              district: values.district,
              city: values.city,
              is_default: addresses.length === 0,
            });
          } catch (addrErr) {
            console.error("Failed to save new address to customer profile:", addrErr);
          }
        }

        // Compute multiplier from (expirationDate - workingTime) diff
        const baseSalary = Number(values.salary.replace(/\D/g, "")) || 0;
        const urgencyInfo = getUrgencyFromDates(values.workingTime, values.expirationDate);
        const multiplier = urgencyInfo?.multiplier ?? 1.0;
        const salaryVal = Math.round(baseSalary * multiplier);

        const isCustom = values.serviceCategory === "other";
        let prefix = "";
        if (isCustom) prefix += `[Danh mục: ${values.customCategory}]\n`;
        if (values.customServices.trim())
          prefix += `[Dịch vụ: ${values.customServices.trim()}]\n`;
        const finalDescription = prefix
          ? `${prefix}\n${values.jobDescription}`
          : values.jobDescription;

        await createJobPostApi({
          title: values.jobTitle,
          description: finalDescription,
          category_id: isCustom ? undefined : Number(values.serviceCategory),
          salary: salaryVal,
          address: values.specificAddress,
          district: values.district,
          city: values.city,
          working_time: values.workingTime,
          expired_at: values.expirationDate || undefined,
          service_ids: isCustom ? [] : values.requiredServices.map(Number),
        });

        navigate("/tuyen-dung");
      } catch (err: any) {
        console.error("Error creating job post:", err);
        setErrorMsg(
          err?.response?.data?.message ||
            t("Đã xảy ra lỗi khi đăng bài tuyển dụng. Vui lòng thử lại.")
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Fetch customer addresses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const addrRes = await getCustomerAddressesApi();
        setAddresses(addrRes.data || []);
        if (addrRes.data && addrRes.data.length > 0) {
          const defaultAddr =
            addrRes.data.find((a) => a.is_default === 1) || addrRes.data[0];
          setSelectedAddressId(defaultAddr.id);
          formik.setFieldValue("specificAddress", defaultAddr.address);
          formik.setFieldValue("district", defaultAddr.district || "");
          formik.setFieldValue("city", defaultAddr.city || "");
          setIsNewAddress(false);
        } else {
          setIsNewAddress(true);
          setSelectedAddressId("new");
        }
      } catch (addrErr) {
        console.error("Could not fetch customer addresses:", addrErr);
        setIsNewAddress(true);
        setSelectedAddressId("new");
      }
    };
    fetchData();
  }, []);

  const handleAddressChange = (idStr: string) => {
    if (idStr === "new") {
      setIsNewAddress(true);
      setSelectedAddressId("new");
      formik.setFieldValue("specificAddress", "");
      formik.setFieldValue("district", "");
      formik.setFieldValue("city", "");
    } else {
      setIsNewAddress(false);
      const addrId = Number(idStr);
      setSelectedAddressId(addrId);
      const matched = addresses.find((a) => a.id === addrId);
      if (matched) {
        formik.setFieldValue("specificAddress", matched.address);
        formik.setFieldValue("district", matched.district || "");
        formik.setFieldValue("city", matched.city || "");
      }
    }
  };

  // Derived urgency from currently entered dates (reactive)
  const computedUrgency = getUrgencyFromDates(
    formik.values.workingTime,
    formik.values.expirationDate
  );

  return {
    formik,
    addresses,
    isNewAddress,
    selectedAddressId,
    handleAddressChange,
    isLoading,
    errorMsg,
    computedUrgency,
  };
};
