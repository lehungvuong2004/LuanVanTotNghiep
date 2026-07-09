import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { adminGetJobPostsApi, adminGetJobPostDetailApi, adminUpdateJobPostStatusApi, type JobPost } from "../../../api/jobPostsApi/jobPosts";
import { getUsersAdmin, type User } from "../../../api/users";
import type { ToastProps } from "../../../types/Toast";

export const useApplicationReview = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Job post detail modal state
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast notifications
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

  // Fetch users map (to resolve customer & helper names)
  const fetchUsersMap = useCallback(async () => {
    try {
      const response = await getUsersAdmin({ limit: 500 });
      const usersList = response.data?.data || [];
      const map: Record<number, User> = {};
      usersList.forEach((u) => {
        map[u.id] = u;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to load users map:", error);
    }
  }, []);

  // Fetch job posts
  const fetchJobPosts = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "All Statuses" ? selectedStatus.toLowerCase() : undefined;
      const response = await adminGetJobPostsApi({
        page: currentPage,
        limit: itemsPerPage,
        status: statusParam,
      });

      const resData = response.data;
      setJobPosts(resData?.data || []);
      setTotalPages(resData?.last_page || 1);
      setTotalItems(resData?.total || 0);
    } catch (error: any) {
      showToast("error", "Lỗi tải dữ liệu", error.response?.data?.message || "Không thể tải danh sách bài tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, itemsPerPage, showToast]);

  // Load initial data
  useEffect(() => {
    let active = true;
    const init = async () => {
      await fetchUsersMap();
      if (active) {
        await fetchJobPosts();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchUsersMap, fetchJobPosts]);

  // Filter job posts locally by search query
  const filteredJobPosts = useMemo(() => {
    return jobPosts.filter((post) => {
      if (!searchQuery) return true;
      const customer = usersMap[post.customer_id];
      const query = searchQuery.toLowerCase();

      const matchesTitle = post.title?.toLowerCase().includes(query) || false;
      const matchesCustomer = customer?.full_name?.toLowerCase().includes(query) || false;
      const matchesDescription = post.description?.toLowerCase().includes(query) || false;

      return matchesTitle || matchesCustomer || matchesDescription;
    });
  }, [jobPosts, searchQuery, usersMap]);

  // Fetch job post detail
  const handleOpenDetail = async (post: JobPost) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await adminGetJobPostDetailApi(post.id);
      setSelectedPost(response.data || post);
    } catch (error: any) {
      showToast("error", "Lỗi tải chi tiết", error.response?.data?.message || "Không thể tải chi tiết bài đăng.");
      setSelectedPost(post);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
    setIsDetailOpen(false);
  };

  // Update status (approve, reject/pending, close)
  const handleUpdateStatus = async (postId: number, newStatus: "open" | "closed" | "pending") => {
    setActionLoading(true);
    try {
      await adminUpdateJobPostStatusApi(postId, newStatus);
      showToast("success", "Cập nhật thành công", `Đã chuyển trạng thái bài đăng sang: ${newStatus === "open" ? "Hoạt động (Open)" : newStatus === "closed" ? "Đã đóng (Closed)" : "Đang chờ duyệt (Pending)"}`);
      
      // Refresh details if currently open
      if (selectedPost && selectedPost.id === postId) {
        const response = await adminGetJobPostDetailApi(postId);
        setSelectedPost(response.data || selectedPost);
      }
      
      await fetchJobPosts();
    } catch (error: any) {
      showToast("error", "Lỗi cập nhật", error.response?.data?.message || "Không thể cập nhật trạng thái bài đăng.");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = totalItems;
    const open = jobPosts.filter((p) => p.status === "open").length;
    const pending = jobPosts.filter((p) => p.status === "pending").length;
    const closed = jobPosts.filter((p) => p.status === "closed").length;

    return {
      total,
      open,
      pending,
      closed,
    };
  }, [jobPosts, totalItems]);

  return {
    jobPosts: filteredJobPosts,
    usersMap,
    loading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus: (status: string) => {
      setSelectedStatus(status);
      setCurrentPage(1);
    },
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    selectedPost,
    isDetailOpen,
    detailLoading,
    actionLoading,
    handleOpenDetail,
    handleCloseDetail,
    handleUpdateStatus,
    metrics,
    toast,
    setToast,
    itemsPerPage,
  };
};
