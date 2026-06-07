import { Icon } from "@iconify/react";
import bannerHome from "../../assets/images/banner_home.png";
import neatlyClothe from "../../assets/images/home_service/neatlyClothe.png";
import repairCondition from "../../assets/images/home_service/repairCondition.png";
import repairLight from "../../assets/images/home_service/repairLight.png";
import repairPlumber from "../../assets/images/home_service/repairPlumber.png";
import { useHome } from "./useHook";

export const Home = () => {
  const { bannerData, serviceData, containerRef, imageRef, contentRef, cubeRef } = useHome();

  const renderBanner = () => {
    return (
      <div ref={containerRef} className="relative w-full overflow-hidden flex items-center justify-center rounded-2xl" style={{ height: "85vh" }}>
        {/* api get image */}
        <img
          ref={imageRef}
          src={bannerHome}
          alt="Home banner"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transformOrigin: "center center" }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-black/20" />

        {/* Interactive Contents */}
        <div ref={contentRef} className="absolute inset-0 flex flex-col justify-center items-center px-4 md:px-16 text-center z-10">
          {/* Main Title */}
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-xl max-w-4xl">
            {bannerData.title} <span className="text-teal-400 block md:inline">{bannerData.highlightTitle}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/95 text-base md:text-xl max-w-2xl mb-10 drop-shadow-md font-medium">{bannerData.description}</p>

          {/* Search Bar Form */}
          <div className="w-full max-w-3xl bg-white p-3 md:p-4 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 mb-12">
            {/* Service Search */}
            <div className="w-full flex items-center gap-2 px-4 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0">
              <Icon icon="lucide:search" className="text-gray-400 text-xl shrink-0" />
              <input
                type="text"
                placeholder={bannerData.searchPlaceholders.service}
                className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-500 font-medium text-sm md:text-base"
              />
            </div>

            {/* Location Search */}
            <div className="w-full flex items-center gap-2 px-4 py-2 md:py-0">
              <Icon icon="lucide:map-pin" className="text-gray-400 text-xl shrink-0" />
              <input
                type="text"
                placeholder={bannerData.searchPlaceholders.location}
                className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-500 font-medium text-sm md:text-base"
              />
            </div>

            <button className="w-full md:w-auto cursor-pointer bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30">
              <Icon icon="lucide:search" className="text-lg" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderService = () => {
    return (
      <div className="grid md:grid-cols-12 gap-12 items-center">
        {/* Left Column (Content) - 6 Columns */}
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#034d54] mb-6 leading-tight">
            {serviceData.title}
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
            {serviceData.description}
          </p>

          {/* Bullet Points */}
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
            <button className="cursor-pointer bg-[#034d54] hover:bg-[#023c42] active:scale-95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md">
              {serviceData.buttonText}
            </button>
          </div>
        </div>

        {/* Right Column (gsap 3D rotating card carousel) - 6 Columns */}
        <div className="col-span-12 md:col-span-6 flex items-center justify-center relative min-h-120" style={{ perspective: "1200px" }}>
          {/* Tilted 3D Carousel container */}
          <div
            ref={cubeRef}
            className="w-40 h-52 relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Card 1 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(0deg) translateZ(190px)", backfaceVisibility: "visible" }}
            >
              <img src={neatlyClothe} alt="Service 1" className="w-full h-full object-cover" />
            </div>

            {/* Card 2 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(90deg) translateZ(190px)", backfaceVisibility: "visible" }}
            >
              <img src={repairCondition} alt="Service 2" className="w-full h-full object-cover" />
            </div>

            {/* Card 3 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(180deg) translateZ(190px)", backfaceVisibility: "visible" }}
            >
              <img src={repairLight} alt="Service 3" className="w-full h-full object-cover" />
            </div>

            {/* Card 4 */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white"
              style={{ transform: "rotateY(270deg) translateZ(190px)", backfaceVisibility: "visible" }}
            >
              <img src={repairPlumber} alt="Service 4" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 md:px-16 mx-auto py-6">
      <div className="grid md:grid-cols-12 gap-8">
        <div className="col-span-12">{renderBanner()}</div>
        <div className="col-span-12">{renderService()}</div>
      </div>
    </div>
  );
};
