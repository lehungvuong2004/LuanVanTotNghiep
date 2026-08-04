import { useToast } from "../../contexts/ToastContext";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { getCustomerAddressesApi, addCustomerAddressApi, type CustomerAddress } from "../../api/profileApi/profile";
import { createJobPostApi } from "../../api/jobPostsApi/jobPosts";
import { getPostJobSchema } from "../../api/jobPostsApi/validation";

import { useGeolocation } from "../../hooks/useGeolocation";
import { parseVietnamAddress } from "../../types/location";

export const getUrgencyFromDates = (workingTime: string, expirationDate: string) => {
  if (!workingTime || !expirationDate) return null;
  const diffDays = (new Date(expirationDate).getTime() - new Date(workingTime).getTime()) / 86400000;

  if (diffDays <= 4) {
    return {
      level: "urgent",
      multiplier: 1.25,
      label: diffDays < 2 ? "Cần gấp (< 2 ngày) — +25%" : "Cần gấp (2 - 4 ngày) — +25%",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900",
    };
  }
  if (diffDays <= 7) {
    return {
      level: "normal",
      multiplier: 1.15,
      label: "Bình thường (4 - 7 ngày) — +15%",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900",
    };
  }
  return {
    level: "long",
    multiplier: 1.0,
    label: "Lâu dài (> 7 ngày) — Giá gốc (+0%)",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900",
  };
};

export const getAddressFieldName = (fieldVal: any): string => {
  if (!fieldVal) return "";
  if (typeof fieldVal === "object" && fieldVal !== null) {
    return fieldVal.name || "";
  }
  return String(fieldVal);
};

interface PrefilledPost {
  title?: string;
  description?: string;
  salary?: number | string;
  address?: string;
  district?: string;
  city?: string;
}

export interface PostAJobFormValues {
  jobTitle: string;
  serviceCategory: string;
  customCategory: string;
  customServices: string;
  salary: string;
  requiredServices: number[];
  workingTime: string;
  workingDate: string;
  workingTimeOnly: string;
  expirationDate: string;
  expirationDateOnly: string;
  expirationTimeOnly: string;
  specificAddress: string;
  district: string;
  city: string;
  jobDescription: string;
}

