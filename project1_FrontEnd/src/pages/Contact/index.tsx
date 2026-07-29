import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import useContact from "./useHook";
import contactImg from "../../assets/images/contact/contact.webp";
import AnimateOnScrollReveal from "../../components/AnimateOnScrollReveal";

export const Contact = () => {
  const { t } = useTranslation();
  const { questions, formik, loading, toggleFaq, openFaqIndex } = useContact();

  // 1. RENDER CONTACT FORM
  const renderFormContact = () => (
    <div className="py-6 md:py-5 w-full max-w-full overflow-hidden">
      <div className="flex flex-col w-full">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
          <div className="flex-1 w-full bg-white dark:bg-slate-800 p-5 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6">{t("contact.form.title")}</h2>
            <form onSubmit={formik.handleSubmit} className="md:space-y-5">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("contact.form.fullName")}</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t("contact.form.fullNamePlaceholder")}
                    className={`w-full px-4 py-3 rounded-xl border ${formik.touched.fullName && formik.errors.fullName ? "border-red-600" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fullName}
                  />
                  {formik.touched.fullName && formik.errors.fullName && <div className="text-red-600 text-xs md:text-sm mt-1.5">{formik.errors.fullName}</div>}
                </div>
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("contact.form.phone")}</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder={t("contact.form.phonePlaceholder")}
                    className={`w-full px-4 py-3 rounded-xl border ${formik.touched.phone && formik.errors.phone ? "border-red-600" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                  />
                  {formik.touched.phone && formik.errors.phone && <div className="text-red-600 text-xs md:text-sm mt-1.5">{formik.errors.phone}</div>}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("contact.form.email")}</label>
                <input
                  type="email"
                  name="email"
                  placeholder={t("contact.form.emailPlaceholder")}
                  className={`w-full px-4 py-3 rounded-xl border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && <div className="text-red-500 text-base mt-1.5">{formik.errors.email}</div>}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t("contact.form.message")}</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder={t("contact.form.messagePlaceholder")}
                  className={`w-full px-4 py-3 rounded-xl border ${formik.touched.message && formik.errors.message ? "border-red-500" : "border-gray-200 dark:border-gray-600"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 text-base dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-300`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.message}
                ></textarea>
                {formik.touched.message && formik.errors.message && <div className="text-red-500 text-base mt-1.5">{formik.errors.message}</div>}
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
                    {t("contact.form.agreeTerms")}
                  </label>
                  {formik.touched.agree && formik.errors.agree && <div className="text-red-500 text-base mt-1">{formik.errors.agree}</div>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-[#026E5F] hover:bg-[#025E50] cursor-pointer text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2  border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? t("contact.form.sending") : t("contact.form.submit")}
                </button>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-4">{t("contact.form.responseNote")}</p>
              </div>
            </form>
          </div>

          {/* Right Info */}
          <div className="w-full md:w-1/3">
            <div className="grid grid-cols-1 gap-8">
              {/* Hotline Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#026E5F] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Icon icon="ph:headset-bold" className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1">{t("contact.info.hotline247")}</p>
                  <a href="tel:0973244354" className="text-lg font-extrabold text-[#026E5F] dark:text-teal-400 hover:underline transition-colors">
                    +84 973 244 354
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#026E5F] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Icon icon="ph:envelope-simple-bold" className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1">{t("contact.info.supportEmail")}</p>
                  <a href="mailto:giadinhviet.support@gmail.com" className="text-lg font-extrabold text-[#026E5F] dark:text-teal-400 hover:underline transition-colors break-all">
                    giadinhviet.support@gmail.com
                  </a>
                </div>
              </div>

              {/* Office Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#026E5F] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Icon icon="ph:map-pin-bold" className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1">{t("contact.info.office")}</p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{t("contact.info.address")}</p>
                </div>
              </div>

              {/* Image Card */}
              <div className="relative rounded-3xl overflow-hidden h-48 md:h-56 shadow-md group border border-gray-100 dark:border-gray-700">
                <img src={contactImg} alt="Support Team" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-linear-to-t from-teal-950/80 via-teal-950/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <img src="https://i.pravatar.cc/100?img=32" alt="Support Agent" className="w-10 h-10 rounded-full object-cover border-2 border-white" loading="lazy" />
                  <p className="text-sm font-semibold text-white">{t("contact.info.expertTeam")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. RENDER FAQ SECTION
  const renderQuestionContact = () => (
    <div className="max-w-5xl mx-auto mb-10 mt-2">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">{t("contact.faq.title")}</h2>
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
                className={`p-1.5 rounded-full transition-colors duration-300  ${openFaqIndex === index ? "bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 group-hover:text-teal-500 dark:group-hover:text-teal-400"}`}
              >
                <Icon icon="mdi:plus" className={`w-4 h-4 transition-transform duration-300  ${openFaqIndex === index ? "rotate-180" : ""}`} />
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

  // 3. RENDER CORE FEATURES
  const renderFeaturesContact = () => (
    <div className="w-full max-w-5xl mx-auto px-4 pt-10 border-blue-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:headset" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("contact.features.support")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("contact.features.supportDesc")}</p>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:ribbon" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("contact.features.quality")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("contact.features.qualityDesc")}</p>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:handshake" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("contact.features.service")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("contact.features.serviceDesc")}</p>
        </div>
        <div className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 rounded-full border-2 border-[#005C61] dark:border-teal-500 flex items-center justify-center mb-4 text-[#005C61] dark:text-teal-400 group-hover:bg-[#005C61] dark:group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-md">
            <Icon icon="mdi:target" className="text-5xl" />
          </div>
          <h3 className="text-xl font-bold text-[#005C61] dark:text-teal-400 mb-2 uppercase">{t("contact.features.coverage")}</h3>
          <p className="text-sm text-[#0099D6] dark:text-cyan-400">{t("contact.features.coverageDesc")}</p>
        </div>
      </div>
    </div>
  );

  // 4. RENDER HERO BANNER
  const renderBanner = () => {
    return (
      <div className="w-full bg-linear-to-br from-[#eef9f8]/90 via-[#e4f2f0]/60 to-white dark:from-[#0d2e2b]/40 dark:via-[#092220]/20 dark:to-slate-900/60 p-8 md:p-12 rounded-3xl border border-teal-100/60 dark:border-teal-900/40 shadow-xs relative overflow-hidden">
        {/* Decorative background ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-200/20 dark:bg-teal-700/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-200/20 dark:bg-cyan-700/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-teal-400/10 backdrop-blur-md text-teal-800 dark:text-teal-300 text-sm font-semibold mb-6 shadow-xs border border-white/60 dark:border-teal-900/50">
              <Icon icon="ph:headset-bold" className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t("contact.banner.badge")}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-[#005C61] dark:text-teal-400 mb-4 leading-tight">{t("contact.banner.title")}</h2>

            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-8 max-w-lg leading-relaxed">{t("contact.banner.description")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm border border-white/60 dark:border-gray-700 shrink-0">
                  <Icon icon="ph:phone-bold" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider">{t("contact.banner.hotlineLabel")}</p>
                  <a href="tel:0973244354" className="text-sm md:text-base font-bold text-gray-900 dark:text-white hover:text-teal-600 transition-colors">
                    +84 973 244 354
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-slate-200/40 backdrop-blur-md flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm border border-white/60 dark:border-gray-700 shrink-0">
                  <Icon icon="ph:envelope-simple-bold" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider">{t("contact.banner.emailLabel")}</p>
                  <a href="mailto:hungvuong04.dev@gmail.com" className="text-sm md:text-base font-bold text-gray-900 dark:text-white hover:text-teal-600 transition-colors break-all">
                    hungvuong04.dev@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 md:h-80">
              <img src={contactImg} alt="Customer Support" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-white/60 dark:border-slate-700/40">
                <div className="flex -space-x-2 shrink-0">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=12" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=22" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=32" alt="User" />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("contact.banner.satisfiedCount")} <span className="font-bold text-teal-600 dark:text-teal-400">10,000+</span> {t("contact.banner.satisfiedText")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ROOT RETURN
  return (
    <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="w-full px-4 md:px-16 flex flex-col gap-12">
        <AnimateOnScrollReveal>{renderBanner()}</AnimateOnScrollReveal>
        <AnimateOnScrollReveal>{renderFormContact()}</AnimateOnScrollReveal>
        <AnimateOnScrollReveal>{renderFeaturesContact()}</AnimateOnScrollReveal>
        <AnimateOnScrollReveal>{renderQuestionContact()}</AnimateOnScrollReveal>
      </div>
    </div>
  );
};

export default Contact;
