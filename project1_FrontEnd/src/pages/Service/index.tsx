import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useService } from "./useHook";
import type { ServiceItem, HelperItem } from "./useHook";

// 1. Hero Section Component
interface HeroSectionProps {
  t: (key: string, options?: any) => string;
}

const HeroSection = ({ t }: HeroSectionProps) => {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-slate-900 min-h-90 flex items-center shadow-lg border border-slate-800">
      <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
      <div className="absolute inset-0 bg-teal-950/20 z-10" />
      <img
        alt="Professional household services"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop"
      />
      <div className="relative z-20 px-6 md:px-16 py-12 w-full flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="max-w-2xl text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            {t("Dịch vụ giúp việc gia đình uy tín")}
          </h1>
          <p className="text-lg text-slate-200 mb-8 max-w-lg font-medium opacity-90">
            {t("Kết nối nhanh chóng với những người giúp việc tận tâm và chuyên nghiệp nhất cho ngôi nhà của bạn.")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-teal-600/20 active:scale-95 cursor-pointer">
              {t("Đặt lịch ngay")} 
              <Icon icon="material-symbols:calendar-today-outline" className="text-lg" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold transition-all active:scale-95 cursor-pointer">
              {t("Tìm hiểu thêm")}
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 grid grid-cols-1 gap-6 min-w-[260px] shadow-2xl">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-white">24+</div>
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold mt-1">{t("Dịch vụ")}</div>
          </div>
          <div className="h-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-white">500+</div>
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold mt-1">{t("Lượt đặt lịch")}</div>
          </div>
          <div className="h-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-1">
              4.8 
              <Icon icon="material-symbols:star" className="text-amber-400 text-2xl" />
            </div>
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold mt-1">{t("Đánh giá trung bình")}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 2. Sidebar Filter Component
interface SidebarFilterProps {
  t: (key: string, options?: any) => string;
}

const SidebarFilter = ({ t }: SidebarFilterProps) => {
  const categories = ["Làm sạch", "Nấu ăn", "Người già", "Sửa chữa", "Giặt ủi"];
  const priceTypes = ["Tất cả", "Theo giờ", "Theo buổi", "Theo ngày"];
  const areas = ["Tất cả", "TP.HCM", "Hà Nội"];
  const ratings = [5, 4, 3];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm sticky top-24 flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icon icon="material-symbols:filter-list" className="text-xl text-teal-600" />
          {t("Bộ lọc")}
        </h3>
        <button className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer">
          {t("Xóa bộ lọc")}
        </button>
      </div>

      {/* Search Input */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Tìm kiếm")}</h4>
        <div className="relative">
          <input
            type="text"
            placeholder={t("Nhập tên dịch vụ...")}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500"
          />
          <Icon icon="material-symbols:search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        </div>
      </div>

      {/* Categories Checkbox Group */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Danh mục dịch vụ")}</h4>
        <div className="flex flex-col gap-2.5">
          {categories.map((cat, index) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                defaultChecked={index === 0}
                className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-900 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors font-medium">
                {t(cat)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t("Mức giá tối đa")}</h4>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
            2.000.000đ
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="2000000"
            step="50000"
            defaultValue="2000000"
            className="w-full accent-teal-600 dark:accent-teal-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-bold">
            <span>0đ</span>
            <span>2.000.000đ</span>
          </div>
        </div>
      </div>

      {/* Price Type */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Hình thức thuê")}</h4>
        <div className="flex flex-wrap gap-2">
          {priceTypes.map((type, index) => (
            <button
              key={type}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                index === 0
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-500 hover:text-teal-500"
              }`}
            >
              {t(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Region / Area */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Khu vực")}</h4>
        <select
          defaultValue="Tất cả"
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {t(a)}
            </option>
          ))}
        </select>
      </div>

      {/* Ratings Filter */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Đánh giá")}</h4>
        <div className="flex flex-col gap-2">
          {ratings.map((r, index) => (
            <label key={r} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                defaultChecked={index === 0}
                className="border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-900 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 group-hover:text-slate-800 dark:group-hover:text-white transition-colors font-medium">
                {r}+ 
                <Icon icon="material-symbols:star" className="text-amber-400 text-base" />
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Service List / Grid Component
interface ServiceListProps {
  t: (key: string, options?: any) => string;
  services: ServiceItem[];
}

const ServiceList = ({ t, services }: ServiceListProps) => {
  const tabs = ["Tất cả", "Làm sạch", "Nấu ăn", "Người già", "Sửa chữa", "Giặt ủi"];
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [services]);

  const renderServiceImage = (url?: string, title?: string) => {
    if (url) {
      return (
        <img
          src={url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      );
    }
    return (
      <div className="w-full h-full bg-linear-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
        <Icon icon="mdi:home-heart" className="text-5xl opacity-80" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Category Tabs & Sort */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                index === 0
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/10"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("Hiển thị {{count}} dịch vụ", { count: services.length })}
          </span>
          <select className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
            <option value="Sắp xếp: Phổ biến nhất">{t("Phổ biến nhất")}</option>
            <option value="Giá: Thấp đến Cao">{t("Giá: Thấp đến Cao")}</option>
            <option value="Đánh giá: Cao nhất">{t("Đánh giá cao nhất")}</option>
          </select>
        </div>
      </div>

      {/* Service Grid */}
      {services.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.slice(0, visibleCount).map((service) => (
              <article
                key={service.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer">
                  <Icon
                    icon={service.isFavorite ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                    className={`text-xl transition-colors ${service.isFavorite ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                  />
                </button>
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {renderServiceImage(service.image, service.title)}
                </div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Icon icon="material-symbols:star" className="text-amber-400 text-base" />
                      {service.rating} <span className="text-slate-400 dark:text-slate-500 font-normal">({service.reviewsCount})</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <Icon icon="material-symbols:group-outline" className="text-base" />
                    <span>{service.helpersCount}+ {t("người giúp việc")}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t("Giá từ")}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                          {service.price.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">/{service.priceType.split(" ").pop()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative group/tooltip">
                        <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer">
                          <Icon icon="material-symbols:info-outline" className="text-lg" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-slate-900 dark:bg-slate-950 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-30 pointer-events-none transition-all">
                          {t("Xem thông tin chi tiết")}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                        </div>
                      </div>
                      <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-teal-600/10 active:scale-95 transition-all cursor-pointer">
                        {t("Đặt ngay")}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {visibleCount < services.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-md hover:shadow-teal-600/10 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                {t("Xem thêm")}
                <Icon icon="material-symbols:keyboard-arrow-down" className="text-xl" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// 4. Featured Helpers Component
interface FeaturedHelpersProps {
  t: (key: string, options?: any) => string;
  helpers: HelperItem[];
}

const FeaturedHelpers = ({ t, helpers }: FeaturedHelpersProps) => {
  const renderHelperAvatar = (url?: string, name?: string) => {
    if (url) {
      return <img src={url} alt={name} className="w-full h-full object-cover" />;
    }
    return (
      <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg">
        {name ? name.charAt(0) : "H"}
      </div>
    );
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-8 shadow-sm mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">{t("Người giúp việc tiêu biểu")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Đội ngũ xuất sắc nhất, nhận được đánh giá cao nhất từ các gia đình.")}</p>
        </div>
        <button className="text-teal-600 dark:text-teal-400 font-bold text-sm hover:underline flex items-center gap-1 cursor-pointer">
          {t("Xem tất cả hồ sơ")} <Icon icon="material-symbols:arrow-forward" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {helpers.map((helper) => (
          <div
            key={helper.id}
            className="border border-slate-100 dark:border-slate-700/50 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg relative group"
          >
            {helper.isOnline && (
              <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 dark:border-slate-700 group-hover:border-teal-500 transition-colors">
              {renderHelperAvatar(helper.avatar, helper.name)}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{helper.name}</h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-3">
              <Icon icon="material-symbols:star" className="text-base" />
              {helper.rating}
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                ({helper.experienceYears} {t("năm kinh nghiệm")})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center mt-auto">
              {helper.tags.map((tag) => (
                <span key={tag} className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded">
                  {t(tag)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Main Export Component
export const Service = () => {
  const { t } = useTranslation();
  const { services, helpers } = useService();

  return (
    <div className="dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 gap-8 pt-16">
      <HeroSection t={t} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <aside className="lg:col-span-3">
          <SidebarFilter t={t} />
        </aside>
        <div className="lg:col-span-9 flex flex-col gap-6">
          <ServiceList t={t} services={services} />
          <FeaturedHelpers t={t} helpers={helpers} />
        </div>
      </div>
    </div>
  );
};

export default Service;