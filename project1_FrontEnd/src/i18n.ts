import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import contactVn from "./locales/vn/contact.json";
import contactEn from "./locales/en/contact.json";
import commonVn from "./locales/vn/common.json";
import commonEn from "./locales/en/common.json";
import homeVn from "./locales/vn/home.json";
import homeEn from "./locales/en/home.json";
import responseVn from "./locales/vn/response.json";
import responseEn from "./locales/en/response.json";
import authVn from "./locales/vn/auth.json";
import authEn from "./locales/en/auth.json";
import jobVn from "./locales/vn/job.json";
import jobEn from "./locales/en/job.json";
import profileVn from "./locales/vn/profile.json";
import profileEn from "./locales/en/profile.json";
import newsVn from "./locales/vn/news.json";
import newsEn from "./locales/en/news.json";
import recruitmentVn from "./locales/vn/recruitment.json";
import recruitmentEn from "./locales/en/recruitment.json";
import pricingVn from "./locales/vn/pricing.json";
import pricingEn from "./locales/en/pricing.json";

const resources = {
  vn: {
    translation: {
      ...contactVn,
      ...commonVn,
      ...homeVn,
      ...responseVn,
      ...authVn,
      ...jobVn,
      ...profileVn,
      ...newsVn,
      ...recruitmentVn,
      ...pricingVn,
    },
  },
  en: {
    translation: {
      ...contactEn,
      ...commonEn,
      ...homeEn,
      ...responseEn,
      ...authEn,
      ...jobEn,
      ...profileEn,
      ...newsEn,
      ...recruitmentEn,
      ...pricingEn,
    },
  },
};

const savedLanguage = localStorage.getItem("language") || "vn";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "vn",
  interpolation: {
    escapeValue: false, 
  },
});

export default i18n;
