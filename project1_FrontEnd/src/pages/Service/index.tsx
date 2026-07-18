import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useService } from "./useHook";
import type { ServiceItem, HelperItem, ServiceFilterParams } from "./useHook";
import type { ServiceCategory } from "../../api/servicesApi/services";
import { formatNumberVI } from "../../utils";
import { Pagination } from "../../components/Pagination";
import AnimateOnScrollReveal from "../../components/AnimateOnScrollReveal";

// ─── 1. Sidebar Filter ──────────────────────────────────────────────────────
interface SidebarFilterProps {
  t: (key: string, options?: any) => string;
  filterParams: ServiceFilterParams;
  onFilterChange: (patch: Partial<ServiceFilterParams>) => void;
  onReset: () => void;
  categories: ServiceCategory[];
}
const CITIES = ["TP.HCM"];
const DISTRICTS_HCMC = ["Tất cả", "Quận 1", "Quận 3", "Quận 10", "Bình Thạnh", "Phú Nhuận"];
const RATINGS = [
  { value: 0, label: "Tất cả" },
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
];

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center justify-between cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-left"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon icon="material-symbols:keyboard-arrow-down" className={`text-xl text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Options List */}
      {isOpen && (
        <>
          {/* Transparent Backdrop to close on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <ul className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto text-sm">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(String(opt.value));
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors font-medium flex items-center justify-between ${
                    isSelected ? "text-teal-650 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 font-bold" : "text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Icon icon="material-symbols:check" className="text-base text-teal-600 dark:text-teal-400" />}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

const SidebarFilter = ({ t, filterParams, onFilterChange, onReset, categories }: SidebarFilterProps) => {
  const handleDistrictChange = (district: string) => {
    onFilterChange({ district: district === "Tất cả" ? undefined : district });
  };

  const handleCityChange = (city: string) => {
    onFilterChange({ city: city || undefined, district: undefined });
  };

  const handlePriceTypeChange = (priceType: string) => {
    onFilterChange({ price_type: priceType === "Tất cả" ? undefined : priceType });
  };

  const handleCategoryChange = (catId: string) => {
    onFilterChange({ category_id: catId === "Tất cả" ? undefined : Number(catId) || undefined });
  };

  const handleMinPriceChange = (e) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onFilterChange({ min_price: val });
  };

  const handleMaxPriceChange = (e) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onFilterChange({ max_price: val });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ rating_min: rating > 0 ? rating : undefined });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm sticky top-24 flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icon icon="material-symbols:filter-list" className="text-xl text-teal-600" />
          {t("Bộ lọc dịch vụ")}
        </h3>
        <button onClick={onReset} className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer">
          {t("Xóa bộ lọc")}
        </button>
      </div>

      {/* Giao diện lọc Thành phố */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Thành phố")}</h4>
        <CustomSelect value={filterParams.city ?? "TP.HCM"} onChange={handleCityChange} options={CITIES.map((c) => ({ value: c, label: c }))} />
      </div>

      {/* Quận / Huyện */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Quận / Huyện")}</h4>
        <CustomSelect value={filterParams.district ?? "Tất cả"} onChange={handleDistrictChange} options={DISTRICTS_HCMC.map((d) => ({ value: d, label: t(d) }))} />
      </div>

      {/* Danh mục dịch vụ */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Danh mục dịch vụ")}</h4>
        <CustomSelect
          value={filterParams.category_id ?? "Tất cả"}
          onChange={handleCategoryChange}
          options={[{ value: "Tất cả", label: t("Tất cả danh mục") }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
        />
      </div>

      {/* Loại hình giá */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Loại hình giá")}</h4>
        <CustomSelect
          value={filterParams.price_type ?? "Tất cả"}
          onChange={handlePriceTypeChange}
          options={[
            { value: "Tất cả", label: t("Tất cả loại giá") },
            { value: "hourly", label: t("Theo giờ") },
            { value: "fixed", label: t("Cố định") },
            { value: "daily", label: t("Theo ngày") },
          ]}
        />
      </div>

      {/* Đánh giá tối thiểu */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Đánh giá tối thiểu")}</h4>
        <div className="flex flex-col gap-2">
          {RATINGS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating_min"
                checked={(filterParams.rating_min ?? 0) === r.value}
                onChange={() => handleRatingChange(r.value)}
                className="border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-900 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 group-hover:text-slate-800 dark:group-hover:text-white transition-colors font-medium">
                {r.label}
                {r.value > 0 && <Icon icon="material-symbols:star" className="text-amber-400 text-base" />}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Khoảng giá */}
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Khoảng giá (VNĐ)")}</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("Từ")}
            value={filterParams.min_price ?? ""}
            onChange={handleMinPriceChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
          <input
            type="number"
            placeholder={t("Đến")}
            value={filterParams.max_price ?? ""}
            onChange={handleMaxPriceChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

// ─── 2. Service List ─────────────────────────────────────────────────────────
interface ServiceListProps {
  t: (key: string, options?: any) => string;
  services: ServiceItem[];
  loading: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onNavigateService: (id: number) => void;
}

const ServiceList = ({ t, services, loading, sortBy, onSortChange, onNavigateService }: ServiceListProps) => {
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [services]);

  const renderServiceImage = (url?: string, title?: string) => {
    if (url) {
      return <img src={url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
    }
    return (
      <div className="w-full h-full bg-linear-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
        <Icon icon="mdi:home-heart" className="text-5xl opacity-80" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
            <div className="p-6 flex flex-col gap-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sort bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">{t("Hiển thị {{count}} dịch vụ", { count: services.length })}</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          >
            <option value="popular">{t("Phổ biến nhất")}</option>
            <option value="price_asc">{t("Giá: Thấp đến Cao")}</option>
            <option value="rating">{t("Đánh giá cao nhất")}</option>
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
                onClick={() => onNavigateService(service.id)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900 relative">{renderServiceImage(service.image, service.title)}</div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">{service.category}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Icon icon="material-symbols:star" className="text-amber-400 text-base" />
                      {service.rating.toFixed(1)} <span className="text-slate-400 dark:text-slate-500 font-normal">({service.reviewsCount})</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{service.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{service.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <Icon icon="material-symbols:group-outline" className="text-base" />
                    <span>
                      {service.helpersCount}+ {t("người giúp việc")}
                    </span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t("Giá từ")}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-bold text-teal-600 dark:text-teal-400">{formatNumberVI(service.price)}đ</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">/{service.priceType.split(" ").pop()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateService(service.id);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-teal-600/10 active:scale-95 transition-all cursor-pointer"
                    >
                      {t("Đặt ngay")}
                    </button>
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

      {!loading && services.length === 0 && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Icon icon="material-symbols:search-off" className="text-5xl mb-3 mx-auto" />
          <p className="font-semibold">{t("Chưa có dịch vụ nào.")}</p>
        </div>
      )}
    </div>
  );
};

// ─── 3. Featured Helpers ─────────────────────────────────────────────────────
interface FeaturedHelpersProps {
  t: (key: string, options?: any) => string;
  helpers: HelperItem[];
  loading: boolean;
  totalHelpers: number;
  helperPage: number;
  helperLastPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onNavigateHelper: (userId: number) => void;
}

const FeaturedHelpers = ({ t, helpers, loading, totalHelpers, helperPage, helperLastPage, itemsPerPage, onPageChange, onNavigateHelper }: FeaturedHelpersProps) => {
  const renderHelperAvatar = (url?: string, name?: string) => {
    if (url) {
      return <img src={url} alt={name} className="w-full h-full object-cover" />;
    }
    return <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">{name ? name.charAt(0).toUpperCase() : "H"}</div>;
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-8 shadow-sm mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">{t("Người giúp việc tiêu biểu")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("Đội ngũ xuất sắc nhất, nhận được đánh giá cao nhất từ các gia đình.")}
            {totalHelpers > 0 && (
              <span className="ml-2 text-teal-600 dark:text-teal-400 font-semibold">
                ({totalHelpers} {t("nhân viên")})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5 flex flex-col items-center animate-pulse">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
              <div className="flex gap-1">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Cards */}
      {!loading && helpers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {helpers.map((helper) => (
            <div
              key={helper.id}
              onClick={() => onNavigateHelper(helper.userId)}
              className="border border-slate-100 dark:border-slate-700/50 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg relative group cursor-pointer"
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
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-1">
                <Icon icon="material-symbols:star" className="text-base" />
                {Number(helper.rating).toFixed(1)}
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  ({helper.reviewsCount} {t("đánh giá")})
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {helper.experienceYears} {t("năm kinh nghiệm")} · {helper.area}
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center mt-auto">
                {helper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded"
                  >
                    {t(tag)}
                  </span>
                ))}
              </div>
              {helper.bio && <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 line-clamp-2 leading-relaxed">{helper.bio}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && helpers.length === 0 && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Icon icon="material-symbols:person-search-outline" className="text-5xl mb-3 mx-auto" />
          <p className="font-semibold">{t("Không tìm thấy nhân viên phù hợp.")}</p>
          <p className="text-sm mt-1">{t("Hãy thử thay đổi bộ lọc.")}</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && helperLastPage > 1 && <Pagination currentPage={helperPage} totalItems={totalHelpers} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />}
    </section>
  );
};

// ─── 4. Main Export Component ─────────────────────────────────────────────────
export const Service = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { services, helpers, categories, loading, helperLoading, totalHelpers, helperPage, helperLastPage, filterParams, updateHelperFilter, goToHelperPage, sortBy, setSortBy } = useService();

  const handleReset = () => {
    updateHelperFilter({
      city: "TP.HCM",
      district: undefined,
      category_id: undefined,
      price_type: undefined,
      min_price: undefined,
      max_price: undefined,
      service_id: undefined,
    });
  };

  return (
    <div className="dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 gap-6 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:h-fit lg:self-start z-10">
          <SidebarFilter t={t} filterParams={filterParams} onFilterChange={updateHelperFilter} onReset={handleReset} categories={categories} />
        </aside>
        <div className="lg:col-span-9 flex flex-col gap-6">
          <ServiceList t={t} services={services} loading={loading} sortBy={sortBy} onSortChange={setSortBy} onNavigateService={(id) => navigate(`/dich-vu/${id}`)} />

          <AnimateOnScrollReveal>
            <FeaturedHelpers
              t={t}
              helpers={helpers}
              loading={helperLoading}
              totalHelpers={totalHelpers}
              helperPage={helperPage}
              helperLastPage={helperLastPage}
              itemsPerPage={filterParams.limit ?? 8}
              onPageChange={goToHelperPage}
              onNavigateHelper={(userId) => navigate(`/nguoi-giup-viec/${userId}`)}
            />
          </AnimateOnScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Service;
