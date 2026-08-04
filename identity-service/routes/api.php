<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ChatbotController;

Route::prefix('auth')->group(function () {
  // Đăng nhập bằng Email & Mật khẩu (trả về JWT token và thông tin người dùng)
  Route::post('login',          [AuthController::class, 'login']);
  // Đăng ký tài khoản thành viên mới (Khách hàng hoặc Người giúp việc)
  Route::post('register',       [AuthController::class, 'register']);
  // Đăng nhập/Đăng ký nhanh thông qua tài khoản Google (OAuth2)
  Route::post('google',         [AuthController::class, 'googleLogin']);
  // Gửi mã OTP xác nhận quên mật khẩu qua địa chỉ Email đăng ký
  Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
  // Xác thực mã OTP gửi về Email có chính xác hay không
  Route::post('verify-otp',     [AuthController::class, 'verifyOtp']);
  // Khởi tạo và lưu thiết lập mật khẩu mới sau khi xác thực OTP thành công
  Route::post('reset-password', [AuthController::class, 'resetPassword']);
  // Làm mới lại khoá mã bảo mật JWT khi access token hết hạn
  Route::post('refresh',        [AuthController::class, 'refreshToken']);
});

// Lấy danh sách banner quảng cáo hoạt động công khai chạy slide giới thiệu
Route::get('banners', [BannerController::class, 'getActiveBanners']);

// Tin tức công khai dành cho tất cả mọi người
// Xem danh sách tin tức/bài viết chia sẻ mẹo vặt, dịch vụ
Route::get('news',        [NewsController::class, 'index']);
// Xem chi tiết nội dung một bài viết tin tức dựa trên Slug đường dẫn
Route::get('news/{slug}', [NewsController::class, 'show']);

// Liên hệ, phản hồi từ khách hàng gửi qua form Contact Us ngoài Home page
Route::post('contacts', [ContactController::class, 'store']);

// Gửi câu hỏi/truy vấn trao đổi tư vấn trực tiếp với Chatbot AI
Route::post('chatbot/query', [ChatbotController::class, 'query']);

// ============================================================
//  INTERNAL — API nội bộ phục vụ gọi chéo từ các microservices khác
// ============================================================
// Tạo thông báo hệ thống nội bộ từ service khác gửi sang (Ví dụ: order-service báo lịch hẹn mới)
Route::post('internal/notifications', [NotificationController::class, 'createInternal']);
// Truy vấn thông tin của danh sách người dùng bằng danh sách ids[]
Route::post('internal/users/by-ids',  [AuthController::class, 'getUsersByIdsInternal']);
// Lấy danh sách hoặc lọc các User ID hợp lệ trong hệ thống
Route::get('internal/users/search-ids', [AuthController::class, 'searchUserIds']);
// Xem nhanh trạng thái thông tin hồ sơ của khách hàng
Route::post('internal/customer/profile-status', [CustomerProfileController::class, 'getCustomerProfileStatusInternal']);

