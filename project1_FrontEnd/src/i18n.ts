import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  vn: {
    translation: {
    } },
  en: {
    translation: {
    
    } } };
const savedLanguage = localStorage.getItem("language") || "vn";
i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "vn",
  interpolation: {
    escapeValue: false } });

export default i18n;
