I. Nhóm Route Công khai / Nội bộ (Không yêu cầu đăng nhập JWT)
GET /api/orders/job-posts (JobPostController@index): Lấy danh sách các tin tuyển dụng (dành cho việc tìm kiếm công việc nói chung).
GET /api/orders/job-posts/{id} (JobPostController@show): Xem chi tiết một tin tuyển công việc qua ID.
GET /api/orders/reviews/helper/{helperId} (ReviewController@helperReviews): Lấy toàn bộ danh sách đánh giá/nhận xét của một người giúp việc (Helper) cụ thể.
POST /api/orders/internal/bookings/update-payment-status (BookingController@updatePaymentStatus): API nội bộ gọi từ service khác (ví dụ: payment-service) để cập nhật trạng thái thanh toán của đơn đặt lịch (Booking).
POST /api/orders/internal/job-posts/update-payment-status (JobPostController@updatePaymentStatus): API nội bộ cập nhật trạng thái thanh toán của tin tuyển dụng.
POST /api/orders/internal/service-review-stats (ReviewController@serviceReviewStats): API nội bộ lấy thống kê đánh giá dịch vụ.
POST /api/orders/internal/reviews-by-helpers (ReviewController@reviewsByHelpers): API nội bộ lấy thống kê tất cả các đánh giá theo danh sách người giúp việc.
II. Nhóm Route Bảo mật (Yêu cầu đăng nhập - middleware jwt.auth)
Các route bên dưới đều bắt buộc Token đăng nhập hợp lệ để xác thực người dùng.

1. Dành cho Khách hàng (Customer) - Đặt lịch & Đánh giá dịch vụ
POST /api/orders/bookings (BookingController@store): Khách hàng tạo mới một yêu cầu đặt lịch giúp việc (Booking).
GET /api/orders/bookings (BookingController@myBookings): Xem lịch sử các yêu cầu đặt lịch của cá nhân khách hàng hiện tại.
GET /api/orders/bookings/{id} (BookingController@show): Xem chi tiết một đơn đặt lịch của cá nhân.
PATCH /api/orders/bookings/{id}/cancel (BookingController@cancel): Khách hàng hủy một đơn đặt lịch đã tạo.
POST /api/orders/bookings/{id}/review (BookingController@review): Đăng bài đánh giá trực tiếp cho một đơn đặt lịch đã hoàn thành.
POST /api/orders/reviews (ReviewController@customerCreate): Tạo mới lượt đánh giá độc lập.
PUT /api/orders/reviews/{id} (ReviewController@customerUpdate): Cập nhật/chỉnh sửa nội dung đánh giá của khách hàng.
DELETE /api/orders/reviews/{id} (ReviewController@customerDestroy): Xóa đánh giá của khách hàng.
2. Dành cho Người giúp việc (Helper) - Nhận ca làm việc
GET /api/orders/helper/stats (BookingController@helperStats): Xem thống kê thu nhập, số ca làm, tỉ lệ hoàn thành của Helper hiện tại.
GET /api/orders/helper/bookings (BookingController@helperBookings): Xem danh sách các công việc/ca đặt lịch mà Helper đã nhận hoặc đang phụ trách.
PATCH /api/orders/helper/bookings/{id}/accept (BookingController@accept): Helper xác nhận đồng ý nhận/làm một ca đặt lịch mới.
PATCH /api/orders/helper/bookings/{id}/reject (BookingController@reject): Helper từ chối nhận làm một ca đặt lịch.
POST /api/orders/helper/bookings/{id}/start-moving (BookingController@startMoving): Helper báo cáo bắt đầu di chuyển đến địa điểm làm việc.
POST /api/orders/helper/bookings/{id}/checkin (BookingController@checkin): Helper check-in (báo cáo đã đến nơi và bắt đầu ca làm việc).
POST /api/orders/helper/bookings/{id}/checkout (BookingController@checkout): Helper check-out (báo cáo hoàn thành ca làm và gửi kết quả công việc).
3. Dành cho Khách hàng (Customer) - Quản lý đăng tuyển dụng tự do (Job Posts)
GET /api/orders/my/job-posts (JobPostController@myPosts): Khách hàng tự xem lại các tin tuyển dụng do chính mình đã đăng.
POST /api/orders/job-posts (JobPostController@store): Khách hàng tạo mới tin tuyển dụng một công việc tự do.
PUT /api/orders/job-posts/{id} (JobPostController@update): Khách hàng chỉnh sửa thông tin tin tuyển dụng.
PATCH /api/orders/job-posts/{id}/close (JobPostController@close): Đóng tin tuyển dụng (ngừng nhận đơn ứng tuyển).
DELETE /api/orders/job-posts/{id} (JobPostController@destroy): Khách hàng xóa hoàn toàn tin tuyển dụng đó.
GET /api/orders/job-posts/{id}/applications (JobPostController@applications): Xem danh sách các đơn ứng tuyển của các Helper nộp vào tin tuyển dụng này.
PATCH /api/orders/job-posts/{id}/select/{helperId} (JobPostController@selectHelper): Lựa chọn một Helper phù hợp để giao việc.
PATCH /api/orders/job-posts/{id}/reject/{helperId} (JobPostController@rejectHelper): Từ chối đơn ứng tuyển của một Helper.
POST /api/orders/job-posts/{id}/review (JobPostController@review): Tạo đánh giá cho công việc tuyển dụng tự do sau khi hoàn thành.
4. Dành cho Người giúp việc (Helper) - Tìm và Ứng tuyển công việc tự do (Job Posts)
GET /api/orders/helper/job-posts (JobPostController@helperBrowse): Helper duyệt danh sách các tin tuyển dụng tự do đang tìm người làm trên hệ thống.
POST /api/orders/helper/job-posts/{id}/apply (JobPostController@apply): Helper nộp đơn ứng tuyển vào một tin tuyển dụng đang mở.
GET /api/orders/helper/applications (JobPostController@myApplications): Helper xem lại lịch sử các tin tuyển dụng mà mình đã nộp đơn ứng tuyển.
PATCH /api/orders/helper/applications/{id}/withdraw (JobPostController@withdraw): Helper rút đơn ứng tuyển (hủy ứng tuyển).
PATCH /api/orders/helper/applications/{id}/respond (JobPostController@respondToSelection): Phản hồi (đồng ý/từ chối) khi được Khách hàng chọn nhận việc.
5. Báo cáo vi phạm (Reports)
POST /api/orders/reports (ReportController@store): Người dùng gửi/tạo báo cáo vi phạm liên quan đến ca làm việc hoặc hành vi không đúng của Helper/Khách hàng.
III. Nhóm Route dành cho Quản trị viên (Admin) - Tiền tố /api/orders/admin
Nhóm này cung cấp các tính năng quản trị, quản lý và kiểm duyệt dữ liệu hệ thống:

