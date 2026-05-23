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
      "Hỗ Trợ": "Support",
      "Thông báo: Tìm kiếm việc làm tại Việt Nam":"Notification: Job search in Vietnam",
      "Gửi phản hồi hoặc yêu cầu hỗ trợ, chúng tôi sẽ phản hồi trong thời gian sớm nhất": "Send feedback or support requests, we will respond as soon as possible.",
      "Liên hệ hỗ trợ": "Support Contact",
      "Gửi yêu cầu hỗ trợ": "Send a support request",
      "Họ và tên": "Full name",
      "Số điện thoại": "Phone",
      "Email": "Email",
      "Nội dung liên hệ / góp ý": "Contact / feedback content",
      "Tôi đồng ý với các điều khoản và điều kiện": "I agree to the terms and conditions",
      "Gửi yêu cầu": "Send request",
      "Câu hỏi thường gặp": "Frequently asked questions",
      "Hỗ trợ khách hàng": "Customer Support",
      "Giờ làm việc": "Working Hours",
      "Gửi phản hồi hoặc yêu cầu hỗ trợ, chúng tôi sẽ phản hồi trong thời gian sớm nhất.": "Send feedback or support requests, we will respond as soon as possible.",
      "Làm thế nào để tạo tài khoản?": "How to create an account?",
      "Bạn có thể tạo tài khoản bằng cách truy cập vào website của chúng tôi và làm theo hướng dẫn.": "You can create an account by visiting our website and following the instructions.",
      "Tôi đặt lịch như thế nào?": "How do I schedule an appointment?",
      "Tôi có thể hủy lịch không?": "Can I cancel my appointment?",
      "Bạn có thể đặt lịch thông qua ứng dụng hoặc gọi điện trực tiếp vào hotline của chúng tôi.": "You can schedule an appointment through the app or by calling our hotline.",
      "Có, bạn có thể hủy lịch trước 24h để không bị tính phí.": "Yes, you can cancel your appointment 24 hours in advance to avoid being charged.",
      "Bao lâu nhận phản hồi?":"How long will it take to receive a response?",
      "Thông thường chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.": "We will respond within 24 working hours.",
      "Tôi có thể khiếu nại dịch vụ?":"I can complain about the service?",
      "Tôi đồng ý cho hệ thống liên hệ lại":"I agree to let the system contact me",
      "Vui lòng nhập họ và tên":"Please enter your full name",
      "Vui lòng nhập số điện thoại":"Please enter your phone number",
      "Vui lòng nhập email":"Please enter your email",
      "Vui lòng nhập nội dung":"Please enter your content",
      "Bạn cần đồng ý với điều khoản":"You need to agree to the terms",
      "Vui lòng đồng ý với điều khoản và điều kiện":"Please agree to the terms and conditions",
      "Thông thường chúng tôi phản hồi trong vòng 24 giờ.":"We will respond within 24 hours.",
      "Nếu bạn không hài lòng, vui lòng liên hệ qua email support@homehelper.vn hoặc hotline để được giải quyết.":"If you are not satisfied, please contact via email support@homehelper.vn or hotline to resolve.",
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
