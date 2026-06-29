import { useState } from "react";
import { Icon } from "@iconify/react";
import { usePricing } from "./useHook";
import { Link } from "react-router-dom";

export const Pricing = () => {
  const {
    t,
    pricingCategories,
    activeCategory,
    setActiveCategory,
    calcPackageName,
    setCalcPackageName,
    includeTools,
    setIncludeTools,
    estimatedTotal,
    selectedPackageObj,
    allPackages,
    formatCurrency,
    pricingFaqs,
  } = usePricing();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // // 1. RENDER HERO HEADER
  // const renderHeader = () => (
  //   <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#026E5F] via-[#01564a] to-emerald-800 text-white pt-16 pb-20 px-6 md:px-16 shadow-xl text-center">
  //     {/* decorative blobs */}
  //     <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
  //     <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-emerald-400/10 blur-2xl" />

  //     <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
  //       <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-6">
  //         <Icon icon="material-symbols:payments-outline" className="text-sm" />
  //         {t("Bảng giá dịch vụ")}
  //       </span>
  //       <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
  //         {t("Bảng Giá Dịch Vụ Cố Định & Theo Giờ")}
  //       </h1>
  //       <p className="text-base md:text-lg text-teal-50/90 max-w-2xl leading-relaxed">
  //         {t("Báo giá minh bạch, rõ ràng theo từng giờ làm việc và quy mô gia đình. Dễ dàng so sánh chi phí để đưa ra lựa chọn tối ưu nhất.")}
  //       </p>
  //     </div>
  //   </div>
  // );

  // 2. RENDER CATEGORY TABS SELECTOR
  const renderCategoryTabs = () => (
    <div className="flex flex-wrap justify-center gap-3.5 mt-10 mb-8">
      {pricingCategories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold border transition-all cursor-pointer ${
              isActive
                ? "bg-[#026E5F] border-[#026E5F] text-white shadow-lg shadow-teal-700/20 scale-105"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:border-[#026E5F] hover:text-[#026E5F]"
            }`}
          >
            <Icon icon={cat.icon} className="text-xl shrink-0" />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  // 3. RENDER PRICING TABLE (tr, td structure with borders)
  const renderPricingTable = () => {
    const selectedCategoryObj = pricingCategories.find((cat) => cat.id === activeCategory);
    if (!selectedCategoryObj) return null;

    return (
      <div className="flex flex-col gap-6">
        <div className="w-full overflow-x-auto bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-750 shadow-md">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80">
                <th className="px-6 py-5 text-sm font-bold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700 max-w-[240px]">
                  {t("Gói Dịch Vụ")}
                </th>
                <th className="px-6 py-5 text-sm font-bold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                  {t("Thời Lượng")}
                </th>
                <th className="px-6 py-5 text-sm font-bold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                  {t("Đơn Giá / Giờ")}
                </th>
                <th className="px-6 py-5 text-sm font-bold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                  {t("Thành Tiền Cố Định")}
                </th>
                <th className="px-6 py-5 text-sm font-bold text-slate-750 dark:text-white border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                  {t("Chi Tiết Công Việc")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-750">
              {selectedCategoryObj.packages.map((pkg, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200"
                >
                  {/* Service Name & Description */}
                  <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 max-w-[240px]">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800 dark:text-white text-sm md:text-base">
                        {pkg.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {pkg.description}
                      </span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 text-xs font-bold px-2.5 py-1.5 rounded-full border border-teal-105/50 dark:border-teal-900/30">
                      <Icon icon="material-symbols:schedule-outline" className="text-sm" />
                      {pkg.hours} {t("giờ")}
                    </span>
                  </td>

                  {/* Hourly Rate */}
                  <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(pkg.pricePerHour)} <span className="text-[11px] font-normal text-slate-450">/ {t("giờ")}</span>
                  </td>

                  {/* Fixed Total Price */}
                  <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750 whitespace-nowrap">
                    <span className="text-lg font-extrabold text-[#026E5F] dark:text-teal-450">
                      {formatCurrency(pkg.price)}
                    </span>
                  </td>

                  {/* Work Features */}
                  <td className="px-6 py-6 border-r last:border-r-0 border-slate-200 dark:border-slate-750">
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {pkg.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-355 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200/30 dark:border-slate-750"
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

        {/* Single CTA Button block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-750">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-850 dark:text-white text-base">
              {t("Bạn đã chọn được gói dịch vụ ưng ý?")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("Đặt lịch ngay để chúng tôi kết nối bạn với những người giúp việc chuyên nghiệp nhất.")}
            </p>
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

  // 4. RENDER LIVE ESTIMATE CALCULATOR
  const renderPricingCalculator = () => (
    <div className="mt-16 bg-linear-to-br from-[#026e5f]/5 via-[#01564a]/5 to-transparent dark:from-teal-950/20 dark:to-slate-900/40 p-8 md:p-12 rounded-3xl border border-teal-100/50 dark:border-teal-900/30">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center gap-1 bg-[#026E5F]/10 dark:bg-teal-400/10 text-[#026E5F] dark:text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3.5">
              <Icon icon="material-symbols:calculate-outline" className="text-sm" />
              {t("Công cụ tính toán")}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {t("Ước Tính Chi Phí Nhanh Chóng")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {t("Chọn gói dịch vụ dự kiến để ước lượng toàn bộ chi phí bao gồm cả dụng cụ phát sinh.")}
            </p>
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {t("Chọn gói dịch vụ")}
            </label>
            <select
              value={calcPackageName}
              onChange={(e) => setCalcPackageName(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-350 cursor-pointer outline-none focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F]"
            >
              {allPackages.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* tools helper option */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <label className="flex items-center gap-3 cursor-pointer group w-max">
              <input
                type="checkbox"
                checked={includeTools}
                onChange={(e) => setIncludeTools(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-650 text-[#026E5F] focus:ring-[#026E5F] dark:bg-slate-900 cursor-pointer accent-[#026E5F]"
              />
              <div className="text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#026E5F] transition-colors">
                  {t("Kèm dụng cụ & chất tẩy rửa")}
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-500 ml-1.5">
                  (+50.000đ)
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* results card */}
        {selectedPackageObj && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-150 dark:border-slate-700/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#026E5F]/5 rounded-full blur-xl pointer-events-none"></div>

            <h3 className="text-base font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5">
              {t("Bản tính chi phí ước tính")}
            </h3>

            <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-start text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {selectedPackageObj.name}
                </span>
                <span className="font-bold text-slate-700 dark:text-white">
                  {formatCurrency(selectedPackageObj.price)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-405">
                <span>{t("Đơn giá phân tích")}:</span>
                <span>{formatCurrency(selectedPackageObj.pricePerHour)} / {t("giờ")} × {selectedPackageObj.hours} {t("giờ")}</span>
              </div>
              {includeTools && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("Bộ dụng cụ & chất tẩy rửa mang theo")}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-white">
                    +50.000 đ
                  </span>
                </div>
              )}
            </div>

            <div className="pt-6 mb-7 flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-700 dark:text-white">
                {t("TỔNG DỰ KIẾN")}:
              </span>
              <span className="text-3xl font-extrabold text-[#026E5F] dark:text-teal-400">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>

            <Link to="/dang-bai-tuyen" className="block w-full">
              <button className="w-full py-3.5 bg-gradient-to-r from-teal-650 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-2xl shadow-md hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all cursor-pointer">
                {t("Tiến hành đăng bài ngay")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // 5. RENDER VALUE PROPOSITIONS / COMMITMENTS
  const renderCommitments = () => (
    <div className="mt-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          {t("Cam Kết Chất Lượng & Uy Tín")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
          {t("Trải nghiệm dịch vụ an tâm tuyệt đối nhờ các tiêu chuẩn vàng chỉ có tại Gia Đình Việt.")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: "material-symbols:verified-user-outline",
            title: t("Người giúp việc xác minh 100%"),
            desc: t("Lý lịch tư pháp rõ ràng, được kiểm tra sức khỏe định kỳ và đào tạo kỹ năng vệ sinh giao tiếp bài bản.")
          },
          {
            icon: "material-symbols:shield-lock-outline",
            title: t("Bảo hiểm đổ vỡ & mất cắp"),
            desc: t("Bảo hiểm bồi thường rủi ro hư hỏng, đổ vỡ tài sản trong quá trình làm việc giúp bảo vệ quyền lợi tối đa.")
          },
          {
            icon: "material-symbols:price-change-outline",
            title: t("Đồng giá ngày lễ (tùy chỉnh)"),
            desc: t("Bảng giá ngày thường cố định, không phát sinh. Báo trước và thống nhất giá ngày lễ rõ ràng.")
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 flex items-center justify-center mb-4">
              <Icon icon={item.icon} className="text-2xl" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-2">
              {item.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.desc}
            </p>
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
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">
          {t("Câu hỏi thường gặp về giá cả")}
        </h2>
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
                <button
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between focus:outline-none group cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
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
                    <Icon
                      icon="ph:caret-down-bold"
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 py-0 opacity-0"
                  }`}
                >
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pt-3.5 border-t border-slate-100 dark:border-slate-700/50">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ROOT RETURN (GRID CONTEXT)
  return (
    <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="w-full px-4 md:px-16 flex flex-col gap-6">
        {/* {renderHeader()} */}
        {renderCategoryTabs()}
        {renderPricingTable()}
        {renderPricingCalculator()}
        {renderCommitments()}
        {renderFaqSection()}
      </div>
    </div>
  );
};

export default Pricing;
