import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { getHelpersPublic, type HelperProfile } from "../../api/helpers";
import { getServicesEnrichedApi, getCategoriesApi, type Service, type ServiceCategory } from "../../api/servicesApi/services";

// Shape dùng trong UI cho Service Card
export interface ServiceItem {
  id: number;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  price: number;
  priceType: string;
  area: string;
  helpersCount: number;
  description: string;
  image?: string;
  isFavorite?: boolean;
}

// Shape dùng trong UI cho Helper Card
export interface HelperItem {
  id: number;
  userId: number;
  name: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  area: string;
  tags: string[];
  avatar?: string;
  isOnline?: boolean;
  bio?: string;
}

// Bộ lọc hợp nhất cho cả Service và Helper
export interface ServiceFilterParams {
  city?: string;
  district?: string;
  category_id?: number | string;
  price_type?: string;
  min_price?: number;
  max_price?: number;
  service_id?: number | string;
  gender?: string;
  rating_min?: number;
  limit?: number;
  page?: number;
  search?: string;
}

// Map base_price number → định dạng giá tiêu chuẩn
function priceTypeLabel(priceType: string): string {
  switch (priceType) {
    case "hourly":
      return "Theo giờ";
    case "fixed":
      return "Cố định";
    case "daily":
      return "Theo ngày";
    default:
      return "Theo giờ";
  }
}

// Chuyển HelperProfile từ API → HelperItem cho UI
function mapHelperProfile(profile: HelperProfile, t?: any): HelperItem {
  const trans = t || ((s: string) => s);
  const skillTags =
    profile.skills
      ?.map((s) => s.service?.name ?? "")
      .filter(Boolean)
      .slice(0, 3) ?? [];

  // API trả về snake_case "working_areas", interface dùng camelCase "workingAreas"
  const rawAreas =
    (profile as any).working_areas ?? profile.workingAreas ?? [];

  const area =
    rawAreas.length > 0
      ? rawAreas.map((a: any) => trans(a.district)).filter(Boolean).join(", ")
      : trans("TP.HCM");

  return {
    id: profile.id,
    userId: profile.user_id,
    name: (profile as any).user?.full_name ?? `Helper #${profile.id}`,
    rating: Number(profile.rating_avg) || 0,
    reviewsCount: profile.total_reviews || 0,
    experienceYears: profile.experience_year || 0,
    area,
    tags: skillTags,
    avatar: (profile as any).user?.avatar ?? undefined,
    isOnline: false, // online status handled by socket
    bio: profile.bio ?? undefined };
}

// Chuyển Service từ API → ServiceItem cho UI (sử dụng dữ liệu thực từ enriched API)
function mapService(service: Service, t?: any): ServiceItem {
  const trans = t || ((s: string) => s);
  return {
    id: service.id,
    title: service.name,
    category: service.category?.name ?? trans("Dịch vụ"),
    rating: Number((service as any).avg_rating) || 0,
    reviewsCount: Number((service as any).total_reviews) || 0,
    price: Number(service.base_price) || 0,
    priceType: priceTypeLabel(service.price_type),
    area: trans("TP.HCM"),
    helpersCount: Number((service as any).helpers_count) || 0,
    description: service.description ?? trans("Dịch vụ chuyên nghiệp, chất lượng cao."),
    image: service.image || undefined,
    isFavorite: false };
}

