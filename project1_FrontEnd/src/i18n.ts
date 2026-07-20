import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import contactVn from "./locales/vn/contact.json";
import contactEn from "./locales/en/contact.json";

const resources = {
  vn: {
    translation: {
      ...contactVn,
    },
  },
  en: {
    translation: {
      ...contactEn,
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
