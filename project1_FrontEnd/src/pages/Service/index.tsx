import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useService } from "./useHook";
import type { ServiceItem, HelperItem, ServiceFilterParams } from "./useHook";
import type { ServiceCategory } from "../../api/servicesApi/services";
import { formatNumberVI } from "../../utils";
import { Pagination } from "../../components/Pagination";
import { PriceFilter } from "../../components/PriceFilter";
import { Loading } from "../../components/Commom";
import type { CityData } from "../../api/helpers";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { fetchFavorites, toggleFavorite } from "../../redux/favoritesSlice";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, getUserRole } from "../../constants/roles";
import { CustomSelect } from "../../components/CustomSelect";
import { ExpandToggleButton } from "../../components/ExpandToggleButton";

// ─── 1. Sidebar Filter ──────────────────────────────────────────────────────
interface SidebarFilterProps {
  t: (key: string, options?: any) => string;
  filterParams: ServiceFilterParams;
  onFilterChange: (patch: Partial<ServiceFilterParams>) => void;
  onReset: () => void;
  categories: ServiceCategory[];
  regions: CityData[];
}
const RATINGS = [
  { value: 0, label: "Tất cả" },
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
];

const SidebarFilter = ({ t, filterParams, onFilterChange, onReset, categories, regions }: SidebarFilterProps) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const citiesList = regions.length > 0 ? regions.map((r) => r.name) : ["TP.HCM"];
  const selectedCityName = filterParams.city ?? "TP.HCM";
  const matchedCity = regions.find((r) => r.name === selectedCityName);
  const districtsList = matchedCity?.districts ? ["Tất cả", ...matchedCity.districts.map((d) => d.name)] : ["Tất cả", "Quận 1", "Quận 3", "Quận 10", "Bình Thạnh", "Phú Nhuận"];

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
  const handleRatingChange = (rating: number) => {
    onFilterChange({ rating_min: rating > 0 ? rating : undefined });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 lg:p-6 shadow-sm sticky top-24 flex flex-col gap-5 lg:gap-6">
      <div
        onClick={() => setIsOpenMobile((prev) => !prev)}
        className="flex items-center justify-between pb-3 lg:pb-4 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer lg:cursor-default"
      >
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Icon icon="material-symbols:filter-list" className="text-xl text-teal-600" />
          <span>{t("Bộ lọc dịch vụ")}</span>
          <Icon icon="lsicon:down-filled" className={`text-sm text-slate-500 lg:hidden transition-transform duration-200 ${isOpenMobile ? "rotate-180" : ""}`} />
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="flex items-center gap-1 text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer"
        >
          <Icon icon="material-symbols:restart-alt-rounded" className="text-lg" />
          <span>{t("Xóa bộ lọc")}</span>
        </button>
      </div>

      <div className={`flex-col gap-5 lg:gap-6 ${isOpenMobile ? "flex" : "hidden lg:flex"}`}>
        {/* Tìm kiếm */}
        <div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Tìm kiếm")}</h4>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5">
            <Icon icon="material-symbols:search-rounded" className="text-slate-400 text-xl shrink-0" />
            <input
              type="text"
              placeholder={t("Nhập tên dịch vụ...")}
              value={filterParams.search ?? ""}
              onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 font-semibold"
            />
            {filterParams.search && (
              <button type="button" onClick={() => onFilterChange({ search: undefined })} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors shrink-0">
                <Icon icon="material-symbols:close-rounded" className="text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Giao diện lọc Thành phố */}
        <div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Thành phố")}</h4>
          <CustomSelect value={filterParams.city ?? "TP.HCM"} onChange={handleCityChange} options={citiesList.map((c) => ({ value: c, label: t(c) }))} />
        </div>

        {/* Quận / Huyện */}
        <div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Quận / Huyện")}</h4>
          <CustomSelect value={filterParams.district ?? "Tất cả"} onChange={handleDistrictChange} options={districtsList.map((d) => ({ value: d, label: t(d) }))} />
        </div>

        {/* Danh mục dịch vụ */}
        <div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">{t("Danh mục dịch vụ")}</h4>
          <CustomSelect
            value={filterParams.category_id ?? "Tất cả"}
            onChange={handleCategoryChange}
            options={[{ value: "Tất cả", label: t("Tất cả danh mục") }, ...categories.map((cat) => ({ value: cat.id, label: t(cat.name) }))]}
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
                  {t(r.label)}
                  {r.value > 0 && <Icon icon="material-symbols:star" className="text-amber-400 text-base" />}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Khoảng giá */}
        <PriceFilter
          title={t("Khoảng giá (VNĐ)")}
          minPrice={filterParams.min_price}
          maxPrice={filterParams.max_price}
          onChangeRange={(min, max) => {
            onFilterChange({ min_price: min, max_price: max });
          }}
          t={t}
          nameGroup="service_price_filter"
        />
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevServices, setPrevServices] = useState(services);

  if (services !== prevServices) {
    setPrevServices(services);
    setIsExpanded(false);
  }

  const visibleCount = isExpanded ? services.length : 6;

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
            <div className="aspect-4/3 bg-slate-200 dark:bg-slate-700" />
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
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 z-20">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("Hiển thị {{count}} dịch vụ", { count: services.length })}</span>
          <div className="w-44">
            <CustomSelect
              value={sortBy}
              onChange={onSortChange}
              options={[
                { value: "popular", label: t("Phổ biến nhất") },
                { value: "price_asc", label: t("Giá: Thấp đến Cao") },
                { value: "rating", label: t("Đánh giá cao nhất") },
              ]}
            />
          </div>
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
                <div className="aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-900 relative">{renderServiceImage(service.image, service.title)}</div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {t(service.category)}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-350">
                      <Icon icon="material-symbols:star" className="text-amber-400 text-base" />
                      {(Number(service.rating) || 0).toFixed(1)} <span className="text-slate-400 dark:text-slate-500 font-normal">({service.reviewsCount || 0})</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{t(service.title)}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{t(service.description)}</p>
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
                        <span className="text-xs text-slate-400 dark:text-slate-500">/{t(`unit_${service.priceType}`)}</span>
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
          {services.length > 6 && (
            <div className="flex justify-center mt-12">
              <ExpandToggleButton isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />
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
  isCustomer: boolean;
  favoriteIds: number[];
  onToggleFavorite: (helperId: number, e: React.MouseEvent) => void;
}

const FeaturedHelpers = ({
  t,
  helpers,
  loading,
  totalHelpers,
  helperPage,
  helperLastPage,
  itemsPerPage,
  onPageChange,
  onNavigateHelper,
  isCustomer,
  favoriteIds,
  onToggleFavorite,
}: FeaturedHelpersProps) => {
  const renderHelperAvatar = (url?: string, name?: string) => {
    if (url) {
      return <img src={url} alt={name} className="w-full h-full object-cover" />;
    }
    return <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">{name ? name.charAt(0).toUpperCase() : "H"}</div>;
  };

  return (
    <section className="mt-12">
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
              className="relative p-0.5 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              {/* Dynamic border gradient background on hover */}
              <div className="absolute inset-[-150%] animate-border-spin bg-conic-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

              {/* Inner Card Content */}
              <div className="relative bg-white dark:bg-slate-850 rounded-2xl p-5 flex flex-col items-center text-center w-full h-full z-10">
                {isCustomer && (
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(helper.id, e)}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-805 hover:bg-rose-50 dark:hover:bg-slate-700 backdrop-blur-xs rounded-full border border-slate-200/50 dark:border-slate-700 transition-all duration-300 hover:scale-110 cursor-pointer shadow-md hover:shadow-lg hover:shadow-rose-500/25 active:scale-95 group/heart z-10"
                  >
                    <Icon
                      icon={favoriteIds.includes(helper.id) ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                      className={`text-xl transition-colors ${favoriteIds.includes(helper.id) ? "text-rose-500 fill-rose-500" : "text-slate-400 group-hover/heart:text-rose-500"}`}
                    />
                  </button>
                )}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700 group-hover:border-teal-500 dark:group-hover:border-teal-400 transition-colors duration-300">
                    {renderHelperAvatar(helper.avatar, helper.name)}
                  </div>
                  {helper.isOnline && <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500 shadow-sm z-10" />}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{helper.name}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-1">
                  <Icon icon="material-symbols:star" className="text-base" />
                  {(Number(helper.rating) || 0).toFixed(1)}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                    ({helper.reviewsCount || 0} {t("đánh giá")})
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
  const { services, helpers, categories, loading, helperLoading, totalHelpers, helperPage, helperLastPage, filterParams, updateHelperFilter, goToHelperPage, sortBy, setSortBy, regions } =
    useService();

  const dispatch = useAppDispatch();
  const { isLoggedIn, user } = useAuth();
  const isCustomer = isLoggedIn && getUserRole(user) === ROLES.CUSTOMER;
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  useEffect(() => {
    if (isCustomer) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isCustomer]);

  if (loading && services.length === 0) {
    return <Loading fullScreen />;
  }

  const handleToggleFavorite = (helperId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/dang-nhap");
      return;
    }
    if (!isCustomer) {
      return;
    }
    const isCurrentlyFavorite = favoriteIds.includes(helperId);
    dispatch(toggleFavorite({ helperId, isCurrentlyFavorite }));
  };

  const handleReset = () => {
    updateHelperFilter({
      city: "TP.HCM",
      district: undefined,
      category_id: undefined,
      price_type: undefined,
      min_price: undefined,
      max_price: undefined,
      service_id: undefined,
      search: undefined,
    });
  };

  return (
    <div className="dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 gap-6 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:h-fit lg:self-start z-10">
          <SidebarFilter t={t} filterParams={filterParams} onFilterChange={updateHelperFilter} onReset={handleReset} categories={categories} regions={regions} />
        </aside>
        <div className="lg:col-span-9 flex flex-col gap-6">
          <ServiceList t={t} services={services} loading={loading} sortBy={sortBy} onSortChange={setSortBy} onNavigateService={(id) => navigate(`/dich-vu/${id}`)} />

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
            isCustomer={isCustomer}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>
    </div>
  );
};

export default Service;
