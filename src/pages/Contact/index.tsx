import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import useContact from "./useHook";

export const Contact = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { t } = useTranslation();

  const {questions, formik} = useContact();


  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const formContact = () => (
    <div className="py-6 md:py-10 w-full max-w-full overflow-hidden">
      <div className="flex flex-col w-full">
        {/* Breadcrumb */}
        <div className="text-sm md:text-base text-gray-500 mb-6 font-medium flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-teal-700 transition-colors ">
            {t("Trang Chủ")}
          </Link>
          <span>/</span>
          <Link to="/support" className="hover:text-teal-700 transition-colors">
            {t("Hỗ Trợ")}
          </Link>
          <span>/</span>
          <span className="text-teal-800 font-bold">{t("Liên hệ")}</span>
        </div>

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t("Liên hệ hỗ trợ")}</h1>
          <p className="text-sm md:text-base text-gray-600">{t("Gửi phản hồi hoặc yêu cầu hỗ trợ, chúng tôi sẽ phản hồi trong thời gian sớm nhất.")}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full">
          <div className="flex-1 w-full bg-white p-5 md:p-8 rounded-lg border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">{t("Gửi yêu cầu hỗ trợ")}</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-5 md:space-y-6">
              <div className="flex flex-col xl:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">{t("Họ và tên")}</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn Hùng"
                    className={`w-full px-4 py-2.5 rounded-lg border ${formik.touched.fullName && formik.errors.fullName ? "border-red-600" : "border-gray-200"} focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/30 text-base  placeholder-gray-400`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fullName}
                  />
                  {formik.touched.fullName && formik.errors.fullName && <div className="text-red-600 text-xs md:text-sm mt-1.5">{formik.errors.fullName}</div>}
                </div>
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 mb-2">{t("Số điện thoại")}</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="0901 234 567"
                    className={`w-full px-4 py-2.5 rounded-lg border ${formik.touched.phone && formik.errors.phone ? "border-red-600" : "border-gray-200"} focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/30 text-base placeholder-gray-400`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                  />
                  {formik.touched.phone && formik.errors.phone && <div className="text-red-600 text-xs md:text-sm mt-1.5">{formik.errors.phone}</div>}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">{t("Email")}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  className={`w-full px-4 py-2.5 rounded-lg border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-200"} focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/30 text-[14px] md:text-[15px] placeholder-gray-400`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && <div className="text-red-500 text-base mt-1.5">{formik.errors.email}</div>}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">{t("Nội dung liên hệ / góp ý")}</label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  className={`w-full px-4 py-2.5 rounded-lg border ${formik.touched.content && formik.errors.content ? "border-red-500" : "border-gray-200"} focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/30 text-[14px] md:text-[15px] placeholder-gray-400 resize-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.content}
                ></textarea>
                {formik.touched.content && formik.errors.content && <div className="text-red-500 text-base mt-1.5">{formik.errors.content}</div>}
              </div>

              <div className="flex items-start pt-1">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="agree"
                    name="agree"
                    type="checkbox"
                    className="w-5 h-5 text-teal-700border-gray-300 rounded focus:ring-teal-500 accent-teal-700 cursor-pointer"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.agree}
                  />
                </div>
                <div className="ml-3 text-base">
                  <label htmlFor="agree" className="text-gray-500 cursor-pointer select-none">
                    {t("Tôi đồng ý cho hệ thống liên hệ lại")}
                  </label>
                  {formik.touched.agree && formik.errors.agree && <div className="text-red-500 text-base mt-1">{formik.errors.agree as string}</div>}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full md:w-auto bg-[#0b5c53] hover:bg-[#084942] text-white font-medium py-2.5 px-8 rounded-lg transition-colors duration-200">
                  {t("Gửi yêu cầu")}
                </button>
                <p className="text-base text-gray-500 mt-4">{t("Thông thường chúng tôi phản hồi trong vòng 24 giờ.")}</p>
              </div>
            </form>
          </div>
          {/* Right Info */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#f3f7f9] p-5 md:p-8 rounded-lg border border-[#e1eaf1] h-full shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t("Hỗ trợ khách hàng")}</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="text-[#0b5c53] mt-1 mr-4">
                    <Icon icon="ph:phone-call-light" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base text-gray-500 mb-0.5">{t("Hotline")}</p>
                    <Link to="tel:0973244354" className="text-base font-bold text-gray-900">+84 973 244 354</Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-[#0b5c53] mt-1 mr-4">
                    <Icon icon="ph:envelope-simple-light" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base text-gray-500 mb-0.5">{t("Email")}</p>
                    <Link to="mailto:hungvuong04.dev@gmail.com" className="text-base font-bold text-gray-900 break-all">hungvuong04.dev@gmail.com</Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-[#0b5c53] mt-1 mr-4">
                    <Icon icon="ph:clock-light" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base text-gray-500 mb-0.5">{t("Giờ làm việc")}</p>
                    <p className="text-base font-bold text-gray-900">08:00 - 20:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const questionContact = () => (
    <div className="max-w-5xl mx-auto mb-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t("Câu hỏi thường gặp")}</h2>
      <div className="space-y-2.5">
        {questions.map((faq, index) => (
          <div
            key={index}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaqIndex === index ? "border-gray-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]" : "border-gray-200 hover:border-gray-300"}`}
          >
            <button className="w-full text-left px-6 py-4 flex items-center justify-between bg-white focus:outline-none" onClick={() => toggleFaq(index)}>
              <span className="font-semibold text-gray-800 text-lg">{t(faq.question)}</span>
              <Icon icon="ph:caret-down-bold" className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openFaqIndex === index ? "rotate-180 text-gray-800" : ""}`} />
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out bg-white ${openFaqIndex === index ? "max-h-40 pb-5 opacity-100" : "max-h-0 py-0 opacity-0"}`}>
              <p className="text-gray-600 md:text-base leading-relaxed">{t(faq.answer)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="w-full px-0 md:container md:mx-auto md:px-4 lg:px-8 md:max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12">{formContact()}</div>
        <div className="md:col-span-12">{questionContact()}</div>
      </div>
    </div>
  );
};