export const usePostAJobHook = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const prefilledPost = location.state?.prefilledPost as PrefilledPost | undefined;

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | string>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isGeoActive, setIsGeoActive] = useState(false);
  const { showToast } = useToast();

  const { getCurrentLocation, addressDetails, address: rawAddress, loading: geoLoading, error: geoError, clearLocation } = useGeolocation();

  const handleGeoLocation = () => {
    setIsGeoActive(true);
    getCurrentLocation();
  };

  const validationSchema = getPostJobSchema(t);

  const formik = useFormik<PostAJobFormValues>({
    initialValues: {
      jobTitle: prefilledPost?.title || "",
      serviceCategory: "other",
      customCategory: (() => {
        if (!prefilledPost) return "";
        const catMatch = prefilledPost.description?.match(/^\[Danh mục:\s*([^\]]+)\]/);
        return catMatch ? catMatch[1] : "";
      })(),
      customServices: (() => {
        if (!prefilledPost) return "";
        const serviceMatch = prefilledPost.description?.match(/^\[Dịch vụ:\s*([^\]]+)\]/);
        return serviceMatch ? serviceMatch[1] : "";
      })(),
      salary: prefilledPost?.salary ? Math.round(Number(prefilledPost.salary)).toLocaleString("vi-VN") : "",
      requiredServices: [] as number[],
      workingTime: "",
      workingDate: "",
      workingTimeOnly: "",
      expirationDate: "",
      expirationDateOnly: "",
      expirationTimeOnly: "",
      specificAddress: prefilledPost?.address || "",
      district: prefilledPost?.district || "",
      city: prefilledPost?.city || "",
      jobDescription: (() => {
        if (!prefilledPost) return "";
        let cleanDesc = prefilledPost.description || "";
        cleanDesc = cleanDesc.replace(/^\[Danh mục:\s*[^\]]+\]\s*/, "");
        cleanDesc = cleanDesc.replace(/^\[Dịch vụ:\s*[^\]]+\]\s*/, "");
        return cleanDesc;
      })(),
    },
    validationSchema,
    onSubmit: async (values) => {
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
      if (currentUser) {
        if (!currentUser.full_name?.trim() || !currentUser.phone?.trim() || !currentUser.email?.trim()) {
          showToast("warning", t("job.req_info_title"), t("job.toast.req_info_desc"));
          setTimeout(() => {
            navigate("/ho-so");
          }, 2000);
          return;
        }
      }
      setIsLoading(true);
      setErrorMsg("");
      try {
        // Save new address to customer profile if needed
        if (isNewAddress) {
          const isDuplicate = addresses.some(
            (item) =>
              item.address.trim().toLowerCase() === values.specificAddress.trim().toLowerCase() &&
              getAddressFieldName(item.district).trim().toLowerCase() === values.district.trim().toLowerCase() &&
              getAddressFieldName(item.city).trim().toLowerCase() === values.city.trim().toLowerCase(),
          );
          if (isDuplicate) {
            formik.setFieldError("specificAddress", t("job.validation.duplicate_address"));
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
          } catch {
            // Error logged if needed
          }
        }

        // Ghép ngày + giờ tách biệt thành chuỗi ISO để gửi API và tính urgency
        const derivedWorkingTime = values.workingDate && values.workingTimeOnly ? `${values.workingDate}T${values.workingTimeOnly}` : values.workingTime;
        const derivedExpirationDate = values.expirationDateOnly && values.expirationTimeOnly ? `${values.expirationDateOnly}T${values.expirationTimeOnly}` : values.expirationDate;

        const baseSalary = Number(values.salary.replace(/\D/g, "")) || 0;
        const urgencyInfo = getUrgencyFromDates(derivedWorkingTime, derivedExpirationDate);
        const multiplier = urgencyInfo?.multiplier ?? 1.0;
        const salaryVal = Math.round(baseSalary * multiplier);

        const isCustom = values.serviceCategory === "other";
        let prefix = "";
        if (isCustom) prefix += `[Danh mục: ${values.customCategory}]\n`;
        if (values.customServices.trim()) prefix += `[Dịch vụ: ${values.customServices.trim()}]\n`;
        const finalDescription = prefix ? `${prefix}\n${values.jobDescription}` : values.jobDescription;

        await createJobPostApi({
          title: values.jobTitle,
          description: finalDescription,
          category_id: isCustom ? undefined : Number(values.serviceCategory),
          salary: salaryVal,
          address: values.specificAddress,
          district: values.district,
          city: values.city,
          working_time: derivedWorkingTime,
          expired_at: derivedExpirationDate || undefined,
          service_ids: isCustom ? [] : values.requiredServices.map(Number),
        });

        showToast("success", t("job.toast.post_success"), t("job.toast.post_success_desc"));

        formik.resetForm();
      } catch (err: any) {
        // console.error("Error creating job post:", err);
        const errMsg = err?.response?.data?.message || t("job.toast.post_error");
        setErrorMsg(errMsg);
        showToast("error", t("Lỗi"), errMsg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if ((addressDetails || rawAddress) && isGeoActive) {
      const parsed = parseVietnamAddress(addressDetails, rawAddress);

      if (parsed.specificAddress) formik.setFieldValue("specificAddress", parsed.specificAddress);
      if (parsed.district) formik.setFieldValue("district", parsed.district);
      if (parsed.city) formik.setFieldValue("city", parsed.city);

      Promise.resolve().then(() => {
        setIsGeoActive(false);
        clearLocation();
      });
    }
  }, [addressDetails, rawAddress, isGeoActive, clearLocation, formik]);

  // Fetch customer addresses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const addrRes = await getCustomerAddressesApi();
        setAddresses(addrRes.data || []);
        if (addrRes.data && addrRes.data.length > 0) {
          const defaultAddr = addrRes.data.find((a) => a.is_default === 1) || addrRes.data[0];
          setSelectedAddressId(defaultAddr.id);
          formik.setFieldValue("specificAddress", defaultAddr.address);
          formik.setFieldValue("district", getAddressFieldName(defaultAddr.district));
          formik.setFieldValue("city", getAddressFieldName(defaultAddr.city));
          setIsNewAddress(false);
        } else {
          setIsNewAddress(true);
          setSelectedAddressId("new");
        }
      } catch {
        setIsNewAddress(true);
        setSelectedAddressId("new");
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        formik.setFieldValue("district", getAddressFieldName(matched.district));
        formik.setFieldValue("city", getAddressFieldName(matched.city));
      }
    }
  };

  // Derived urgency from currently entered dates (reactive)
  const computedUrgency = getUrgencyFromDates(formik.values.workingTime, formik.values.expirationDate);

  const handlePreSubmit = (e: any) => {
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
    if (currentUser) {
      if (!currentUser.full_name?.trim() || !currentUser.phone?.trim() || !currentUser.email?.trim()) {
        e.preventDefault();
        showToast("warning", t("job.req_info_title"), t("job.toast.req_info_desc"));
        setTimeout(() => {
          navigate("/ho-so");
        }, 2000);
        return false;
      }
    }
    return true;
  };

  return {
    formik,
    addresses,
    isNewAddress,
    selectedAddressId,
    handleAddressChange,
    isLoading,
    errorMsg,
    computedUrgency,
    geoLoading,
    geoError,
    handleGeoLocation,
    handlePreSubmit,
  };
};
