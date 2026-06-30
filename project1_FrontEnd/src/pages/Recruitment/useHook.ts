import { useState, useEffect } from "react";
import { getCategoriesApi, type ServiceCategory } from "../../api/services";
import { getJobPostsApi, type JobPost } from "../../api/jobPosts";


export const SALARY_OPTS = [
  { value: "all", label: "Tất cả" },
  { value: "under-5m", label: "Dưới 5 triệu" },
  { value: "5m-10m", label: "5 – 10 triệu" },
  { value: "10m-15m", label: "10 – 15 triệu" },
  { value: "over-15m", label: "Trên 15 triệu" },
];

export const URGENCY_OPTS = [
  { value: "all", label: "Tất cả" },
  { value: "urgent", label: "Cần gấp" },
  { value: "normal", label: "Bình thường" },
];


const formatWorkingTime = (timeStr: string | null) => {
  if (!timeStr) return "";
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
  const match = timeStr.match(isoRegex);
  if (match) {
    const [_, year, month, day, hours, minutes] = match;
    return `${hours}:${minutes} ngày ${day}/${month}/${year}`;
  }
  return timeStr;
};

export interface JobItem {
  id: number;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  isUrgent: boolean;
  urgencyLevel: "urgent" | "normal" | "long";
  salary: string;
  location: string;
  postedTime: string;
  createdAt: string;
  expirationDate: string | null;
  workingTime: string;
  services: string[];
  description: string;
}

