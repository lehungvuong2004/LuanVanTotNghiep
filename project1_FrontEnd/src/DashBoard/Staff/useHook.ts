import { useState, useEffect, useCallback, useRef } from "react";
import {
  getJobPostsApi,
  getMyApplicationsApi,
  applyJobPostApi,
  withdrawApplicationApi,
  respondToSelectionApi,
  type JobPost,
} from "../../api/jobPostsApi/jobPosts";
import type { ToastProps } from "../../types/Toast";

export interface JobApplicationItem {
  id: number;
  job_post_id: number;
  helper_id: number;
  message: string | null;
  proposed_price: number | null;
  status: "pending" | "confirmed" | "rejected" | "paid" | "withdrawn" | "completed";
  created_at: string;
  job_post?: JobPost;
}

export const useStaffRecruitment = () => {
  const [activeTab, setActiveTab] = useState<"browse" | "my-applications">("browse");
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters for browse
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [minSalary, setMinSalary] = useState<number | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;

  // Modals
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [selectedApp, setSelectedApp] = useState<JobApplicationItem | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyProposedPrice, setApplyProposedPrice] = useState<number | undefined>(undefined);

  // Toast
  const [toast, setToast] = useState<ToastProps | null>(null);
  const timerRef = useRef<any>(null);

  const showToast = useCallback((type: ToastProps["type"], title: string, message?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ type, title, message });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Fetch job posts
  const fetchJobPosts = useCallback(async () => {
    if (activeTab !== "browse") return;
    setLoading(true);
    try {
      const response = await getJobPostsApi({
        page: currentPage,
        limit: itemsPerPage,
        city: cityFilter || undefined,
        district: districtFilter || undefined,
        min_salary: minSalary || undefined,
      });
      const data = response.data;
      setJobPosts(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách bài đăng tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, cityFilter, districtFilter, minSalary, showToast]);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    if (activeTab !== "my-applications") return;
    setLoading(true);
    try {
      const response = await getMyApplicationsApi({
        limit: 100, // Show all applications for helper to simplify
      });
      setApplications(response.data?.data || []);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách đơn ứng tuyển.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    if (activeTab === "browse") {
      fetchJobPosts();
    } else {
      fetchApplications();
    }
  }, [activeTab, fetchJobPosts, fetchApplications]);

  // Handle Apply Job
  const handleApply = async (postId: number) => {
    setActionLoading(true);
    try {
      await applyJobPostApi(postId, {
        message: applyMessage || undefined,
        proposed_price: applyProposedPrice || undefined,
      });
      showToast("success", "Ứng tuyển thành công", "Hồ sơ của bạn đã được gửi tới khách hàng.");
      setIsApplyOpen(false);
      setApplyMessage("");
      setApplyProposedPrice(undefined);
      setSelectedPost(null);
      await fetchJobPosts();
    } catch (error: any) {
      showToast("error", "Lỗi ứng tuyển", error.response?.data?.message || "Ứng tuyển thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Withdraw application
  const handleWithdraw = async (appId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này không?")) return;
    setActionLoading(true);
    try {
      await withdrawApplicationApi(appId);
      showToast("success", "Rút hồ sơ thành công", "Hồ sơ ứng tuyển của bạn đã được rút.");
      await fetchApplications();
    } catch (error: any) {
      showToast("error", "Lỗi xử lý", error.response?.data?.message || "Rút hồ sơ thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Respond to Selection (accept or reject)
  const handleRespond = async (appId: number, action: "accept" | "reject") => {
    const confirmMsg = action === "accept" 
      ? "Đồng ý nhận công việc này và tạo lịch đặt làm việc?" 
      : "Từ chối nhận công việc này?";
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const response = await respondToSelectionApi(appId, action);
      if (action === "accept") {
        showToast("success", "Chấp nhận thành công", response.message || "Bạn đã chấp nhận công việc thành công.");
      } else {
        showToast("success", "Từ chối thành công", "Bạn đã từ chối nhận công việc này.");
      }
      setSelectedApp(null);
      await fetchApplications();
    } catch (error: any) {
      showToast("error", "Lỗi xử lý", error.response?.data?.message || "Xử lý yêu cầu thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab: (tab: "browse" | "my-applications") => {
      setActiveTab(tab);
      setCurrentPage(1);
    },
    jobPosts: jobPosts.filter(post => 
      !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    applications,
    loading,
    actionLoading,
    searchQuery,
    setSearchQuery,
    cityFilter,
    setCityFilter,
    districtFilter,
    setDistrictFilter,
    minSalary,
    setMinSalary,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    selectedPost,
    setSelectedPost,
    selectedApp,
    setSelectedApp,
    isApplyOpen,
    setIsApplyOpen,
    applyMessage,
    setApplyMessage,
    applyProposedPrice,
    setApplyProposedPrice,
    handleApply,
    handleWithdraw,
    handleRespond,
    toast,
    setToast,
  };
};
