import { useState, useEffect } from "react";

/* ── Static filter options (exported for use in components) ── */
export const CATEGORIES = ["Trông trẻ", "Giúp việc nhà", "Chăm sóc người già", "Gia sư"];

export const SALARY_OPTS = [
  { value: "all",        label: "Tất cả" },
  { value: "under-5m",   label: "Dưới 5 triệu" },
  { value: "5m-10m",     label: "5 – 10 triệu" },
  { value: "10m-15m",    label: "10 – 15 triệu" },
  { value: "negotiable", label: "Thỏa thuận" },
];

export const URGENCY_OPTS = [
  { value: "all",    label: "Tất cả" },
  { value: "urgent", label: "Cần gấp" },
  { value: "normal", label: "Bình thường" },
];

export const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  "Trông trẻ":          { icon: "material-symbols:child-care-outline",        color: "text-violet-500" },
  "Giúp việc nhà":      { icon: "material-symbols:cleaning-services-outline", color: "text-amber-500"  },
  "Chăm sóc người già": { icon: "material-symbols:elderly-outline",            color: "text-sky-500"   },
  "Gia sư":             { icon: "material-symbols:school-outline",            color: "text-emerald-500" },
};

// Prop Interfaces
export type TFn = (key: string, options?: any) => string;

export interface HeroProps {
  t: TFn;
}

export interface SidebarProps {
  t: TFn;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSalary: string;
  setSelectedSalary: React.Dispatch<React.SetStateAction<string>>;
  selectedUrgency: string;
  setSelectedUrgency: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
}