export const useRecruitment = () => {
  const [allJobs, setAllJobs] = useState<JobPost[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<(number | string)[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Mới nhất");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catRes = await getCategoriesApi();
        setCategories(catRes.data || []);

        const jobRes = await getJobPostsApi({ limit: 1000 });
        setAllJobs(jobRes.data.data || []);
      } catch (err) {
        console.error("Error loading recruitment data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSalary, selectedUrgency, searchQuery, sortBy]);

  const getRelativeTime = (createdAtStr: string) => {
    if (!createdAtStr) return "";
    // Normalize to UTC: if the server returns "2026-06-30 10:10:50" (no timezone),
    // JS would parse it as local time, causing a +7h offset in Vietnam.
    // Replacing space with T and appending Z forces correct UTC interpretation.
    const normalized =
      createdAtStr.includes("Z") || createdAtStr.includes("+")
        ? createdAtStr
        : createdAtStr.replace(" ", "T") + "Z";
    const created = new Date(normalized);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 65) {
      const mins = Math.max(1, diffMins);
      return `Đăng ${mins} phút trước`;
    } else if (diffHours < 24) {
      return `Đăng ${diffHours} giờ trước`;
    } else {
      return `Đăng ${diffDays} ngày trước`;
    }
  };

  // Filter logic
  const filteredJobs = allJobs.filter((job) => {
    // 0. Hide expired jobs (expired_at has passed)
    if (job.expired_at && new Date(job.expired_at).getTime() < Date.now()) return false;

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Categories filter
    if (selectedCategories.length > 0) {
      const hasMatchedCategory = job.category_id && selectedCategories.includes(job.category_id);
      const hasOtherCategory = selectedCategories.includes("other") && !job.category_id;
      if (!hasMatchedCategory && !hasOtherCategory) return false;
    }

    // 3. Salary Range filter
    if (selectedSalary !== "all") {
      const salaryNum = Number(job.salary) || 0;
      if (selectedSalary === "under-5m" && salaryNum >= 5000000) return false;
      if (selectedSalary === "5m-10m" && (salaryNum < 5000000 || salaryNum > 10000000)) return false;
      if (selectedSalary === "10m-15m" && (salaryNum < 10000000 || salaryNum > 15000000)) return false;
      if (selectedSalary === "over-15m" && salaryNum < 15000000) return false;
    }

    // 4. Urgency filter
    if (selectedUrgency !== "all") {
      // Determine urgency (e.g. if expired_at is within 5 days, or just mock it)
      const isUrgent = job.expired_at
        ? (new Date(job.expired_at).getTime() - new Date().getTime()) / 86400000 <= 5
        : false;
      const isUrgentFilter = selectedUrgency === "urgent";
      if (isUrgent !== isUrgentFilter) return false;
    }

    return true;
  });

  // Map backend JobPost schema to component JobItem schema
  const mappedJobs: JobItem[] = filteredJobs.map((job) => {
    let customCategory: string | null = null;
    let customServicesList: string[] = [];
    let displayDescription = job.description || "";

    if (job.description) {
      // Extract Category Tag
      const catMatch = displayDescription.match(/^\[Danh mục:\s*([^\]]+)\]\s*/);
      if (catMatch) {
        customCategory = catMatch[1];
        displayDescription = displayDescription.replace(/^\[Danh mục:\s*[^\]]+\]\s*/, "");
      }

      // Extract Services Tag (this could be after Category Tag)
      const serviceMatch = displayDescription.match(/^\[Dịch vụ:\s*([^\]]+)\]\s*/);
      if (serviceMatch) {
        customServicesList = serviceMatch[1].split(",").map(s => s.trim()).filter(Boolean);
        displayDescription = displayDescription.replace(/^\[Dịch vụ:\s*[^\]]+\]\s*/, "");
      }
    }

    const matchedCat = categories.find((c) => c.id === job.category_id);
    const catName = customCategory || matchedCat?.name || "Khác";
    const categoryIcon = matchedCat?.icon || "material-symbols:work-outline";

    // Dynamic color matching based on category_id
    let categoryColor = "text-teal-500";
    if (job.category_id) {
      const colors = ["text-amber-500", "text-violet-500", "text-sky-500", "text-emerald-500", "text-rose-500"];
      categoryColor = colors[job.category_id % colors.length];
    }

    // Determine urgency level from expiration date
    let urgencyLevel: "urgent" | "normal" | "long" = "long";
    if (job.expired_at) {
      const daysLeft = (new Date(job.expired_at).getTime() - Date.now()) / 86400000;
      if (daysLeft < 2) urgencyLevel = "urgent";
      else if (daysLeft < 4) urgencyLevel = "normal";
      else urgencyLevel = "long";
    }
    const isUrgent = urgencyLevel === "urgent";

    const standardServices = job.services?.map(s => s.name) || [];
    const combinedServices = [...standardServices, ...customServicesList];

    return {
      id: job.id,
      title: job.title,
      category: catName,
      categoryIcon,
      categoryColor,
      isUrgent,
      urgencyLevel,
      salary: job.salary ? `${Number(job.salary).toLocaleString()} VNĐ/dịch vụ` : "Thỏa thuận",
      location: job.district || job.city ? `${job.district}, ${job.city}` : "Việt Nam",
      postedTime: getRelativeTime(job.created_at),
      createdAt: job.created_at,
      expirationDate: job.expired_at || null,
      workingTime: formatWorkingTime(job.working_time),
      services: combinedServices,
      description: displayDescription,
    };
  });

  // Sorting logic
  const sortedJobs = [...mappedJobs].sort((a, b) => {
    if (sortBy === "Lương cao nhất") {
      const getSalaryVal = (salaryStr: string) => {
        const cleaned = salaryStr.replace(/\D/g, "");
        return cleaned ? Number(cleaned) : 0;
      };
      return getSalaryVal(b.salary) - getSalaryVal(a.salary);
    }
    if (sortBy === "Cần gấp nhất") {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
    }
    // Default: "Mới nhất" (descending by id)
    return b.id - a.id;
  });

  const totalItems = sortedJobs.length;

  // Paginated slices
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSalary("all");
    setSelectedUrgency("all");
    setSearchQuery("");
    setSortBy("Mới nhất");
  };

  return {
    jobs: paginatedJobs,
    totalItems,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedCategories,
    setSelectedCategories,
    selectedSalary,
    setSelectedSalary,
    selectedUrgency,
    setSelectedUrgency,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    clearFilters,
    categories,
    isLoading,
  };
};
