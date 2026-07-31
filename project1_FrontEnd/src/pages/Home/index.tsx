import { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Icon } from "@iconify/react";
import neatlyClothe from "../../assets/images/home_service/neatlyClothe.webp";
import repairCondition from "../../assets/images/home_service/repairCondition.webp";
import repairLight from "../../assets/images/home_service/repairLight.webp";
import repairPlumber from "../../assets/images/home_service/repairPlumber.webp";
import { useTranslation } from "react-i18next";
import { useHome } from "./useHook";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/images";
import AnimateOnScrollReveal from "../../components/AnimateOnScrollReveal";
import gsap from "gsap";

export const Home = () => {
  const { t } = useTranslation();
  const { bannerData, serviceData, containerRef, imageRef, contentRef, cubeRef, produceData, reviewData, banners, loadingBanners, searchVal, setSearchVal, locationVal, setLocationVal, handleSearch } =
    useHome();

  const swiperRef = useRef<any>(null);
  const dynamicBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadingBanners && banners && banners.length > 0 && dynamicBgRef.current) {
      gsap.fromTo(
        dynamicBgRef.current,
        { clipPath: "circle(0% at 100% 0%)" },
        {
          clipPath: "circle(150% at 100% 0%)",
          duration: 2.2,
          ease: "power2.inOut",
        }
      );
    }
  }, [loadingBanners, banners]);

  const renderBanner = () => {
    const bannerList =
      banners && banners.length > 0
        ? banners
        : [
             {
              id: 0,
              title: t("home.banner.defaultTitle"),
              image: "",
              link: null,
              status: "active" as const,
            },
          ];

    return (
      <div ref={containerRef} className="relative w-full overflow-hidden flex items-center justify-center hero-swiper-container h-[60vh] md:h-[85vh]">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          pagination={bannerList.length > 1 ? { clickable: true } : false}
          navigation={bannerList.length > 1}
          /* autoplay={bannerList.length > 1 ? { delay: 5000, disableOnInteraction: false } : false} */
          loop={bannerList.length > 1}
          className="w-full h-full hero-swiper"
        >
          {bannerList.map((banner, index) => (
            <SwiperSlide key={banner.id || index} className="relative w-full h-full flex items-center justify-center select-none overflow-hidden bg-linear-to-r from-[#022b30] via-[#034d54] to-[#008080]">
              {banner.image ? (
                index === 0 ? (
                  <>
                    {/* Fallback space-gradient background - Rendered only under the first dynamic image during transition */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                      {/* Rich Left-to-Right background gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-r from-[#011618] via-[#023138] to-[#045661]" />
                      
                      {/* Large ambient star glow radiating from the upper-right corner */}
                      <div 
                        className="absolute -top-24 -right-24 w-160 h-160 rounded-full blur-3xl opacity-35 animate-[pulse_8s_infinite]"
                        style={{
                          background: 'radial-gradient(circle, rgba(45,212,191,0.6) 0%, rgba(13,148,136,0.2) 60%, transparent 100%)'
                        }}
                      />
                      
                      {/* Secondary medium halo glow centered near the star */}
                      <div 
                        className="absolute top-8 right-8 w-80 h-80 rounded-full blur-2xl opacity-50"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(20,184,166,0.1) 50%, transparent 100%)'
                        }}
                      />

                      {/* High-intensity star core glow */}
                      <div 
                        className="absolute top-1/5 right-1/6 w-32 h-32 rounded-full blur-md opacity-80"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(45,212,191,0.35) 45%, transparent 90%)'
                        }}
                      />

                      {/* Main Bright Four-Pointed Star (AI concept style sparkle) */}
                      <div className="absolute top-1/5 right-1/6 -translate-y-1/2 translate-x-1/2 flex items-center justify-center scale-90 md:scale-100">
                        {/* Ring flare of the star */}
                        <div className="absolute w-24 h-24 rounded-full border border-white/20 blur-xs animate-[ping_5s_infinite] opacity-30" />
                        
                        {/* Cinematic vertical light ray */}
                        <div className="absolute w-0.5 h-32 bg-linear-to-t from-transparent via-white/80 to-transparent blur-xs animate-[pulse_3s_infinite]" />
                        {/* Cinematic horizontal light ray */}
                        <div className="absolute h-0.5 w-32 bg-linear-to-r from-transparent via-white/80 to-transparent blur-xs animate-[pulse_3s_infinite]" />

                        {/* Main SVG Star */}
                        <svg
                          viewBox="0 0 100 100"
                          className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.95)] animate-[pulse_2s_infinite]"
                          fill="currentColor"
                        >
                          <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                        </svg>

                        {/* Constellation of small twinkling stars/sparks around the beacon */}
                        <div className="absolute -top-12 -right-16 animate-[pulse_1.8s_infinite] delay-150 opacity-60">
                          <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 text-teal-200 drop-shadow-[0_0_6px_rgba(45,212,191,0.8)]" fill="currentColor">
                            <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                          </svg>
                        </div>
                        <div className="absolute top-16 -left-12 animate-[pulse_2.5s_infinite] delay-600 opacity-50">
                          <svg viewBox="0 0 100 100" className="w-2.5 h-2.5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" fill="currentColor">
                            <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                          </svg>
                        </div>
                        <div className="absolute -top-6 -left-20 animate-[pulse_3.2s_infinite] delay-1200 opacity-70">
                          <svg viewBox="0 0 100 100" className="w-4 h-4 text-teal-100 drop-shadow-[0_0_8px_rgba(204,251,241,0.8)]" fill="currentColor">
                            <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Image layer (reveals on load using clip-path) */}
                    <div
                      ref={dynamicBgRef}
                      className="absolute inset-0 z-0 overflow-hidden"
                      style={{ clipPath: "circle(0% at 100% 0%)" }}
                    >
                      <img
                        ref={imageRef}
                        src={getImageUrl(banner.image)}
                        alt={t(banner.title) || "Banner"}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover will-change-transform"
                        style={{ transformOrigin: "center center" }}
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-black/30" />
                    </div>
                  </>
                ) : (
                  // Old code block: normal rendering logic for subsequent dynamic slides
                  <>
                    <img
                      src={getImageUrl(banner.image)}
                      alt={t(banner.title) || "Banner"}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover will-change-transform z-0"
                      style={{ transformOrigin: "center center" }}
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/50 to-black/30 z-0" />
                  </>
                )
              ) : (
                // Old code block: static fallback stars background when banner.image is falsy
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  {/* Rich Left-to-Right background gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-[#011618] via-[#023138] to-[#045661]" />
                  
                  {/* Large ambient star glow radiating from the upper-right corner */}
                  <div 
                    className="absolute -top-24 -right-24 w-160 h-160 rounded-full blur-3xl opacity-35 animate-[pulse_8s_infinite]"
                    style={{
                      background: 'radial-gradient(circle, rgba(45,212,191,0.6) 0%, rgba(13,148,136,0.2) 60%, transparent 100%)'
                    }}
                  />
                  
                  {/* Secondary medium halo glow centered near the star */}
                  <div 
                    className="absolute top-8 right-8 w-80 h-80 rounded-full blur-2xl opacity-50"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(20,184,166,0.1) 50%, transparent 100%)'
                    }}
                  />

                  {/* High-intensity star core glow */}
                  <div 
                    className="absolute top-1/5 right-1/6 w-32 h-32 rounded-full blur-md opacity-80"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(45,212,191,0.35) 45%, transparent 90%)'
                    }}
                  />

                  {/* Main Bright Four-Pointed Star (AI concept style sparkle) */}
                  <div className="absolute top-1/5 right-1/6 -translate-y-1/2 translate-x-1/2 flex items-center justify-center scale-90 md:scale-100">
                    {/* Ring flare of the star */}
                    <div className="absolute w-24 h-24 rounded-full border border-white/20 blur-xs animate-[ping_5s_infinite] opacity-30" />
                    
                    {/* Cinematic vertical light ray */}
                    <div className="absolute w-0.5 h-32 bg-linear-to-t from-transparent via-white/80 to-transparent blur-xs animate-[pulse_3s_infinite]" />
                    {/* Cinematic horizontal light ray */}
                    <div className="absolute h-0.5 w-32 bg-linear-to-r from-transparent via-white/80 to-transparent blur-xs animate-[pulse_3s_infinite]" />

                    {/* Main SVG Star */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.95)] animate-[pulse_2s_infinite]"
                      fill="currentColor"
                    >
                      <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                    </svg>

                    {/* Constellation of small twinkling stars/sparks around the beacon */}
                    <div className="absolute -top-12 -right-16 animate-[pulse_1.8s_infinite] delay-150 opacity-60">
                      <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 text-teal-200 drop-shadow-[0_0_6px_rgba(45,212,191,0.8)]" fill="currentColor">
                        <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                      </svg>
                    </div>
                    <div className="absolute top-16 -left-12 animate-[pulse_2.5s_infinite] delay-600 opacity-50">
                      <svg viewBox="0 0 100 100" className="w-2.5 h-2.5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" fill="currentColor">
                        <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                      </svg>
                    </div>
                    <div className="absolute -top-6 -left-20 animate-[pulse_3.2s_infinite] delay-1200 opacity-70">
                      <svg viewBox="0 0 100 100" className="w-4 h-4 text-teal-100 drop-shadow-[0_0_8px_rgba(204,251,241,0.8)]" fill="currentColor">
                        <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {!loadingBanners && (
                <div ref={index === 0 ? contentRef : undefined} className="absolute inset-0 flex flex-col justify-center items-center px-4 md:px-16 text-center z-10">
                  <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-xl max-w-4xl tracking-tight">{banner.title}</h1>

                  <div className="w-full max-w-2xl bg-white p-2 md:p-2.5 rounded-none md:rounded-full shadow-xl flex flex-col md:flex-row items-center gap-2 mb-8">
                    <div className="w-full flex items-center gap-2 px-4 border-b md:border-b-0 md:border-r border-gray-200 py-1.5 md:py-0">
                      <Icon icon="lucide:search" className="text-gray-400 text-xl shrink-0" />
                      <input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder={bannerData.searchPlaceholders.service}
                        className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-500 font-medium text-sm md:text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                      />
                    </div>

                    <div className="w-full flex items-center gap-2 px-4 py-1.5 md:py-0">
                      <Icon icon="lucide:map-pin" className="text-gray-400 text-xl shrink-0" />
                      <input
                        type="text"
                        value={locationVal}
                        onChange={(e) => setLocationVal(e.target.value)}
                        placeholder={bannerData.searchPlaceholders.location}
                        className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-500 font-medium text-sm md:text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSearch}
                      className="w-full md:w-auto cursor-pointer bg-[#008080] hover:bg-teal-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Icon icon="lucide:search" className="text-lg" />
                      {t("Tìm kiếm")}
                    </button>
                  </div>

                  {banner.link &&
                    (() => {
                      const getNormalizedLink = (lnk: string) => {
                        if (!lnk) return "";
                        if (lnk.startsWith("http")) return lnk;
                        if (lnk.startsWith("/#/")) return lnk.substring(2);
                        return lnk;
                      };
                      const normalizedLink = getNormalizedLink(banner.link);
                      const isExternal = normalizedLink.startsWith("http");

                      return (
                        <div>
                          {isExternal ? (
                            <a
                              href={normalizedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#008080] hover:bg-teal-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-200 text-sm shadow-md cursor-pointer"
                            >
                              <Icon icon="lucide:external-link" className="text-base" />
                              {t("home.banner.exploreDetail")}
                            </a>
                          ) : (
                            <Link
                              to={normalizedLink}
                              className="inline-flex items-center gap-2 bg-[#008080] hover:bg-teal-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-200 text-sm shadow-md cursor-pointer"
                            >
                              <Icon icon="lucide:arrow-right" className="text-base" />
                              {t("home.banner.exploreDetail")}
                            </Link>
                          )}
                        </div>
                      );
                    })()}
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };

  const renderPipeline = () => (
    <div className="md:col-span-12 flex flex-col items-center rounded-2xl my-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0f2830] dark:text-white mb-4">{t("Quy trình đặt dịch vụ đơn giản")}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">{t("Chỉ với vài thao tác, bạn đã có thể tận hưởng không gian sống lý tưởng.")}</p>
      </div>

      <div className="relative w-full px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
          {/* Bước 1 */}
          <div className="peer/step1 relative z-10 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div className="relative z-10 w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] dark:group-hover:border-teal-500 transition-all duration-300">
              <Icon icon="mdi:view-list-outline" className="text-3xl text-[#008080] dark:text-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            </div>
            <h3 className="font-bold text-[#0f2830] dark:text-white text-lg mb-2 group-hover:text-[#008080] dark:group-hover:text-teal-400 transition-colors duration-300">{t("1. Chọn dịch vụ")}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm px-2 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {t("Lựa chọn từ 20+ dịch vụ đa dạng từ vệ sinh đến sửa chữa.")}
            </p>
          </div>

          {/* Bước 2 */}
          <div className="peer/step2 relative z-10 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div className="relative z-10 w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] dark:group-hover:border-teal-500 transition-all duration-300">
              <Icon icon="mdi:calendar-month-outline" className="text-3xl text-[#008080] dark:text-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            </div>
            <h3 className="font-bold text-[#0f2830] dark:text-white text-lg mb-2 group-hover:text-[#008080] dark:group-hover:text-teal-400 transition-colors duration-300">{t("2. Đặt lịch")}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm px-2 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {t("Chọn thời gian và địa điểm phù hợp nhất với kế hoạch của bạn.")}
            </p>
          </div>

          {/* Bước 3 */}
          <div className="peer/step3 relative z-10 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div className="relative z-10 w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] dark:group-hover:border-teal-500 transition-all duration-300">
              <Icon icon="mdi:handshake-outline" className="text-3xl text-[#008080] dark:text-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            </div>
            <h3 className="font-bold text-[#0f2830] dark:text-white text-lg mb-2 group-hover:text-[#008080] dark:group-hover:text-teal-400 transition-colors duration-300">{t("3. Kết nối")}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm px-2 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {t("Hệ thống tự động kết nối bạn với chuyên gia phù hợp nhất.")}
            </p>
          </div>

          {/* Bước 4 */}
          <div className="peer/step4 relative z-10 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div className="relative z-10 w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] dark:group-hover:border-teal-500 transition-all duration-300">
              <Icon icon="mdi:star-outline" className="text-3xl text-[#008080] dark:text-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            </div>
            <h3 className="font-bold text-[#0f2830] dark:text-white text-lg mb-2 group-hover:text-[#008080] dark:group-hover:text-teal-400 transition-colors duration-300">
              {t("4. Hoàn tất & Đánh giá")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm px-2 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {t("Kiểm tra kết quả, thanh toán và để lại phản hồi cho chúng tôi.")}
            </p>
          </div>

          {/* Background Connecting Line (Static) */}
          <div className="hidden md:block absolute top-10 h-1 left-[15%] right-[15%] bg-gray-200 dark:bg-gray-700 z-0"></div>

          {/* Active Running Line (CSS Animated, Non-rounded, Glowing) */}
          <div
            className="hidden md:block absolute top-10 h-1 left-[15%] right-[15%] bg-[#008080] dark:bg-teal-400 z-0 origin-left scale-x-0 transition-transform duration-500 ease-out shadow-[0_0_8px_rgba(0,128,128,0.6)] dark:shadow-[0_0_8px_rgba(45,212,191,0.6)]
            peer-hover/step1:scale-x-0
            peer-hover/step2:scale-x-[0.33]
            peer-hover/step3:scale-x-[0.66]
            peer-hover/step4:scale-x-100
          "
          ></div>
        </div>
      </div>
    </div>
  );

  const renderService = () => {
    return (
      <div className="grid md:grid-cols-12 gap-12 items-center">
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#034d54] mb-6 leading-tight">{serviceData.title}</h2>
          <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">{serviceData.description}</p>
          <ul className="space-y-4 mb-8">
            {serviceData.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700 font-medium">
                <Icon icon="lucide:check-circle" className="text-teal-600 text-xl shrink-0 mt-1" />
                <span className="text-sm md:text-base">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Explore Button */}
          <div>
            <Link to="/dich-vu" className="cursor-pointer bg-[#034d54] hover:bg-[#023c42] active:scale-95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md">
              {t("home.banner.exploreNow")}
            </Link>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 flex items-center justify-center relative min-h-120" style={{ perspective: "75rem" }}>
          <div ref={cubeRef} className="w-40 h-52 relative" style={{ transformStyle: "preserve-3d" }}>
            {/* Card 1 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(0deg) translateZ(11.875rem)", backfaceVisibility: "visible" }}
            >
              <img src={neatlyClothe} alt="Service 1" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(90deg) translateZ(11.875rem)", backfaceVisibility: "visible" }}
            >
              <img src={repairCondition} alt="Service 2" className="w-full h-full object-cover" loading="lazy" />
            </div>

            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(180deg) translateZ(11.875rem)", backfaceVisibility: "visible" }}
            >
              <img src={repairLight} alt="Service 3" className="w-full h-full object-cover" loading="lazy" />
            </div>

            {/* Card 4 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(270deg) translateZ(11.875rem)", backfaceVisibility: "visible" }}
            >
              <img src={repairPlumber} alt="Service 4" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const procuder = () => (
    <>
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#034d54] mb-6 leading-tight">{t("home.discover.title")}</h2>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed">{t("home.discover.description")}</p>
      </div>

      <div className="h-100 md:h-128 w-full">
        <div className="flex w-full h-full gap-2 md:gap-4">
          {produceData.map((item) => (
            <div key={item.id} className="group relative h-full flex-1 hover:flex-4 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden rounded-2xl">
              <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 delay-100">
                <h3 className="text-white font-bold text-xl md:text-2xl whitespace-nowrap transform -rotate-90 tracking-wider">{item.title}</h3>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 flex flex-col items-start">
                <h3 className="text-white font-bold text-2xl mb-2">{item.title}</h3>
                <p className="text-white/90 text-sm mb-4 line-clamp-2">{item.description}</p>
                <Link
                  to="/dich-vu"
                  className="bg-white/20 cursor-pointer hover:bg-white text-white hover:text-[#034d54] backdrop-blur-sm px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                >
                  {t("Xem tất cả")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderIntroduce = () => (
    <div className="md:col-span-12 flex flex-col gap-12 mt-8 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-4xl p-8 md:p-12 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <div className="bg-[#094b43] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
            <Icon icon="mdi:account-group" className="text-3xl text-white" />
          </div>
          <h3 className="text-xl md:text-3xl font-bold text-[#094b43] dark:text-teal-400 mb-6">{t("Dành cho Khách hàng")}</h3>
          <ul className="flex-1 space-y-5 mb-10">
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#008080] dark:text-teal-400 mt-0.5 shrink-0" />
              <span className="text-gray-600 dark:text-gray-300 text-lg">{t("Tiết kiệm thời gian chăm sóc nhà cửa")}</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#008080] dark:text-teal-400 mt-0.5 shrink-0" />
              <span className="text-gray-600 dark:text-gray-300 text-lg">{t("Chất lượng dịch vụ được cam kết")}</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#008080] dark:text-teal-400 mt-0.5 shrink-0" />
              <span className="text-gray-600 dark:text-gray-300 text-lg">{t("Giá cả minh bạch, không phát sinh")}</span>
            </li>
          </ul>
          <Link
            to="/dich-vu"
            className="w-full text-center bg-[#094b43] hover:bg-[#06332d] dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-300"
          >
            {t("Tìm người giúp việc ngay")}
          </Link>
        </div>

        <div className="bg-[#094b43] rounded-4xl p-8 md:p-12 shadow-lg flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
          <div className="bg-[#126c60] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
            <Icon icon="mdi:clipboard-text-outline" className="text-3xl text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">{t("Đăng Bài Tuyển Dụng")}</h3>
          <ul className="flex-1 space-y-5 mb-10">
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#4ade80] mt-0.5 shrink-0" />
              <span className="text-gray-100 text-lg">{t("Tự do đề xuất mức lương và thời gian mong muốn")}</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#4ade80] mt-0.5 shrink-0" />
              <span className="text-gray-100 text-lg">{t("Tiếp cận hàng ngàn người giúp việc uy tín nhanh chóng")}</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#4ade80] mt-0.5 shrink-0" />
              <span className="text-gray-100  text-lg">{t("Dễ dàng lựa chọn và trao đổi trực tiếp với ứng viên")}</span>
            </li>
          </ul>
          <Link to="/dang-bai-tuyen" className="w-full text-center bg-[#126c60] hover:bg-[#0e5249] text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-300 cursor-pointer">
            {t("Đăng bài tuyển ngay")}
          </Link>
        </div>
      </div>
    </div>
  );

  const renderReview = () => {
    return (
      <div className="w-full py-16">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-14 gap-6">
          <div className="text-center md:text-left max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f2830] dark:text-white mb-4">{t("home.reviews.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">{t("home.reviews.description")}</p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-[#008080] hover:text-white hover:border-[#008080] shadow-sm transition-all cursor-pointer z-10"
              aria-label={t("Bài đánh giá trước")}
            >
              <Icon icon="ooui:previous-ltr" className="text-xl" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-[#008080] hover:text-white hover:border-[#008080] shadow-sm transition-all cursor-pointer z-10"
              aria-label={t("Bài đánh giá tiếp theo")}
            >
              <Icon icon="grommet-icons:next" className="text-xl" />
            </button>
          </div>
        </div>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Pagination, Autoplay, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{ clickable: true }}
          /* autoplay={{ delay: 4000, disableOnInteraction: false }} */
          style={{ paddingBottom: "3rem" }}
        >
          {reviewData.map((item) => (
            <SwiperSlide key={item.id} style={{ height: "auto" }}>
              <div className="w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-full object-cover" loading="lazy" />
                    <div>
                      <h3 className="font-bold text-[#0f2830] text-sm md:text-base">{item.name}</h3>
                      <p className="text-gray-500 text-xs md:text-sm">{item.location}</p>
                    </div>
                  </div>
                  <div className="bg-[#008080] text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">{item.service}</div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} icon="mdi:star" className="text-yellow-400 text-lg md:text-xl" />
                  ))}
                </div>

                <p className="text-gray-600 italic mb-8 flex-1 text-sm md:text-base">"{item.comment}"</p>

                <div className="flex justify-between items-center text-xs md:text-sm font-medium text-gray-500 border-t border-gray-100 pt-4 mt-auto">
                  <span>{item.workerName}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  };

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col gap-12">
        <div className="min-w-dvw ml-[calc(50%-50dvw)]">{renderBanner()}</div>

        <AnimateOnScrollReveal>
          <div>{renderService()}</div>
        </AnimateOnScrollReveal>
        <AnimateOnScrollReveal delay={0.15}>
          <div>{procuder()}</div>
        </AnimateOnScrollReveal>
        <AnimateOnScrollReveal direction="none" scale={0.93} duration={1}>
          {renderPipeline()}
        </AnimateOnScrollReveal>

        <AnimateOnScrollReveal>{renderReview()}</AnimateOnScrollReveal>

        <AnimateOnScrollReveal>{renderIntroduce()}</AnimateOnScrollReveal>
      </div>
    </div>
  );
};
