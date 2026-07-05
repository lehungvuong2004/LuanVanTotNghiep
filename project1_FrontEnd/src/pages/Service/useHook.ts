import { useState, useEffect, useCallback } from "react";
import {
  getHelpersPublic,
  type HelperProfile,
} from "../../api/helpers";
import { getServicesApi, getCategoriesApi, type Service, type ServiceCategory } from "../../api/services";

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
function mapHelperProfile(profile: HelperProfile): HelperItem {
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
      ? rawAreas.map((a: any) => a.district).filter(Boolean).join(", ")
      : "TP.HCM";

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
    bio: profile.bio ?? undefined,
  };
}

// Chuyển Service từ API → ServiceItem cho UI
function mapService(service: Service, index: number): ServiceItem {
  const UNSPLASH_IMAGES = [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545130853-a5c0f13d7449?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
  ];

  return {
    id: service.id,
    title: service.name,
    category: service.category?.name ?? "Dịch vụ",
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)), // sinh số thực ngẫu nhiên từ 3.5 đến 5.0
    reviewsCount: Math.floor(Math.random() * 100) + 10,
    price: Number(service.base_price) || 0,
    priceType: priceTypeLabel(service.price_type),
    area: "TP.HCM",
    helpersCount: Math.floor(Math.random() * 15) + 3,
    description: service.description ?? "Dịch vụ chuyên nghiệp, chất lượng cao.",
    image: UNSPLASH_IMAGES[index % UNSPLASH_IMAGES.length],
    isFavorite: false,
  };
}

export const useService = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [helpers, setHelpers] = useState<HelperItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperLoading, setHelperLoading] = useState(false);
  const [totalHelpers, setTotalHelpers] = useState(0);
  const [helperPage, setHelperPage] = useState(1);
  const [helperLastPage, setHelperLastPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [filterParams, setFilterParams] = useState<ServiceFilterParams>({
    limit: 8,
    page: 1,
    city: "TP.HCM",
  });

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

  // Fetch services từ API theo bộ lọc
  const fetchServices = useCallback(async (params: ServiceFilterParams) => {
    setLoading(true);
    try {
      const res = await getServicesApi({
        limit: 50,
        category_id: params.category_id,
        price_type: params.price_type,
        min_price: params.min_price,
        max_price: params.max_price,
        city: params.city === "Tất cả" ? undefined : params.city,
        district: params.district === "Tất cả" ? undefined : params.district,
      });
      const rawServices = res?.data?.data ?? [];
      setServices(rawServices.map((s, i) => mapService(s, i)));
    } catch (err) {
      console.error("[useService] fetchServices failed:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch helpers công khai từ API
  const fetchHelpers = useCallback(async (params: ServiceFilterParams) => {
    setHelperLoading(true);
    try {
      const res = await getHelpersPublic({
        limit: params.limit,
        page: params.page,
        service_id: params.service_id,
      });
      const pagination = res?.data;
      const rawHelpers: HelperProfile[] = pagination?.data ?? [];

      setHelpers(rawHelpers.map(mapHelperProfile));
      setTotalHelpers(pagination?.total ?? 0);
      setHelperPage(pagination?.current_page ?? 1);
      setHelperLastPage(pagination?.last_page ?? 1);
    } catch (err) {
      console.error("[useService] fetchHelpers failed:", err);
      setHelpers([]);
    } finally {
      setHelperLoading(false);
    }
  }, []);

  // Trigger fetch khi bộ lọc thay đổi
  useEffect(() => {
    fetchServices(filterParams);
    fetchHelpers(filterParams);
  }, [filterParams, fetchServices, fetchHelpers]);

  // Cập nhật filter (gộp, không ghi đè)
  const updateHelperFilter = useCallback((patch: Partial<ServiceFilterParams>) => {
    setFilterParams((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  // Đổi trang
  const goToHelperPage = useCallback((page: number) => {
    setFilterParams((prev) => ({ ...prev, page }));
  }, []);

  // Lọc và sắp xếp services client-side
  const filteredAndSortedServices = [...services]
    .filter((s) => {
      if (filterParams.rating_min && s.rating < filterParams.rating_min) {
        return false;
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
    setSortBy,
  };
};
