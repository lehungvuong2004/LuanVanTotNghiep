import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import useContact from "./useHook";

export const Contact = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { t } = useTranslation();

  const { questions, formik } = useContact();

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const formContact = () => (
    <div className="py-6 md:py-5 w-full max-w-full overflow-hidden">
      <div className="flex flex-col w-full">
        <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 font-medium flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors ">
            {t("Trang Chủ")}
          </Link>
          <span>/</span>
          <Link to="/support" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
            {t("Hỗ Trợ")}
          </Link>
          <span>/</span>
          <span className="text-teal-800 dark:text-teal-400 font-bold">{t("Liên hệ")}</span>
        </div>

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("Liên hệ hỗ trợ")}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("Gửi phản hồi hoặc yêu cầu hỗ trợ, chúng tôi sẽ phản hồi trong thời gian sớm nhất.")}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
          <div className="flex-1 w-full bg-white dark:bg-slate-800 p-5 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6">{t("Gửi yêu cầu hỗ trợ")}</h2>
            <form onSubmit={formik.handleSubmit} className="md:space-y-5">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Họ và tên")}</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn Hùng"
                    className={`w-full px-4 py-3 rounded-xl border ${formik.touched.fullName && formik.errors.fullName ? "border-red-600" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fullName}
                  />
                  {formik.touched.fullName && formik.errors.fullName && <div className="text-red-600 text-xs md:text-sm mt-1.5">{formik.errors.fullName}</div>}
                </div>
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Số điện thoại")}</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="0901 234 567"
                    className={`w-full px-4 py-3 rounded-xl border ${formik.touched.phone && formik.errors.phone ? "border-red-600" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                  />
                  {formik.touched.phone && formik.errors.phone && <div className="text-red-600 text-xs md:text-sm mt-1.5">{formik.errors.phone}</div>}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Email")}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 rounded-xl border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && <div className="text-red-500 text-base mt-1.5">{formik.errors.email}</div>}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Nội dung liên hệ / góp ý")}</label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  className={`w-full px-4 py-3 rounded-xl border ${formik.touched.content && formik.errors.content ? "border-red-500" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-300`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.content}
                ></textarea>
                {formik.touched.content && formik.errors.content && <div className="text-red-500 text-base mt-1.5">{formik.errors.content}</div>}
              </div>

              <div className="flex pt-1">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="agree"
                    name="agree"
                    type="checkbox"
                    className="w-5 h-5 text-cyan-950 dark:text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-cyan-950 dark:focus:ring-teal-500 accent-cyan-900 cursor-pointer transition-all duration-300"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.agree}
                  />
                </div>
                <div className="ml-3 text-base">
                  <label htmlFor="agree" className="text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    {t("Tôi đồng ý cho hệ thống liên hệ lại")}
                  </label>
                  {formik.touched.agree && formik.errors.agree && <div className="text-red-500 text-base mt-1">{formik.errors.agree}</div>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#026E5F] hover:bg-[#025E50] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
                >
                  {t("Gửi yêu cầu")}
                </button>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-4">{t("Thông thường chúng tôi phản hồi trong vòng 24 giờ.")}</p>
              </div>
            </form>
          </div>
          {/* Right Info */}
          <div className="w-full md:w-1/3">
            <div className="bg-linear-to-br from-teal-50 to-cyan-50/30 dark:from-slate-800 dark:to-slate-700 p-6 md:p-8 rounded-2xl border border-teal-100/50 dark:border-gray-600 h-full shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow duration-300 relative overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 relative z-10">{t("Hỗ trợ khách hàng")}</h2>
              <div className="space-y-6 relative z-10">
                <div className="flex items-start group">
                  <div className="text-teal-600 dark:text-teal-400 mt-1 mr-4 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-teal-100 dark:border-gray-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                    <Icon icon="ph:phone-call-light" className="w-6 h-6" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-base text-gray-500 dark:text-gray-400 mb-0.5">{t("Hotline")}</p>
                    <Link to="tel:0973244354" className="text-base font-bold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      +84 973 244 354
                    </Link>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="text-teal-600 dark:text-teal-400 mt-1 mr-4 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-teal-100 dark:border-gray-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                    <Icon icon="ph:envelope-simple-light" className="w-6 h-6" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-0.5">{t("Email")}</p>
                    <Link to="mailto:hungvuong04.dev@gmail.com" className="text-base font-bold text-gray-900 dark:text-white break-all hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      hungvuong04.dev@gmail.com
                    </Link>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="text-teal-600 dark:text-teal-400 mt-1 mr-4 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-teal-100 dark:border-gray-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                    <Icon icon="ph:clock-light" className="w-6 h-6" />
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-0.5">{t("Giờ làm việc")}</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">08:00 - 20:00</p>
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
    <div className="max-w-5xl mx-auto mb-10 mt-2">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">{t("Câu hỏi thường gặp")}</h2>
      <div className="space-y-2.5">
        {questions.map((faq, index) => (
          <div
            key={index}
            className={`border rounded-xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-800 ${openFaqIndex === index ? "border-teal-400 dark:border-teal-500 ring-1 ring-teal-400/50 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-sm"}`}
          >
            <button className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none group" onClick={() => toggleFaq(index)}>
              <span
                className={`font-semibold text-lg transition-colors duration-300 ${openFaqIndex === index ? "text-teal-800 dark:text-teal-400" : "text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300"}`}
              >
                {t(faq.question)}
              </span>
              <div
                className={`p-1.5 rounded-full transition-colors duration-300 ${openFaqIndex === index ? "bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 group-hover:text-teal-500 dark:group-hover:text-teal-400"}`}
              >
                <Icon icon="ph:caret-down-bold" className={`w-4 h-4 transition-transform duration-300 ${openFaqIndex === index ? "rotate-180" : ""}`} />
              </div>
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? "max-h-40 pb-5 opacity-100" : "max-h-0 py-0 opacity-0"}`}>
              <p className="text-gray-600 dark:text-gray-400 md:text-base leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-700">{t(faq.answer)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const featuresContact = () => (
    <div className="w-full max-w-5xl mx-auto px-4 pt-10 border-t border-blue-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:headset" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("HỖ TRỢ")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("Hỗ trợ 24/24 các vấn đề của bạn")}</p>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:ribbon" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("CHẤT LƯỢNG")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("Đội ngũ chuyên viên tư vấn giàu kinh nghiệm")}</p>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:handshake" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("DỊCH VỤ")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("Tư vấn trực tuyến")}</p>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:target" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("PHẠM VI")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("Hỗ trợ trên toàn quốc")}</p>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <Icon icon="mdi:chevron-down" className="text-5xl text-[#0099D6] dark:text-cyan-400 animate-bounce" />
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 md:px-16 mx-auto py-8">
      {formContact()}
      {questionContact()}
      {featuresContact()}
    </div>
  );
};
