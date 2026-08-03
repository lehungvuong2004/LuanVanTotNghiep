import axiosInstance from "../axios";
import type { Service } from "../servicesApi/services";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface JobPost {
  id: number;
  customer_id: number;
  category_id: number | null;
  selected_helper_id: number | null;
  title: string;
  description: string | null;
  salary: number | string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  working_time: string | null;
  status: "open" | "closed" | "pending";
  expired_at: string | null;
  created_at: string;
  services?: Service[];
  active_applications_count?: number;
}

export interface CreateJobPostRequest {
  title: string;
  description?: string;
  category_id?: number;
  salary?: number;
  address?: string;
  district?: string;
  city?: string;
  working_time?: string;
  expired_at?: string;
  service_ids?: number[];
}

export interface GetJobPostsParams {
  city?: string;
  district?: string;
  category_id?: number | string;
  min_salary?: number;
  max_salary?: number;
  limit?: number;
  page?: number;
}

export interface JobPostsPaginatedResponse {
  data: {
    data: JobPost[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

export interface JobPostDetailResponse {
  data: JobPost;
}

export interface JobPostMutateResponse {
  message: string;
  data: JobPost;
}

export interface SimpleMessageResponse {
  message: string;
}

export interface GetMyJobPostsParams {
  status?: string;
  limit?: number;
  page?: number;
}

export interface ApplyJobRequest {
  message?: string;
  proposed_price?: number;
}

export interface ApplyJobResponse {
  message: string;
  data: any;
}

export interface GetMyApplicationsParams {
  status?: string;
  limit?: number;
  page?: number;
}

export interface GetMyApplicationsResponse {
  data: {
    data: any[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

export interface GetApplicationsResponse {
  data: any[];
}

export interface HelperPublicProfileResponse {
  data: any;
}

export interface RespondToSelectionResponse {
  message: string;
  booking_id?: number;
}

export interface AdminGetJobPostsParams {
  status?: string;
  city?: string;
  customer_id?: number | string;
  limit?: number;
  page?: number;
}

export interface AdminJobPostDetailResponse {
  data: JobPost & {
    applications?: any[];
    reviews?: any[];
    reports?: any[];
  };
}

export interface AdminUpdateJobPostStatusRequest {
  status: "open" | "closed" | "pending" | "rejected";
  note?: string;
}
// Lấy danh sách bài đăng tuyển dụng công khai (hỗ trợ lọc theo khu vực, lương, danh mục)
export const getJobPostsApi = async (params?: GetJobPostsParams): Promise<JobPostsPaginatedResponse> => {
  const response = await axiosInstance.get<JobPostsPaginatedResponse>("/orders/job-posts", {
    params,
  });
  return response.data;
};

// Lấy chi tiết thông tin một bài đăng tuyển dụng ( bị dư)
// export const getJobPostDetailApi = async (id: number): Promise<JobPostDetailResponse> => {
//   const response = await axiosInstance.get<JobPostDetailResponse>(`/orders/job-posts/${id}`);
//   return response.data;
// };

// Khách hàng tạo bài đăng tuyển dụng mới
export const createJobPostApi = async (data: CreateJobPostRequest): Promise<JobPostMutateResponse> => {
  const response = await axiosInstance.post<JobPostMutateResponse>("/orders/job-posts", data);
  return response.data;
};

// Khách hàng xóa bài đăng tuyển dụng của mình
export const deleteJobPostApi = async (id: number): Promise<SimpleMessageResponse> => {
  const response = await axiosInstance.delete<SimpleMessageResponse>(`/orders/job-posts/${id}`);
  return response.data;
};

// Khách hàng cập nhật nội dung bài đăng tuyển dụng
export const updateJobPostApi = async (id: number, data: CreateJobPostRequest): Promise<JobPostMutateResponse> => {
  const response = await axiosInstance.put<JobPostMutateResponse>(`/orders/job-posts/${id}`, data);
  return response.data;
};

// Khách hàng lấy danh sách bài đăng tuyển dụng của chính họ (hỗ trợ phân trang)
export const getMyJobPostsApi = async (params?: GetMyJobPostsParams): Promise<JobPostsPaginatedResponse> => {
  const response = await axiosInstance.get<JobPostsPaginatedResponse>("/orders/my/job-posts", {
    params,
  });
  return response.data;
};

// Người giúp việc (Helper) gửi đơn ứng tuyển vào bài đăng tuyển dụng của khách hàng
export const applyJobPostApi = async (id: number, data?: ApplyJobRequest): Promise<ApplyJobResponse> => {
  const response = await axiosInstance.post<ApplyJobResponse>(`/orders/helper/job-posts/${id}/apply`, data);
  return response.data;
};

// Người giúp việc xem danh sách lịch sử các công việc đã ứng tuyển
export const getMyApplicationsApi = async (params?: GetMyApplicationsParams): Promise<GetMyApplicationsResponse> => {
  const response = await axiosInstance.get<GetMyApplicationsResponse>("/orders/helper/applications", {
    params,
  });
  return response.data;
};

// Khách hàng xem danh sách các ứng viên helper đã ứng tuyển vào bài đăng của mình
export const getApplicationsApi = async (jobPostId: number): Promise<GetApplicationsResponse> => {
  const response = await axiosInstance.get<GetApplicationsResponse>(`/orders/job-posts/${jobPostId}/applications`);
  return response.data;
};

// Khách hàng chấp nhận lựa chọn một ứng viên Helper làm việc
export const selectHelperApi = async (jobPostId: number, helperId: number): Promise<ApplyJobResponse> => {
  const response = await axiosInstance.patch<ApplyJobResponse>(`/orders/job-posts/${jobPostId}/select/${helperId}`);
  return response.data;
};

// Khách hàng từ chối hồ sơ ứng tuyển của một Helper tin tuyển dụng
export const rejectHelperApi = async (jobPostId: number, helperId: number): Promise<ApplyJobResponse> => {
  const response = await axiosInstance.patch<ApplyJobResponse>(`/orders/job-posts/${jobPostId}/reject/${helperId}`);
  return response.data;
};

// Xem hồ sơ công khai của Người giúp việc (kinh nghiệm, kỹ năng, đánh giá sao...)
export const getHelperPublicProfileApi = async (id: number): Promise<HelperPublicProfileResponse> => {
  const response = await axiosInstance.get<HelperPublicProfileResponse>(`/providers/helpers/${id}`);
  return response.data;
};

// Người giúp việc Phản hồi (Đồng ý hoặc từ chối) yêu cầu nhận việc từ khách hàng
export const respondToSelectionApi = async (applicationId: number, action: "accept" | "reject"): Promise<RespondToSelectionResponse> => {
  const response = await axiosInstance.patch<RespondToSelectionResponse>(`/orders/helper/applications/${applicationId}/respond`, { action });
  return response.data;
};

// Người giúp việc rút đơn ứng tuyển trước khi xét duyệt
export const withdrawApplicationApi = async (applicationId: number): Promise<SimpleMessageResponse> => {
  const response = await axiosInstance.patch<SimpleMessageResponse>(`/orders/helper/applications/${applicationId}/withdraw`);
  return response.data;
};

// Admin/Operator lấy danh sách toàn bộ các bài đăng tuyển dụng trên hệ thống (để phê duyệt/quản lý)
export const adminGetJobPostsApi = async (params?: AdminGetJobPostsParams): Promise<JobPostsPaginatedResponse> => {
  const response = await axiosInstance.get<JobPostsPaginatedResponse>("/orders/admin/job-posts", {
    params,
  });
  return response.data;
};

// Admin/Operator kiểm tra chi tiết bài đăng (gồm hồ sơ ứng tuyển, các báo cáo xấu liên quan)
export const adminGetJobPostDetailApi = async (id: number): Promise<AdminJobPostDetailResponse> => {
  const response = await axiosInstance.get<any>(`/orders/admin/job-posts/${id}`);
  return response.data;
};

// Admin/Operator phê duyệt hoặc từ chối bài đăng tuyển dụng của khách hàng
export const adminUpdateJobPostStatusApi = async (id: number, status: "open" | "closed" | "pending" | "rejected", note?: string): Promise<JobPostMutateResponse> => {
  const response = await axiosInstance.patch<JobPostMutateResponse>(`/orders/admin/job-posts/${id}/status`, {
    status,
    note,
  });
  return response.data;
};

// Admin xóa vĩnh viễn bài đăng tuyển dụng bị vi phạm ra khỏi hệ thống
export const adminDeleteJobPostApi = async (id: number): Promise<SimpleMessageResponse> => {
  const response = await axiosInstance.delete<SimpleMessageResponse>(`/orders/admin/job-posts/${id}`);
  return response.data;
};

