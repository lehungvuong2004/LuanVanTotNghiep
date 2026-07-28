import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { usePricing } from "./useHook";
import { Link, useLocation } from "react-router-dom";

export const Pricing = () => {
  const { t, pricingCategories, formatCurrency, pricingFaqs, pricingCommitments } = usePricing();
  const location = useLocation();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly for smooth rendering layout setup
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  const renderHeaderTitle = () => (
    <div className="mt-10 mb-8 flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl font-black text-[#026E5F] dark:text-teal-400 tracking-tight">{t("Bảng giá dịch vụ")}</h2>
    </div>
  );

  // 3. RENDER PRICING TABLES (stacked vertically for each category)
  const renderPricingTables = () => {
    return (
      <div className="flex flex-col gap-12">
        {pricingCategories.map((category) => (
          <div key={category.id} id={category.id} className="flex flex-col gap-4 scroll-mt-28">
            {category.name && (
              <div className="flex items-center gap-4 px-2 py-2 border-b border-slate-100 dark:border-slate-800/80">
                {category.icon && (
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 flex items-center justify-center">
                    <Icon icon={category.icon} className="text-2xl" />
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-black text-slate-850 dark:text-white">{category.name}</h3>
              </div>
            )}

            <div className="w-full overflow-x-auto bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-750 shadow-md">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80">
                    <th className="px-6 py-5 text-base font-extrabold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700 w-60">
                      {t("Gói Dịch Vụ")}
                    </th>
                    <th className="px-6 py-5 text-base font-extrabold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">{t("Thời Lượng")}</th>
                    <th className="px-6 py-5 text-base font-extrabold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">{t("Đơn Giá / Giờ")}</th>
                    <th className="px-6 py-5 text-base font-extrabold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                      {t("Thành Tiền Cố Định")}
                    </th>
                    <th className="px-6 py-5 text-base font-extrabold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                      {t("Chi Tiết Công Việc")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-750">
                  {category.packages.map((pkg, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200">
                      {/* Service Name & Description */}
                      <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 w-60">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-extrabold text-slate-800 dark:text-white text-base">{pkg.name}</span>
                          <span className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">{pkg.description}</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 text-base font-bold px-3 py-2 rounded-full border border-teal-105/50 dark:border-teal-900/30">
                          <Icon icon="material-symbols:schedule-outline" className="text-base" />
                          {pkg.hours} {t("giờ")}
                        </span>
                      </td>

                      {/* Hourly Rate */}
                      <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 whitespace-nowrap text-base font-semibold text-slate-700 dark:text-slate-350">
                        {formatCurrency(pkg.pricePerHour)} <span className="text-base font-normal text-slate-450">/ {t("giờ")}</span>
                      </td>

                      {/* Fixed Total Price */}
                      <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 whitespace-nowrap">
                        <span className="text-base font-black text-[#026E5F] dark:text-teal-455">{formatCurrency(pkg.price)}</span>
                      </td>

                      {/* Work Features */}
                      <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {pkg.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-base font-medium px-2.5 py-1 rounded-md border border-slate-200/30 dark:border-slate-750"
                            >
                              <Icon icon="material-symbols:check-circle" className="text-emerald-500 text-xs shrink-0" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Single CTA Button block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-750 mt-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-850 dark:text-white text-base">{t("Bạn đã chọn được gói dịch vụ ưng ý?")}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("Đặt lịch ngay để chúng tôi kết nối bạn với những người giúp việc chuyên nghiệp nhất.")}</p>
          </div>
          <Link to="/dang-bai-tuyen">
            <button className="px-6 py-3.5 bg-[#026E5F] hover:bg-[#01564a] active:scale-95 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-teal-700/20 transition-all cursor-pointer flex items-center gap-2">
              <Icon icon="material-symbols:calendar-month-outline" className="text-lg" />
              {t("Đặt Lịch Ngay")}
            </button>
          </Link>
        </div>
      </div>
    );
  };

  // 5. RENDER VALUE PROPOSITIONS / COMMITMENTS
  const renderCommitments = () => (
    <div className="mt-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t("Cam Kết Chất Lượng & Uy Tín")}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">{t("Trải nghiệm dịch vụ an tâm tuyệt đối nhờ các tiêu chuẩn vàng chỉ có tại Gia Đình Việt.")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingCommitments.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 flex items-center justify-center mb-4">
              <Icon icon={item.icon} className="text-2xl" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-2">{item.title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. RENDER FAQ SECTION
  const renderFaqSection = () => {
    const toggleFaq = (index: number) => {
      setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
      <div className="max-w-4xl mx-auto my-16">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">{t("Câu hỏi thường gặp về giá cả")}</h2>
        <div className="space-y-3">
          {pricingFaqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-800 ${
                  isOpen
                    ? "border-teal-400 dark:border-teal-500 ring-1 ring-teal-400/30 shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-xs"
                }`}
              >
                <button className="w-full text-left px-6 py-4.5 flex items-center justify-between focus:outline-none group cursor-pointer" onClick={() => toggleFaq(index)}>
                  <span
                    className={`font-bold text-base transition-colors duration-300 ${
                      isOpen ? "text-teal-800 dark:text-teal-400" : "text-slate-700 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-full transition-colors duration-300 ${
                      isOpen ? "bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500 group-hover:bg-gray-50 dark:group-hover:bg-gray-700"
                    }`}
                  >
                    <Icon icon="ph:caret-down-bold" className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 py-0 opacity-0"}`}>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pt-3.5 border-t border-slate-100 dark:border-slate-700/50">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="max-w-8xl ">
        {renderHeaderTitle()}
        {renderPricingTables()}
        {renderCommitments()}
        {renderFaqSection()}
      </div>
    </div>
  );
};

export default Pricing;
