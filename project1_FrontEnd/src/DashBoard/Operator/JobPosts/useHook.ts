import { useToast } from "../../../contexts/ToastContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { adminGetJobPostsApi, adminGetJobPostDetailApi, adminUpdateJobPostStatusApi, adminDeleteJobPostApi, type JobPost } from "../../../api/jobPostsApi/jobPosts";
import { getUsersAdmin, type User } from "../../../api/usersApi/users";

export const useApplicationReview = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const { showToast } = useToast();

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
      // console.error("Failed to load users map:", error);
    }
  }, []);

  // Fetch job posts
  const fetchJobPosts = useCallback(async () => {
    setLoading(true);
    setSelectedIds([]);
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
  const handleUpdateStatus = async (postId: number, newStatus: "open" | "closed" | "pending" | "rejected", note?: string) => {
    setActionLoading(true);
    try {
      await adminUpdateJobPostStatusApi(postId, newStatus, note);

      let statusLabel = "";
      if (newStatus === "open") statusLabel = "Hoạt động (Open)";
      else if (newStatus === "closed") statusLabel = "Đã đóng (Closed)";
      else if (newStatus === "pending") statusLabel = "Đang chờ duyệt (Pending)";
      else if (newStatus === "rejected") statusLabel = "Từ chối (Rejected)";

      showToast("success", "Cập nhật thành công", `Đã chuyển trạng thái bài đăng sang: ${statusLabel}`);

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

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === filteredJobPosts.length ? [] : filteredJobPosts.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} bài tuyển dụng đã chọn?`)) return;

    setActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await adminDeleteJobPostApi(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast("success", "Xóa thành công", `Đã xóa vĩnh viễn ${successCount} bài tuyển dụng.`);
    }
    if (failCount > 0) {
      showToast("error", "Lỗi xóa", `Thất bại khi xóa ${failCount} bài tuyển dụng.`);
    }

    setSelectedIds([]);
    await fetchJobPosts();
    setActionLoading(false);
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
    itemsPerPage,
    selectedIds,
    toggleSelectOne,
    toggleSelectAll,
    clearSelection,
    handleBulkDelete,
  };
};
