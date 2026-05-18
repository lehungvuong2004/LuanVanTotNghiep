import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vn: {
    translation: {
      // "Danh Mục": "Danh Mục",
      // "Trang Chủ": "Trang Chủ",
      // "Về chúng tôi": "Về chúng tôi",
      // "Thông tin tuyển dụng": "Thông tin tuyển dụng",
      // "Liên hệ": "Liên hệ",
      // "Đăng bài tuyển": "Đăng bài tuyển",
      // "Việt Nam": "Việt Nam",
      // "English": "English",
      // "Thông báo: Tìm kiếm việc làm tại Việt Nam":"Thông báo: Tìm kiếm việc làm tại Việt Nam"
    }
  },
  en: {
    translation: {
      "Danh Mục": "Categories",
      "Trang Chủ": "Home",
      "Về chúng tôi": "About Us",
      "Thông tin tuyển dụng": "Careers",
      "Liên hệ": "Contact",
      "Đăng bài tuyển": "Post a Job",
      "Việt Nam": "Vietnamese",
      "English": "English",
      "Thông báo: Tìm kiếm việc làm tại Việt Nam":"Notification: Job search in Vietnam"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vn",
    fallbackLng: "vn",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