export const useService = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [helpers, setHelpers] = useState<HelperItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperLoading, setHelperLoading] = useState(false);
  const [totalHelpers, setTotalHelpers] = useState(0);
  const [helperPage, setHelperPage] = useState(1);
  const [helperLastPage, setHelperLastPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("popular");

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter params from URL if present
  const [filterParams, setFilterParams] = useState<ServiceFilterParams>(() => {
    const searchVal = searchParams.get("search") || undefined;
    const districtVal = searchParams.get("district") || undefined;

    const validDistricts = ["Quận 1", "Quận 3", "Quận 10", "Bình Thạnh", "Phú Nhuận"];
    let matchedDistrict: string | undefined = undefined;
    if (districtVal) {
      const normalized = districtVal.toLowerCase().trim();
      matchedDistrict = validDistricts.find(
        (d) => d.toLowerCase() === normalized || normalized.includes(d.toLowerCase())
      );
      if (!matchedDistrict) {
        if (normalized.includes("q1") || normalized.includes("quận 1") || normalized === "1") matchedDistrict = "Quận 1";
        else if (normalized.includes("q3") || normalized.includes("quận 3") || normalized === "3") matchedDistrict = "Quận 3";
        else if (normalized.includes("q10") || normalized.includes("quận 10") || normalized === "10") matchedDistrict = "Quận 10";
        else if (normalized.includes("bình thạnh") || normalized.includes("binh thanh")) matchedDistrict = "Bình Thạnh";
        else if (normalized.includes("phú nhuận") || normalized.includes("phu nhuan")) matchedDistrict = "Phú Nhuận";
      }
    }

    return {
      limit: 8,
      page: 1,
      city: "TP.HCM",
      search: searchVal,
      district: matchedDistrict
    };
  });

  // Watch URL params (e.g. back button, direct navigation)
  useEffect(() => {
    const searchVal = searchParams.get("search") || undefined;
    const districtVal = searchParams.get("district") || undefined;

    const validDistricts = ["Quận 1", "Quận 3", "Quận 10", "Bình Thạnh", "Phú Nhuận"];
    let matchedDistrict: string | undefined = undefined;
    if (districtVal) {
      const normalized = districtVal.toLowerCase().trim();
      matchedDistrict = validDistricts.find(
        (d) => d.toLowerCase() === normalized || normalized.includes(d.toLowerCase())
      );
      if (!matchedDistrict) {
        if (normalized.includes("q1") || normalized.includes("quận 1") || normalized === "1") matchedDistrict = "Quận 1";
        else if (normalized.includes("q3") || normalized.includes("quận 3") || normalized === "3") matchedDistrict = "Quận 3";
        else if (normalized.includes("q10") || normalized.includes("quận 10") || normalized === "10") matchedDistrict = "Quận 10";
        else if (normalized.includes("bình thạnh") || normalized.includes("binh thanh")) matchedDistrict = "Bình Thạnh";
        else if (normalized.includes("phú nhuận") || normalized.includes("phu nhuan")) matchedDistrict = "Phú Nhuận";
      }
    }

    setFilterParams((prev) => {
      if (prev.search === searchVal && prev.district === (matchedDistrict || prev.district)) {
        return prev;
      }
      return {
        ...prev,
        search: searchVal,
        district: matchedDistrict || prev.district
      };
    });
  }, [searchParams]);

  // Fetch danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        setCategories(res?.data ?? []);
      } catch (err) {
        console.error("[useService] fetchCategories failed:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services từ API (enriched — dữ liệu thực)
  const fetchServices = useCallback(async (params: ServiceFilterParams) => {
    setLoading(true);
    try {
      const res = await getServicesEnrichedApi({
        limit: 50,
        category_id: params.category_id,
        price_type: params.price_type,
        min_price: params.min_price,
        max_price: params.max_price
      });
      const rawServices = res?.data?.data ?? [];
      setServices(rawServices.map((s) => mapService(s, t)));
    } catch (err) {
      console.error("[useService] fetchServices failed:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch helpers công khai từ API
  const fetchHelpers = useCallback(async (params: ServiceFilterParams) => {
    setHelperLoading(true);
    try {
      const res = await getHelpersPublic({
        limit: params.limit,
        page: params.page,
        service_id: params.service_id,
        city: params.city !== "Tất cả" ? params.city : undefined,
        district: params.district !== "Tất cả" ? params.district : undefined,
        rating_min: params.rating_min
      });
      const pagination = res?.data;
      const rawHelpers: HelperProfile[] = pagination?.data ?? [];

      setHelpers(rawHelpers.map((h) => mapHelperProfile(h, t)));
      setTotalHelpers(pagination?.total ?? 0);
      setHelperPage(pagination?.current_page ?? 1);
      setHelperLastPage(pagination?.last_page ?? 1);
    } catch (err) {
      console.error("[useService] fetchHelpers failed:", err);
      setHelpers([]);
    } finally {
      setHelperLoading(false);
    }
  }, [t]);

  // Trigger fetch khi bộ lọc thay đổi
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchServices(filterParams);
      fetchHelpers(filterParams);
    });
  }, [filterParams, fetchServices, fetchHelpers]);

  // Cập nhật filter (gộp, không ghi đè)
  const updateHelperFilter = useCallback((patch: Partial<ServiceFilterParams>) => {
    setFilterParams((prev) => ({ ...prev, ...patch, page: 1 }));
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      if ("search" in patch) {
        if (patch.search) next.set("search", patch.search);
        else next.delete("search");
      }
      if ("district" in patch) {
        if (patch.district) next.set("district", patch.district);
        else next.delete("district");
      }
      return next;
    });
  }, [setSearchParams]);

  // Đổi trang
  const goToHelperPage = useCallback((page: number) => {
    setFilterParams((prev) => ({ ...prev, page }));
  }, []);

  // Lọc và sắp xếp services client-side (chỉ hiển thị dịch vụ có thợ khả dụng cho Khách hàng)
  const filteredAndSortedServices = [...services]
    .filter((s) => {
      if (s.helpersCount <= 0) {
        return false;
      }
      if (filterParams.rating_min && s.rating < filterParams.rating_min) {
        return false;
      }
      if (filterParams.search) {
        const query = filterParams.search.toLowerCase().trim();
        const titleMatch = s.title.toLowerCase().includes(query);
        const descMatch = s.description.toLowerCase().includes(query);
        const catMatch = s.category.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !catMatch) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      // popular: sắp xếp theo helpersCount desc
      return b.helpersCount - a.helpersCount;
    });

  return {
    services: filteredAndSortedServices,
    helpers,
    categories,
    loading,
    helperLoading,
    totalHelpers,
    helperPage,
    helperLastPage,
    filterParams,
    updateHelperFilter,
    goToHelperPage,
    sortBy,
    setSortBy };
};