// ============================================================
//  AUTHENTICATED — Yêu cầu JWT token xác định danh tính
// ============================================================
Route::middleware('auth:api')->group(function () {

  // Đăng xuất và vô hiệu hóa JWT Token hiện tại
  Route::post('auth/logout',    [AuthController::class, 'logout']);
  // Đọc thông tin cá nhân của tài khoản hiện tại đang đăng nhập
  Route::get('me',              [AuthController::class, 'me']);
  // Xem hồ sơ cá nhân
  Route::get('profile',         [AuthController::class, 'getProfile']);
  // Cập nhật thông tin hồ sơ cá nhân (Họ tên, SĐT, Ngày sinh...)
  Route::put('profile',         [AuthController::class, 'updateProfile']);
  // Thay đổi, upload hình ảnh đại diện cá nhân mới
  Route::post('profile/avatar', [AuthController::class, 'uploadAvatar']);

  // -- Customer Profile & Addresses (role: customer) --
  Route::prefix('customer')->group(function () {
    // Xem chi tiết hồ sơ cá nhân bổ sung của Khách hàng
    Route::get('profile',                      [CustomerProfileController::class, 'getProfile'])->middleware('permission:customer_profile.view');
    // Cập nhật thông tin hồ sơ bổ sung của Khách hàng
    Route::put('profile',                      [CustomerProfileController::class, 'updateProfile'])->middleware('permission:customer_profile.update');
    // Lấy danh sách các địa chỉ (để đặt lịch giúp việc) đã lưu của Khách hàng
    Route::get('addresses',                    [CustomerProfileController::class, 'listAddresses'])->middleware('permission:customer_addresses.view');
    // Lưu thêm một địa chỉ nhận việc mới
    Route::post('addresses',                   [CustomerProfileController::class, 'addAddress'])->middleware('permission:customer_addresses.create');
    // Cập nhật thông tin địa chỉ đã lưu theo ID
    Route::put('addresses/{id}',               [CustomerProfileController::class, 'updateAddress'])->middleware('permission:customer_addresses.update');
    // Xóa địa chỉ khỏi danh mục đã lưu
    Route::delete('addresses/{id}',            [CustomerProfileController::class, 'deleteAddress'])->middleware('permission:customer_addresses.delete');
    // Đặt địa chỉ được chọn làm địa chỉ mặc định để hiển thị khi đặt lịch hẹn
    Route::patch('addresses/{id}/default',     [CustomerProfileController::class, 'setDefaultAddress'])->middleware('permission:customer_addresses.update');
  });

  // -- Notifications (Người nhận xem thông báo cá nhân trên Chuông thông báo) --
  Route::prefix('notifications')->group(function () {
    // Xem danh sách các thông báo cá nhân gửi tới tài khoản đăng nhập (Phân trang)
    Route::get('/',                  [NotificationController::class, 'index'])->middleware('permission:notifications.view');
    // Đánh dấu một thông báo cụ thể là đã đọc bằng ID
    Route::patch('{id}/read',        [NotificationController::class, 'markRead'])->middleware('permission:notifications.view');
    // Đánh dấu tất cả thông báo thuộc tài khoản này là đã đọc
    Route::patch('read-all',         [NotificationController::class, 'markAllRead'])->middleware('permission:notifications.view');
    // Gỡ bỏ thông báo khỏi danh sách chuông
    Route::delete('{id}',            [NotificationController::class, 'destroy'])->middleware('permission:notifications.view');
  });

  // ============================================================
  //  ADMIN & OPERATOR — Quản trị viên và Nhân viên (Áp dụng kiểm tra Quyền hạn)
  // ============================================================
  Route::prefix('admin')->middleware('admin')->group(function () {

    // Users Management (Quản lý toàn bộ tài khoản người dùng)
    // Xem danh sách người dùng trong hệ thống (Hỗ trợ tìm kiếm, lọc theo vai trò)
    Route::get('users',              [AuthController::class, 'getUsers'])->middleware('permission:users.view');
    // Tra cứu danh sách thông tin người dùng hàng loạt theo mảng IDs gửi lên
    Route::post('users/by-ids',      [AuthController::class, 'getUsersByIds'])->middleware('permission:users.view');
    // Lọc và tìm kiếm nhanh các ID người dùng theo từ khóa
    Route::get('users/search-ids',   [AuthController::class, 'searchUserIds'])->middleware('permission:users.view');
    // Xem chi tiết tài khoản của một người dùng theo ID
    Route::get('users/{id}',         [AuthController::class, 'getUser'])->middleware('permission:users.view');
    // Admin tạo tài khoản người dùng mới (Dành cho cấp tài khoản nghiệp vụ, Operator...)
    Route::post('users',             [AuthController::class, 'createUser'])->middleware('permission:users.create');
    // Tải lên ảnh đại diện mới cho tài khoản người dùng cụ thể
    Route::post('users/upload',      [AuthController::class, 'uploadUserAvatar'])->middleware('permission:users.update');
    // Cập nhật thông tin tài khoản người dùng theo ID
    Route::put('users/{id}',         [AuthController::class, 'updateUser'])->middleware('permission:users.update');
    // Bật/Khóa trạng thái hoạt động của tài khoản người dùng (Khóa khi vi phạm chính sách)
    Route::patch('users/{id}/status', [AuthController::class, 'toggleUserStatus'])->middleware('permission:users.lock');
    // Xóa vĩnh viễn tài khoản người dùng ra khỏi CSDL
    Route::delete('users/{id}',      [AuthController::class, 'deleteUser'])->middleware('permission:users.delete');
    // Xóa hàng loạt các tài khoản người dùng được chọn
    Route::post('users/bulk-delete', [AuthController::class, 'bulkDeleteUsers'])->middleware('permission:users.delete');

    // Notifications Management (Quản lý thông báo hệ thống)
    // Admin lấy danh sách toàn bộ các thông báo đã gửi lên hệ thống
    Route::get('notifications',            [NotificationController::class, 'adminIndex'])->middleware('permission:notifications.view');
    // Gửi thông báo đích danh tới một hoặc một tập hợp nhiều tài khoản người dùng cụ thể
    Route::post('notifications/send',      [NotificationController::class, 'send'])->middleware('permission:notifications.send');
    // Gửi thông báo hàng loạt (Broadcast) cho một nhóm đối tượng lớn theo Vai Trò (Ví dụ: gửi toàn bộ Helper)
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast'])->middleware('permission:notifications.send');

    // Banners Management (Quản lý Banner quảng cáo)
    // Admin xem danh sách tất cả các banner (gồm cả banner đang khóa)
    Route::get('banners',                  [BannerController::class, 'adminIndex'])->middleware('permission:banners.view');
    // Xem chi tiết thuộc tính cấu hình của một banner cụ thể
    Route::get('banners/{id}',             [BannerController::class, 'show'])->middleware('permission:banners.view');
    // Thêm mới một banner quảng cáo
    Route::post('banners',                 [BannerController::class, 'store'])->middleware('permission:banners.create');
    // Thực hiện tải hình ảnh banner quảng cáo lên thư mục uploads
    Route::post('banners/upload',          [BannerController::class, 'uploadImage'])->middleware('permission:banners.update');
    // Chỉnh sửa thông tin banner quảng cáo theo ID
    Route::put('banners/{id}',             [BannerController::class, 'update'])->middleware('permission:banners.update');
    // Thay đổi nhanh trạng thái Bật/Tắt hiển thị của banner ngoài view
    Route::patch('banners/{id}/status',     [BannerController::class, 'toggleStatus'])->middleware('permission:banners.update');
    // Xóa vĩnh viễn banner quảng cáo ra khỏi hệ thống
    Route::delete('banners/{id}',          [BannerController::class, 'destroy'])->middleware('permission:banners.delete');

    // News Management (Quản lý viết tin tức)
    // Xem danh sách tất cả các bài viết tin tức (bao gồm các bài viết trạng thái Nháp)
    Route::get('news',                     [NewsController::class, 'adminIndex'])->middleware('permission:news.view');
    // Viết và tạo một bài viết tin tức mới
    Route::post('news',                    [NewsController::class, 'store'])->middleware('permission:news.create');
    // Tải ảnh bìa (thumbnail) đại diện của bài đăng tin tức lên hệ thống
    Route::post('news/upload',             [NewsController::class, 'uploadImage'])->middleware('permission:news.update');
    // Chỉnh sửa nội dung chi tiết bài viết tin tức
    Route::put('news/{id}',               [NewsController::class, 'update'])->middleware('permission:news.update');
    // Thay đổi trạng thái Xuất bản / Thu hồi bản thảo hiển thị của tin tức
    Route::patch('news/{id}/status',       [NewsController::class, 'toggleStatus'])->middleware('permission:news.update');
    // Xóa bài viết tin tức ra khỏi hệ thống
    Route::delete('news/{id}',             [NewsController::class, 'destroy'])->middleware('permission:news.delete');

    // Roles Management (Quản lý vai trò bảo mật)
    // Xem danh sách tất cả các nhóm vai trò trong hệ thống (ADMIN, OPERATOR, HELPER, CUSTOMER)
    Route::get('roles',                    [RoleController::class, 'index'])->middleware('permission:roles.view');
    // Xem chi tiết một nhóm vai trò kèm theo danh sách các quyền hạn được tích hợp
    Route::get('roles/{id}',               [RoleController::class, 'show'])->middleware('permission:roles.view');
    // Thêm mới một nhóm vai trò nghiệp vụ mới
    Route::post('roles',                   [RoleController::class, 'store'])->middleware('permission:roles.create');
    // Cập nhật/Sửa đổi cấu hình quyền hạn gán cho vai trò (Đồng bộ danh sách permissions ID)
    Route::put('roles/{id}',               [RoleController::class, 'update'])->middleware('permission:roles.update');
    // Xóa bỏ vai trò (Bảo vệ giữ nghiêm ngặt các nhóm vai trò cốt lõi của hệ thống)
    Route::delete('roles/{id}',            [RoleController::class, 'destroy'])->middleware('permission:roles.delete');

    // Permissions Management (Định nghĩa quyền cơ sở)
    // Lấy danh sách toàn bộ các quyền hạn cơ sở phục vụ vẽ Ma Trận Phân Quyền
    Route::get('permissions',              [PermissionController::class, 'index'])->middleware('permission:permissions.view');
    // Xem chi tiết mô tả của một quyền hạn
    Route::get('permissions/{id}',         [PermissionController::class, 'show'])->middleware('permission:permissions.view');
    // Định nghĩa thêm một quyền hạn mới tương ứng với module nghiệp vụ mới
    Route::post('permissions',             [PermissionController::class, 'store'])->middleware('permission:permissions.create');
    // Cập nhật thông số mô tả của quyền hạn hệ thống
    Route::put('permissions/{id}',         [PermissionController::class, 'update'])->middleware('permission:permissions.update');
    // Xóa vĩnh viễn định nghĩa quyền ra khỏi cơ sở ma trận hệ thống
    Route::delete('permissions/{id}',      [PermissionController::class, 'destroy'])->middleware('permission:permissions.delete');

    // Activity Logs Management (Giám sát nhật ký thao tác)
    // Truy vấn lịch sử hoạt động, thao tác dữ liệu (Audit log) của toàn bộ nhân viên/người dùng
    Route::get('activity-logs',            [ActivityLogController::class, 'index'])->middleware('permission:activity_logs.view');
    // Xóa một hàng ghi nhận nhật ký thao tác cụ thể
    Route::delete('activity-logs/{id}',    [ActivityLogController::class, 'destroy'])->middleware('permission:activity_logs.view');
    // Xóa sạch toàn bộ dữ liệu lịch sử thao tác của hệ thống (Giải phóng dung lượng bảng logs)
    Route::delete('activity-logs-clear',   [ActivityLogController::class, 'clear'])->middleware('permission:activity_logs.view');

    // Contacts Management (Xử lý khiếu nại liên hệ)
    // Lấy danh sách phản hồi liên hệ, góp ý gửi từ form Contact Us ngoài Home page
    Route::get('contacts',               [ContactController::class, 'index'])->middleware('permission:contacts.view');
    // Nhân viên tiếp nhận xử lý phản hồi và đánh dấu đã giải quyết (Ghi nhận tài khoản xử lý)
    Route::patch('contacts/{id}/process', [ContactController::class, 'process'])->middleware('permission:contacts.process');
    // Xóa thông tin phản hồi liên hệ spam hoặc rác khỏi table
    Route::delete('contacts/{id}',       [ContactController::class, 'destroy'])->middleware('permission:contacts.delete');

    // Chatbot Knowledge RAG Management (Quản lý tri thức Chatbot AI)
    // Quản trị viên xem danh sách dữ liệu tri thức của chatbot cục bộ (hỗ trợ phân trang, tìm kiếm)
    Route::get('chatbot-knowledges',         [ChatbotController::class, 'adminIndex'])->middleware('permission:chatbot_knowledge.view');
    // Tạo mới một cặp câu hỏi - câu trả lời tri thức (kèm từ khoá)
    Route::post('chatbot-knowledges',        [ChatbotController::class, 'adminStore'])->middleware('permission:chatbot_knowledge.create');
    // Chỉnh sửa nội dung chi tiết của bản ghi tri thức theo ID
    Route::put('chatbot-knowledges/{id}',    [ChatbotController::class, 'adminUpdate'])->middleware('permission:chatbot_knowledge.update');
    // Xóa bản ghi tri thức ra khỏi cơ sở học của Chatbot
    Route::delete('chatbot-knowledges/{id}', [ChatbotController::class, 'adminDestroy'])->middleware('permission:chatbot_knowledge.delete');
    // Nạp hàng loạt dữ liệu tri thức mới thông qua tệp tin Excel/CSV theo mẫu
    Route::post('chatbot-knowledges/import', [ChatbotController::class, 'adminImport'])->middleware('permission:chatbot_knowledge.create');
    // Đồng bộ toàn bộ cơ sở tri thức cục bộ sang Vector Database thông qua n8n phục vụ RAG
    Route::post('chatbot-knowledges/sync',   [ChatbotController::class, 'adminSync'])->middleware('permission:chatbot_knowledge.update');
  });
});
