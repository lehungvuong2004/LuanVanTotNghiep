import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { createContactApi } from "../../api/contactsApi/contacts";
import { getContactValidationSchema } from "../../api/contactsApi/validation";
import { useToast } from "../../contexts/ToastContext";

export default function useContact() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
      agree: false,
    },
    validationSchema: getContactValidationSchema(t),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await createContactApi({
          full_name: values.fullName,
          phone: values.phone,
          email: values.email,
          message: values.message,
        });
        showToast("success", t("contact.toast.successTitle"), t("contact.toast.successMessage"));
        formik.resetForm();
      } catch (error: any) {
        showToast("error", t("contact.toast.errorTitle"), error?.response?.data?.message || t("contact.toast.errorMessage"));
      } finally {
        setLoading(false);
      }
    },
  });

  const questions = [
    {
      id: 1,
      question: "contact.faq.q1",
      answer: "contact.faq.a1",
    },
    {
      id: 2,
      question: "contact.faq.q2",
      answer: "contact.faq.a2",
    },
    {
      id: 3,
      question: "contact.faq.q3",
      answer: "contact.faq.a3",
    },
    {
      id: 4,
      question: "contact.faq.q4",
      answer: "contact.faq.a4",
    },
    {
      id: 5,
      question: "contact.faq.q5",
      answer: "contact.faq.a5",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return {
    questions,
    formik,
    toggleFaq,
    openFaqIndex,
    loading,
  };
}
