import * as Yup from "yup";

export const getContactValidationSchema = (t: (key: string) => string) =>
  Yup.object({
    fullName: Yup.string().required(t("contact.validation.fullNameRequired")),
    phone: Yup.string()
      .matches(/^[0-9]+$/, t("contact.validation.phoneDigitsOnly"))
      .min(10, t("contact.validation.phoneInvalid"))
      .max(10, t("contact.validation.phoneMax"))
      .required(t("contact.validation.phoneRequired")),
    email: Yup.string().email(t("contact.validation.emailInvalid")).required(t("contact.validation.emailRequired")),
    message: Yup.string().required(t("contact.validation.messageRequired")),
    agree: Yup.boolean().oneOf([true], t("contact.validation.agreeRequired")),
  });
