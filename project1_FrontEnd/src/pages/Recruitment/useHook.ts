import { useState } from "react";

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
}

export interface JobListProps {
  t: TFn;
  jobs: JobItem[];
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
  ]);

  return {
    jobs,
  };
};
