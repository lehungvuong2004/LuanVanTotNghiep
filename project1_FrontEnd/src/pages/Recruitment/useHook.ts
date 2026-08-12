import { useToast } from "../../contexts/ToastContext";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";
import { getCategoriesApi, type ServiceCategory } from "../../api/servicesApi/services";
import {
  getJobPostsApi,
  applyJobPostApi,
  getMyApplicationsApi,
  getMyJobPostsApi,
  deleteJobPostApi,
  updateJobPostApi,
  getApplicationsApi,
  selectHelperApi,
  rejectHelperApi,
  getHelperPublicProfileApi,
  type JobPost,
} from "../../api/jobPostsApi/jobPosts";

import { SALARY_OPTS, isSalaryMatchingRange } from "../../components/PriceFilter/useHook";
export { SALARY_OPTS };

export const URGENCY_OPTS = [
  { value: "all", label: "Tất cả" },
  { value: "urgent", label: "Cần gấp" },
  { value: "normal", label: "Bình thường" },
];

const formatWorkingTime = (timeStr: string | null, t: any) => {
  if (!timeStr) return "";
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
  const match = timeStr.match(isoRegex);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return t("workingTimeFormat", { hours, minutes, day, month, year });
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

export interface Applicant {
  id: number;
  job_post_id: number;
  helper_id: number;
  status: "pending" | "accepted" | "rejected";
  proposed_price?: number | null;
  created_at: string;
  helper: {
    id: number;
    full_name: string;
    avatar: string | null;
    phone: string;
    email: string;
  } | null;
  profile?: {
    bio: string;
    experience_year: number;
    rating_avg: number;
    total_reviews: number;
    gender: string;
    skills: { service?: { name: string } }[];
    workingAreas: { district: string; city: string }[];
  } | null;
}

export interface MyJobPost extends JobPost {
  applicantCount?: number;
}

export const useRecruitment = () => {
  const { t } = useTranslation();
  const [nowTime] = useState(() => Date.now());
  const [allJobs, setAllJobs] = useState<JobPost[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<(number | string)[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get("tab");

  // Customer tab: "browse" (default) or "my-posts"
  const [activeTab, setActiveTab] = useState<"browse" | "my-posts">("browse");

  useEffect(() => {
    Promise.resolve().then(() => {
      if (tabParam === "my-posts") {
        setActiveTab("my-posts");
      } else {
        setActiveTab("browse");
      }
    });
  }, [tabParam]);

  // Customer: My job posts
  const [myJobPosts, setMyJobPosts] = useState<MyJobPost[]>([]);
  const [myPostsLoading, setMyPostsLoading] = useState(false);

  // Customer: Applications modal
  const [selectedJobPost, setSelectedJobPost] = useState<MyJobPost | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  // Helper profile drawer
  const [helperProfile, setHelperProfile] = useState<any>(null);
  const [helperProfileLoading, setHelperProfileLoading] = useState(false);
  const [showHelperProfile, setShowHelperProfile] = useState(false);

  // Customer: Edit job post modal
  const [editingJobPost, setEditingJobPost] = useState<JobPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catRes = await getCategoriesApi();
        setCategories(catRes.data || []);

        const jobRes = await getJobPostsApi({ limit: 1000 });
        setAllJobs(jobRes.data.data || []);

        // Load applications if user is a helper
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role_id === 3) {
            const appRes = await getMyApplicationsApi({ limit: 1000 });
            const appIds = (appRes.data?.data || []).map((app: any) => app.job_post_id);
            setAppliedJobIds(appIds);
          }
        }
      } catch {
        // console.error("Error loading recruitment data:");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8005";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        socket.emit("join", user.id);
      }
    });

    socket.on("new_job_post", (newJob: JobPost) => {
      setAllJobs((prev) => {
        if (prev.some((j) => j.id === newJob.id)) return prev;
        return [newJob, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Reset page when any filter changes
  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentPage(1);
    });
  }, [selectedCategories, selectedSalary, selectedUrgency, searchQuery]);

  const getRelativeTime = (createdAtStr: string | null | undefined) => {
    const fallback = t("Đăng 1 phút trước");
    if (!createdAtStr) return fallback;
    try {
      const normalized = createdAtStr.includes("Z") || createdAtStr.includes("+") ? createdAtStr : createdAtStr.replace(" ", "T") + "Z";
      const created = new Date(normalized);
      if (isNaN(created.getTime())) {
        return fallback;
      }
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) {
        return fallback;
      }
      if (diffMins < 60) {
        return t("Đăng {{count}} phút trước", { count: diffMins });
      }
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return t("Đăng {{count}} giờ trước", { count: diffHours });
      }
      const diffDays = Math.floor(diffHours / 24);
      return t("Đăng {{count}} ngày trước", { count: diffDays });
    } catch {
      return fallback;
    }
  };

  // Filter logic
  const filteredJobs = allJobs.filter((job) => {
    // 0. Hide expired jobs (expired_at has passed)
    if (job.expired_at && new Date(job.expired_at).getTime() < nowTime) return false;

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
      if (!isSalaryMatchingRange(salaryNum, selectedSalary)) return false;
    }

    // 4. Urgency filter
    if (selectedUrgency !== "all") {
      let urgencyLevel: "urgent" | "normal" | "long" = "long";
      if (job.expired_at) {
        const daysLeft = (new Date(job.expired_at).getTime() - nowTime) / 86400000;
        if (daysLeft <= 4) urgencyLevel = "urgent";
        else if (daysLeft <= 7) urgencyLevel = "normal";
        else urgencyLevel = "long";
      }
      if (urgencyLevel !== selectedUrgency) return false;
    }

    return true;
  });

  // Map backend JobPost schema to component JobItem schema
  const mappedJobs: JobItem[] = filteredJobs.map((job) => {
    let customCategory: string | null = null;
    let customServicesList: string[] = [];
    let displayDescription = job.description || "";
    let durationPrefix = "";

    if (job.description) {
      const durationMatch = displayDescription.match(/^\[Thời lượng:\s*([^\]]+)\]\s*/);
      if (durationMatch) {
        durationPrefix = `[Thời lượng: ${durationMatch[1]}] `;
        displayDescription = displayDescription.replace(/^\[Thời lượng:\s*[^\]]+\]\s*/, "");
      }

      const catMatch = displayDescription.match(/^\[Danh mục:\s*([^\]]+)\]\s*/);
      if (catMatch) {
       customCategory = catMatch[1];
       displayDescription = displayDescription.replace(/^\[Danh mục:\s*[^\]]+\]\s*/, "");
      }

      const serviceMatch = displayDescription.match(/^\[Dịch vụ:\s*([^\]]+)\]\s*/);
      if (serviceMatch) {
       customServicesList = serviceMatch[1]
         .split(",")
         .map((s) => s.trim())
         .filter(Boolean);
       displayDescription = displayDescription.replace(/^\[Dịch vụ:\s*[^\]]+\]\s*/, "");
      }

      displayDescription = durationPrefix + displayDescription;
    }

    const matchedCat = categories.find((c) => c.id === job.category_id);
    const catName = customCategory || matchedCat?.name || "Khác";
    const categoryIcon = matchedCat?.icon || "material-symbols:work-outline";

    let categoryColor = "text-teal-500";
    if (job.category_id) {
      const colors = ["text-amber-500", "text-violet-500", "text-sky-500", "text-emerald-500", "text-rose-500"];
      categoryColor = colors[job.category_id % colors.length];
    }

    let urgencyLevel: "urgent" | "normal" | "long" = "long";
    if (job.expired_at) {
      const daysLeft = (new Date(job.expired_at).getTime() - nowTime) / 86400000;
      if (daysLeft <= 4) urgencyLevel = "urgent";
      else if (daysLeft <= 7) urgencyLevel = "normal";
      else urgencyLevel = "long";
    }
    const isUrgent = urgencyLevel === "urgent";

    const standardServices = job.services?.map((s) => s.name) || [];
    const combinedServices = [...standardServices, ...customServicesList];

    return {
      id: job.id,
      title: job.title,
      category: catName,
      categoryIcon,
      categoryColor,
      isUrgent,
      urgencyLevel,
      salary: job.salary ? `${Number(job.salary).toLocaleString()} ${t("VNĐ/dịch vụ")}` : t("Thỏa thuận"),
      location: job.district || job.city ? `${job.district}, ${job.city}` : t("Việt Nam"),
      postedTime: getRelativeTime(job.created_at || new Date().toISOString()),
      createdAt: job.created_at || new Date().toISOString(),
      expirationDate: job.expired_at || null,
      workingTime: formatWorkingTime(job.working_time, t),
      services: combinedServices,
      description: displayDescription,
    };
  });

  // Sorting logic
  const sortedJobs = [...mappedJobs].sort((a, b) => {
    return b.id - a.id;
  });

  const totalItems = sortedJobs.length;

  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const { showToast } = useToast();

  const applyJob = async (jobId: number) => {
    try {
      const targetedJob = allJobs.find((j) => j.id === jobId);
      if (targetedJob?.expired_at && new Date(targetedJob.expired_at).getTime() < Date.now()) {
        showToast("error", t("Ứng tuyển thất bại"), t("Công việc này đã hết hạn ứng tuyển."));
        return;
      }
      const res = await applyJobPostApi(jobId);
      showToast("success", t("Ứng tuyển thành công"), res.message || t("Hồ sơ ứng tuyển của bạn đã được gửi thành công."));
      setAppliedJobIds((prev) => [...prev, jobId]);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || t("Đã xảy ra lỗi khi ứng tuyển.");
      showToast("error", t("Ứng tuyển thất bại"), errMsg);
      if (errMsg.includes("hoàn thiện hồ sơ") || errMsg.includes("số điện thoại")) {
        setTimeout(() => {
          navigate("/ho-so");
        }, 3000);
      }
    }
  };

  // ─── Customer: fetch my job posts ───────────────────────
  const fetchMyJobPosts = useCallback(async () => {
    setMyPostsLoading(true);
    try {
      const res = await getMyJobPostsApi({ limit: 100 });
      setMyJobPosts(res.data.data || []);
    } catch {
      // console.error("Error loading my job posts:");
    } finally {
      setMyPostsLoading(false);
    }
  }, []);

  // Load my posts when tab switches to "my-posts"
  useEffect(() => {
    if (activeTab === "my-posts") {
      Promise.resolve().then(() => {
        fetchMyJobPosts();
      });
    }
  }, [activeTab, fetchMyJobPosts]);

  // ─── View helper profile detail ─────────────────────────
  const viewHelperProfile = useCallback(async (helperId: number) => {
    setHelperProfileLoading(true);
    setShowHelperProfile(true);
    setHelperProfile(null);
    try {
      const res = await getHelperPublicProfileApi(helperId);
      setHelperProfile(res.data);
    } catch {
      // console.error("Error loading helper profile:");
    } finally {
      setHelperProfileLoading(false);
    }
  }, []);

  const closeHelperProfile = useCallback(() => {
    setShowHelperProfile(false);
    setHelperProfile(null);
  }, []);

  // ─── Customer: open applications for a job post ─────────
  const openApplications = useCallback(async (jobPost: MyJobPost) => {
    setSelectedJobPost(jobPost);
    setShowApplicationsModal(true);
    setApplicantsLoading(true);
    setApplicants([]);
    try {
      const res = await getApplicationsApi(jobPost.id);
      const apps: Applicant[] = res.data || [];

      const enriched = await Promise.all(
        apps.map(async (app) => {
          try {
            const profileRes = await getHelperPublicProfileApi(app.helper_id);
            return { ...app, profile: profileRes.data || null };
          } catch {
            return { ...app, profile: null };
          }
        }),
      );
      setApplicants(enriched);
    } catch {
      // console.error("Error loading applications:");
    } finally {
      setApplicantsLoading(false);
    }
  }, []);

  const closeApplications = useCallback(() => {
    setShowApplicationsModal(false);
    setSelectedJobPost(null);
    setApplicants([]);
  }, []);

  // ─── Customer: accept a helper ──────────────────────────
  const acceptHelper = useCallback(
    async (jobPostId: number, helperId: number) => {
      if (!window.confirm(t("Bạn có chắc chắn muốn chọn người giúp việc này? Tất cả đơn ứng tuyển khác sẽ bị từ chối."))) return;
      try {
        await selectHelperApi(jobPostId, helperId);
        showToast("success", t("Chấp nhận thành công"), t("Người giúp việc đã được chọn. Đang chờ người giúp việc đồng ý nhận việc."));
        if (selectedJobPost) {
          openApplications(selectedJobPost);
        }
        fetchMyJobPosts();
      } catch (err: any) {
        showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể chấp nhận người giúp việc."));
      }
    },
    [selectedJobPost, openApplications, fetchMyJobPosts, t, showToast],
  );

  // ─── Customer: reject a helper ──────────────────────────
  const rejectHelper = useCallback(
    async (jobPostId: number, helperId: number) => {
      if (!window.confirm(t("Bạn có chắc chắn muốn từ chối người giúp việc này không?"))) return;
      try {
        await rejectHelperApi(jobPostId, helperId);
        showToast("success", t("Từ chối thành công"), t("Người giúp việc đã bị từ chối."));
        // Re-fetch applications list to update UI status
        if (selectedJobPost) {
          openApplications(selectedJobPost);
        }
        fetchMyJobPosts();
      } catch (err: any) {
        showToast("error", t("Lỗi"), err.response?.data?.message || t("Không thể từ chối người giúp việc."));
      }
    },
    [selectedJobPost, openApplications, fetchMyJobPosts, t, showToast],
  );

  const deleteJobPost = useCallback(
    async (id: number) => {
      if (!window.confirm(t("Bạn có chắc chắn muốn xóa bài đăng tuyển dụng này không? Hành động này không thể hoàn tác."))) return;
      try {
        await deleteJobPostApi(id);
        showToast("success", t("Xóa thành công"), t("Bài đăng tuyển dụng đã được xóa thành công."));
        fetchMyJobPosts();
      } catch (err: any) {
        showToast("error", t("Xóa thất bại"), err.response?.data?.message || t("Không thể xóa bài đăng tuyển dụng."));
      }
    },
    [fetchMyJobPosts, t, showToast],
  );

  const openEditJobPost = useCallback((post: JobPost) => {
    setEditingJobPost(post);
    setIsEditModalOpen(true);
  }, []);

  const closeEditJobPost = useCallback(() => {
    setEditingJobPost(null);
    setIsEditModalOpen(false);
  }, []);

  const updateJobPost = useCallback(
    async (id: number, data: any) => {
      try {
        await updateJobPostApi(id, data);
        showToast("success", t("Cập nhật thành công"), t("Bài đăng tuyển dụng đã được cập nhật thành công."));
        closeEditJobPost();
        fetchMyJobPosts();
        const jobRes = await getJobPostsApi({ limit: 1000 });
        setAllJobs(jobRes.data.data || []);
      } catch (err: any) {
        showToast("error", t("Cập nhật thất bại"), err.response?.data?.message || t("Không thể cập nhật bài đăng tuyển dụng."));
      }
    },
    [closeEditJobPost, fetchMyJobPosts, t, showToast],
  );

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSalary("all");
    setSelectedUrgency("all");
    setSearchQuery("");
  };

  return {
    // Browse tab
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
    clearFilters,
    categories,
    isLoading,

    applyJob,
    appliedJobIds,
    activeTab,
    setActiveTab,
    myJobPosts,
    myPostsLoading,
    fetchMyJobPosts,
    selectedJobPost,
    applicants,
    applicantsLoading,
    showApplicationsModal,
    openApplications,
    closeApplications,
    acceptHelper,
    rejectHelper,
    deleteJobPost,
    editingJobPost,
    isEditModalOpen,
    openEditJobPost,
    closeEditJobPost,
    updateJobPost,
    helperProfile,
    helperProfileLoading,
    showHelperProfile,
    viewHelperProfile,
    closeHelperProfile,
  };
};