GET /api/orders/admin/dashboard-overview (BookingController@dashboardOverview): Lấy dữ liệu tổng quan hoạt động đặt lịch để vẽ biểu đồ, tính doanh thu.
Kiểm duyệt Đơn đặt lịch (Bookings)
GET /api/orders/admin/bookings (BookingController@adminIndex): Xem tất cả các đơn đặt lịch của toàn bộ hệ thống.
GET /api/orders/admin/bookings/{id} (BookingController@adminShow): Xem chi tiết một đơn đặt lịch bất kỳ.
PATCH /api/orders/admin/bookings/{id}/status (BookingController@adminUpdateStatus): Admin cập nhật/thay đổi trạng thái của đơn đặt lịch.
Kiểm duyệt Tin tuyển dụng (Job Posts) (Yêu cầu quyền truy cập cụ thể - middleware permission):
GET /api/orders/admin/job-posts (JobPostController@adminIndex): Lấy danh sách tin tuyển dụng.
GET /api/orders/admin/job-posts/{id} (JobPostController@adminShow): Xem chi tiết dữ liệu một tin tuyển dụng.
PATCH /api/orders/admin/job-posts/{id}/status (JobPostController@adminUpdateStatus): Điều chỉnh/cập nhật trạng thái duyệt tin tuyển dụng.
DELETE /api/orders/admin/job-posts/{id} (JobPostController@adminDestroy): Admin xóa tin tuyển dụng.
Kiểm duyệt Đánh giá (Reviews) (Yêu cầu quyền truy cập cụ thể):
GET /api/orders/admin/reviews (ReviewController@adminIndex): Xem danh sách toàn bộ các đánh giá/nhận xét trên hệ thống.
POST /api/orders/admin/reviews (ReviewController@adminCreate): Admin chủ động tạo đánh giá/góp ý của hệ thống.
PUT /api/orders/admin/reviews/{id} (ReviewController@adminUpdate): Admin chỉnh sửa nội dung đánh giá của người dùng (khi chứa từ ngữ nhạy cảm...).
DELETE /api/orders/admin/reviews/{id} (ReviewController@adminDestroy): Admin xóa các đánh giá không hợp lệ.
Quản lý Báo cáo vi phạm (Reports)
GET /api/orders/admin/reports (ReportController@adminIndex): Xem tất cả các báo cáo vi phạm do người dùng gửi lên.
DELETE /api/orders/admin/reports/bulk-delete (ReportController@bulkDestroy): Xóa đồng loạt nhiều báo cáo vi phạm.
GET /api/orders/admin/reports/{id} (ReportController@adminShow): Xem chi tiết một báo cáo vi phạm.
PATCH /api/orders/admin/reports/{id}/process (ReportController@process): Xử lý/ghi nhận phương án xử lý cho báo cáo vi phạm.
DELETE /api/orders/admin/reports/{id} (ReportController@d








Dưới đây là chi tiết chức năng của các route trong file 

identity-service\routes\api.php
. Service này hoạt động như một dịch vụ trung tâm quản trị tài khoản, phân quyền, quản lý nội dung công cộng (Tin tức, Banner), hệ thống liên hệ và tri thức chatbot.

I. Nhóm Route Công khai (Public - Không yêu cầu Token)
1. Xác thực tài khoản (Auth) — Tiền tố auth
POST /api/auth/login (AuthController@login): Đăng nhập bằng tài khoản (email/mật khẩu) để nhận JWT access token.
POST /api/auth/register (AuthController@register): Đăng ký tài khoản người dùng mới.
POST /api/auth/google (AuthController@googleLogin): Đăng nhập nhanh qua tài khoản Google OAuth.
POST /api/auth/forgot-password (AuthController@forgotPassword): Gửi yêu cầu đặt lại mật khẩu (gửi mã OTP qua email).
POST /api/auth/verify-otp (AuthController@verifyOtp): Xác thực mã OTP để đổi mật khẩu.
POST /api/auth/reset-password (AuthController@resetPassword): Tiến hành đặt lại mật khẩu mới.
POST /api/auth/refresh (AuthController@refreshToken): Làm mới (refresh) token JWT.
2. Dữ liệu công cộng & Tiện ích khác
GET /api/banners (BannerController@getActiveBanners): Lấy danh sách các Ảnh quảng cáo (banners) đang hoạt động hiển thị phía client/homepage.
GET /api/news (NewsController@index): Lấy danh sách tin tức công khai.
GET /api/news/{slug} (NewsController@show): Xem chi tiết một bài viết tin tức dựa vào link thân thiện (slug).
POST /api/contacts (ContactController@store): Cho phép khách hàng gửi thông tin liên hệ/góp ý từ form liên hệ.
POST /api/chatbot/query (ChatbotController@query): API công khai để gửi câu hỏi của người dùng và nhận câu trả lời tương ứng từ Chatbot (sử dụng Normalized Keywords & RAG).
II. Nhóm API Nội bộ (Internal APIs - Trực thuộc Docker Network)
Các API này phục vụ giao tiếp chéo giữa các microservice phía backend (ví dụ: order-service, payment-service request thông tin người dùng mà không cần đi qua Gateway public).

POST /api/internal/notifications (NotificationController@createInternal): Tạo thông báo hệ thống nội bộ từ service khác gửi sang.
POST /api/internal/users/by-ids (AuthController@getUsersByIdsInternal): Truy vấn thông tin của danh sách người dùng bằng danh sách ids[].
GET /api/internal/users/search-ids (AuthController@searchUserIds): Lấy danh sách hoặc lọc các User ID hợp lệ.
POST /api/internal/customer/profile-status (CustomerProfileController@getCustomerProfileStatusInternal): Xem nhanh trạng thái thông tin hồ sơ của khách hàng.
III. Nhóm Route Bảo mật (Yêu cầu đăng nhập - middleware auth:api)
Các route bên dưới yêu cầu đính kèm Header Authorization: Bearer <JWT_Token>.

1. Tài khoản cá nhân chung (Me)
POST /api/auth/logout (AuthController@logout): Đăng xuất, vô hiệu hóa Token hiện tại.
GET /api/me (AuthController@me): Lấy thông tin tài khoản hiện tại đang đăng nhập.
GET /api/profile (AuthController@getProfile): Lấy thông tin hồ sơ cá nhân nâng cao của user.
PUT /api/profile (AuthController@updateProfile): Cập nhật thông tin thông tin hồ sơ cá nhân.
POST /api/profile/avatar (AuthController@uploadAvatar): Tải lên / thay đổi ảnh đại diện cá nhân.
2. Hồ sơ & Địa chỉ của Khách hàng — Tiền tố customer
GET /api/customer/profile (CustomerProfileController@getProfile): Khách hàng lấy hồ sơ chi tiết.
PUT /api/customer/profile (CustomerProfileController@updateProfile): Cập nhật thông tin hồ sơ của khách hàng.
GET /api/customer/addresses (CustomerProfileController@listAddresses): Lấy danh sách sổ địa chỉ nhận dịch vụ của khách hàng.
POST /api/customer/addresses (CustomerProfileController@addAddress): Thêm một địa chỉ mới vào sổ địa chỉ.
PUT /api/customer/addresses/{id} (CustomerProfileController@updateAddress): Sửa thông tin địa chỉ đã lưu.
DELETE /api/customer/addresses/{id} (CustomerProfileController@deleteAddress): Xóa một địa chỉ khỏi danh sách.
PATCH /api/customer/addresses/{id}/default (CustomerProfileController@setDefaultAddress): Thiết lập địa chỉ được chọn làm địa chỉ mặc định khi đặt lịch.
3. Hộp thư Thông báo cá nhân — Tiền tố notifications
GET /api/notifications (NotificationController@index): Xem danh sách toàn bộ thông báo cá nhân được nhận.
PATCH /api/notifications/{id}/read (NotificationController@markRead): Đánh dấu đã đọc một thông báo.
PATCH /api/notifications/read-all (NotificationController@markAllRead): Đánh dấu đã đọc tất cả thông báo trong hộp thư.
DELETE /api/notifications/{id} (NotificationController@destroy): Xóa một thông báo cá nhân.
IV. Nhóm Route dành cho Quản trị viên (Admin) — Tiền tố 

admin
Nhóm này chỉ cho phép các tài khoản có vai trò Quản lý/Quản trị viên (middleware 

admin
) truy cập và được kiểm tra chặt chẽ theo các quyền hạn đặc thù (middleware('permission:xxx')).

1. Quản lý Người dùng (Users Management)
GET /api/admin/users: Lấy danh sách bài bản toàn bộ người dùng, hỗ trợ bộ lọc và phân trang.
POST /api/admin/users/by-ids: Lấy thông tin user admin dạng hàng loạt theo ID.
GET /api/admin/users/search-ids: Tìm kiếm hoặc lấy ID người dùng liên quan.
GET /api/admin/users/{id}: Xem thông tin chi tiết của một người dùng thông qua ID.
POST /api/admin/users: Quản trị viên tạo mới tài khoản thành viên (cho nhân viên, cộng tác viên, khách hàng).
POST /api/admin/users/upload: Tải ảnh đại diện cho một người dùng bất kỳ.
PUT /api/admin/users/{id}: Cập nhật thông tin chi tiết một người dùng cụ thể.
PATCH /api/admin/users/{id}/status: Khóa / kích hoạt lại tài khoản của người dùng.
DELETE /api/admin/users/{id}: Xóa một tài khoản người dùng khỏi hệ thống.
POST /api/admin/users/bulk-delete: Xóa hàng loạt người dùng được chọn.
2. Quản lý Giao tiếp & Thông báo (Notifications Management)
GET /api/admin/notifications: Xem lịch sử quản lý thông báo của admin.
POST /api/admin/notifications/send: Gửi thông báo trực tiếp đến một cá nhân cụ thể.
POST /api/admin/notifications/broadcast: Gửi thông báo broad-cast (đồng loạt) tới tất cả người dùng trên toàn hệ thống.
3. Quản lý Banner Quảng cáo (Banners Management)
GET /api/admin/banners: Xem danh sách toàn bộ banners quản lý.
GET /api/admin/banners/{id}: Xem chi tiết một banner.
POST /api/admin/banners: Tạo thiết lập banner quảng cáo mới.
POST /api/admin/banners/upload: Tải ảnh banner quảng cáo lên server lưu trữ.
PUT /api/admin/banners/{id}: Chỉnh sửa thông tin banner.
PATCH /api/admin/banners/{id}/status: Toggle ẩn/hiện trạng thái hoạt động banner.
DELETE /api/admin/banners/{id}: Xóa banner quảng cáo.
4. Quản lý Tin tức (News Management)
GET /api/admin/news: Xem danh sách toàn bộ bài viết tin tức.
POST /api/admin/news: Viết và đăng một bài tin tức mới.
POST /api/admin/news/upload: Tải hình đại diện (thumbnail) bài viết.
PUT /api/admin/news/{id}: Chỉnh sửa nội dung bài tin tức.
PATCH /api/admin/news/{id}/status: Toggle thay đổi trạng thái hiển thị (Xuất bản/Bản nháp).
DELETE /api/admin/news/{id}: Xóa bài viết.
5. Quản lý Phân quyền (Roles & Permissions)
Nhóm Vai trò (Roles):
GET /api/admin/roles: Xem danh sách các vai trò (ví dụ: Admin, Operator, Helper, Customer).
GET /api/admin/roles/{id}: Xem chi tiết một vai trò và các quyền của nó.
POST /api/admin/roles: Tạo mới vai trò.
PUT /api/admin/roles/{id}: Chỉnh sửa vai trò và gán các quyền tương ứng.
DELETE /api/admin/roles/{id}: Xóa vai trò.
Nhóm Quyền hạn (Permissions):
GET /api/admin/permissions: Xem danh sách tất cả các quyền hạn chi tiết trong hệ thống.
GET /api/admin/permissions/{id}: Xem chi tiết một quyền hạn.
POST /api/admin/permissions: Tạo mới quyền hạn.
PUT /api/admin/permissions/{id}: Sửa quyền hạn.
DELETE /api/admin/permissions/{id}: Xóa quyền hạn.
6. Quản lý Nhật ký Hoạt động (Activity Logs Management)
GET /api/admin/activity-logs: Truy vấn và kiểm tra vết lịch sử hoạt động của hệ thống (Ví dụ: ghi nhận ai đã thao tác tác vụ gì nhạy cảm).
DELETE /api/admin/activity-logs/{id}: Xóa một bản ghi nhật ký hoạt động.
DELETE /api/admin/activity-logs-clear: Xóa sạch toàn bộ nhật ký hệ thống đã lưu.
7. Quản lý Liên hệ (Contacts Management)
GET /api/admin/contacts: Xem danh sách các phản ánh, liên hệ từ người dùng gửi lên.
PATCH /api/admin/contacts/{id}/process: Đánh dấu trạng thái xử lý/phản hồi yêu cầu liên hệ.
DELETE /api/admin/contacts/{id}: Xóa thông tin liên hệ.
8. Quản lý Cơ sở tri thức Chatbot (Chatbot Knowledge RAG Management)
GET /api/admin/chatbot-knowledges: Lấy danh sách các bộ tri thức được gán nhãn tags / keywords.
POST /api/admin/chatbot-knowledges: Thêm thủ công một mẫu trả lời cho tri thức chatbot.
PUT /api/admin/chatbot-knowledges/{id}: Chỉnh sửa nội dung tri thức hoặc cụm từ khóa cho một câu trả lời.
DELETE /api/admin/chatbot-knowledges/{id}: Xóa câu trả lời khỏi cơ sở dữ liệu tri thức của chatbot.
POST /api/admin/chatbot-knowledges/import: Import hàng loạt dữ liệu tri thức từ file (ví dụ file CSV / Excel tri thức mẫu).
POST /api/admin/chatbot-knowledges/sync: Đồng bộ dữ liệu tri thức sang chatbot/hệ thống RAG n8n hoặc AI agent ngoài.