export interface JobListProps {
  t: TFn;
  jobs: JobItem[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export interface JobCardProps {
  t: TFn;
  job: JobItem;
}

export interface JobItem {
  id: number;
  title: string;
  category: string;
  isUrgent: boolean;
  salary: string;
  salaryRange: "under-5m" | "5m-10m" | "10m-15m" | "negotiable";
  location: string;
  postedTime: string;
  description: string;
}

export const useRecruitment = () => {
  const [jobs] = useState<JobItem[]>([
    {
      id: 1,
      title: "Tìm bảo mẫu trông bé 2 tuổi giờ hành chính",
      category: "Trông trẻ",
      isUrgent: true,
      salary: "8 - 10 triệu/tháng",
      salaryRange: "5m-10m",
      location: "Quận 7, TP.HCM",
      postedTime: "Đăng 2 giờ trước",
      description: "Gia đình cần tìm một cô bảo mẫu có kinh nghiệm, yêu trẻ, cẩn thận trông bé gái 2 tuổi từ thứ 2 đến thứ 6. Không yêu cầu làm việc nhà.",
    },
    {
      id: 2,
      title: "Tuyển cô giúp việc bao ăn ở lại, nhà chung cư",
      category: "Giúp việc nhà",
      isUrgent: false,
      salary: "9 triệu + thưởng",
      salaryRange: "5m-10m",
      location: "Cầu Giấy, Hà Nội",
      postedTime: "Đăng hôm qua",
      description: "Nhà chung cư 3 phòng ngủ cần cô giúp việc dọn dẹp, nấu ăn cơ bản. Yêu cầu sạch sẽ, thật thà, có giấy tờ tùy thân rõ ràng.",
    },
    {
      id: 3,
      title: "Cần người chăm sóc bà cụ 80 tuổi yếu, ít đi lại",
      category: "Chăm sóc người già",
      isUrgent: false,
      salary: "12 triệu/tháng",
      salaryRange: "10m-15m",
      location: "Gò Vấp, TP.HCM",
      postedTime: "Đăng 3 ngày trước",
      description: "Tìm người có sức khỏe, kiên nhẫn chăm sóc bà cụ. Công việc bao gồm vệ sinh cá nhân, đút ăn, xoa bóp cơ bản. Có người nhà hỗ trợ buổi tối.",
    },
    {
      id: 4,
      title: "Gia sư Tiếng Anh cho bé lớp 3 (Kèm 1-1 tại nhà)",
      category: "Gia sư",
      isUrgent: false,
      salary: "250k - 300k/buổi",
      salaryRange: "negotiable",
      location: "Thủ Đức, TP.HCM",
      postedTime: "Đăng 1 tuần trước",
      description: "Yêu cầu sinh viên hoặc giáo viên chuyên ngành Ngôn ngữ Anh, phát âm chuẩn. Dạy 3 buổi/tuần vào buổi tối.",
    },
    {
      id: 5,
      title: "Tuyển người dọn dẹp văn phòng theo giờ hành chính",
      category: "Giúp việc nhà",
      isUrgent: true,
      salary: "4.5 triệu/tháng",
      salaryRange: "under-5m",
      location: "Quận 1, TP.HCM",
      postedTime: "Đăng 4 giờ trước",
      description: "Văn phòng công ty cần một nhân viên dọn dẹp vệ sinh vào các ngày thứ 2, 4, 6 trong tuần. Môi trường làm việc thoải mái, thân thiện.",
    },
    {
      id: 6,
      title: "Chăm bé sơ sinh 3 tháng tuổi tại căn hộ chung cư",
      category: "Trông trẻ",
      isUrgent: true,
      salary: "11 triệu/tháng",
      salaryRange: "10m-15m",
      location: "Nam Từ Liêm, Hà Nội",
      postedTime: "Đăng 1 ngày trước",
      description: "Cần tìm người có nhiều kinh nghiệm chăm trẻ sơ sinh, am hiểu kiến thức dinh dưỡng và tắm bé. Làm việc bao ăn ở lại.",
    },
    {
      id: 7,
      title: "Gia sư Toán & Khoa học bằng tiếng Anh cấp trung học",
      category: "Gia sư",
      isUrgent: false,
      salary: "500k/buổi",
      salaryRange: "negotiable",
      location: "Quận 2, TP.HCM",
      postedTime: "Đăng 5 ngày trước",
      description: "Yêu cầu sinh viên trường Quốc tế hoặc giáo viên dạy giỏi, tiếng Anh trôi chảy. Dạy kèm cho học sinh lớp 8 chuẩn bị đi du học.",
    },
    {
      id: 8,
      title: "Cần nam điều dưỡng chăm sóc cụ ông chấn thương",
      category: "Chăm sóc người già",
      isUrgent: true,
      salary: "14 triệu/tháng",
      salaryRange: "10m-15m",
      location: "Đống Đa, Hà Nội",
      postedTime: "Đăng 6 giờ trước",
      description: "Tìm người có chứng chỉ điều dưỡng hoặc am hiểu y tế để chăm sóc cụ ông phục hồi sau phẫu thuật xương đùi. Yêu cầu khỏe mạnh, chu đáo.",
    },
    {
      id: 9,
      title: "Giúp việc gia đình theo giờ buổi chiều (3h - 7h tối)",
      category: "Giúp việc nhà",
      isUrgent: false,
      salary: "3.5 triệu/tháng",
      salaryRange: "under-5m",
      location: "Thanh Xuân, Hà Nội",
      postedTime: "Đăng 2 ngày trước",
      description: "Công việc chủ yếu là chuẩn bị cơm tối cho gia đình 4 người và dọn dẹp nhà cửa cơ bản. Cần người sạch sẽ, gọn gàng, nấu ăn ngon.",
    },
    {
      id: 10,
      title: "Tuyển bảo mẫu đưa đón bé 6 tuổi đi học tiểu học",
      category: "Trông trẻ",
      isUrgent: false,
      salary: "6 triệu/tháng",
      salaryRange: "5m-10m",
      location: "Bình Thạnh, TP.HCM",
      postedTime: "Đăng 4 ngày trước",
      description: "Đón bé từ trường về nhà, tắm rửa, cho ăn nhẹ và kèm bé tự học đến khi bố mẹ đi làm về. Yêu cầu đi xe máy an toàn, tính tình ôn hòa.",
    },
    {
      id: 11,
      title: "Chăm sóc cụ bà tai biến nằm một chỗ tại bệnh viện",
      category: "Chăm sóc người già",
      isUrgent: true,
      salary: "450k/ngày",
      salaryRange: "negotiable",
      location: "Quận 5, TP.HCM",
      postedTime: "Đăng 12 giờ trước",
      description: "Chăm sóc xoay trở, hỗ trợ ăn uống qua ống xông, vệ sinh cá nhân cho cụ bà đang điều trị phục hồi chức năng tại bệnh viện.",
    },
    {
      id: 12,
      title: "Tổng vệ sinh nhà cửa đón Tết và các dịp lễ lớn",
      category: "Giúp việc nhà",
      isUrgent: false,
      salary: "2 triệu/ngày",
      salaryRange: "under-5m",
      location: "Hoàn Kiếm, Hà Nội",
      postedTime: "Đăng 1 tuần trước",
      description: "Cần nhóm hoặc cá nhân dọn dẹp vệ sinh trần nhà, lau chùi kính, đánh sàn đá căn hộ biệt thự cổ diện tích rộng.",
    },
  ]);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Mới nhất");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSalary, selectedUrgency, searchQuery, sortBy]);

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // 2. Categories filter
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(job.category)) return false;
    }

    // 3. Salary Range filter
    if (selectedSalary !== "all") {
      if (job.salaryRange !== selectedSalary) return false;
    }

    // 4. Urgency filter
    if (selectedUrgency !== "all") {
      const isUrgentFilter = selectedUrgency === "urgent";
      if (job.isUrgent !== isUrgentFilter) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "Lương cao nhất") {
      // Sort priority based on salaryRange
      const priority = { negotiable: 4, "10m-15m": 3, "5m-10m": 2, "under-5m": 1 };
      return priority[b.salaryRange] - priority[a.salaryRange];
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
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
  };
};
