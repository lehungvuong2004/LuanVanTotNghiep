<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HelperController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\AdminProviderController;

Route::prefix('providers')->group(function () {

  // Tìm kiếm & lọc danh sách Người giúp việc công khai (có lọc theo khu vực, dịch vụ, đánh giá)
  Route::get('helpers',          [HelperController::class, 'publicList']);
  // Xem chi tiết hồ sơ công khai của một Người giúp việc cụ thể
  Route::get('helpers/{id}',     [HelperController::class, 'publicShow']);
  // Kiểm tra đầy đủ các mục thông tin bắt buộc trong hồ sơ cá nhân.
  Route::get('helpers/{id}/status-check', [HelperController::class, 'profileStatusCheck']);
  // Lấy danh sách ID người dùng của các Helper đã đăng ký thành công hồ sơ ( API nội bộ) 
  Route::get('helper-user-ids',  [HelperController::class, 'getHelperUserIds']);
  // Trích xuất danh sách tất cả các tỉnh thành/quận huyện được hệ thống hỗ trợ ( bộ lọc dịch vụ)
  Route::get('regions',          [HelperController::class, 'getRegions']);

  // Internal — API nội bộ được gọi chéo từ order-service (cập nhật rating trung bình khi có review mới)
  Route::post('internal/update-helper-rating', [HelperController::class, 'updateHelperRating']);

  // Danh mục & Dịch vụ con
  // Lấy danh sách tất cả các danh mục lớn (ví dụ: Giúp việc nhà, Nấu ăn, Dọn dẹp)
  Route::get('service-categories',      [ServiceController::class, 'listCategories']);
  // Xem chi tiết một danh mục dịch vụ cụ thể
  Route::get('service-categories/{id}', [ServiceController::class, 'showCategory']);
  // Trả về các dịch vụ chi tiết thô để làm dữ liệu checkbox tuyển dụng (Trang "Đăng bài tuyển dụng" /dang-bai-tuyen)
  Route::get('services',               [ServiceController::class, 'listServices']);
  // Lấy danh sách dịch vụ con được bổ sung các thông số thống kê nâng cao (nội dung render trong card)
  Route::get('services/enriched',      [ServiceController::class, 'listServicesEnriched']);
  // Xem chi tiết dịch vụ cụ thể theo ID
  Route::get('services/{id}',          [ServiceController::class, 'showService']);
  // Tìm kiếm những Người giúp việc có kỹ năng thuộc về một dịch vụ cụ thể( load nhiều helper có chung dịch vụ)
  Route::get('services/{id}/helpers',  [ServiceController::class, 'serviceHelpers']);

  // ============================================================
  //  AUTHENTICATED — Yêu cầu token đăng nhập (JWT Token)
  // ============================================================
  Route::middleware('jwt.auth')->group(function () {

    // -------------------------------------------------------------
    //  HELPER PROFILE MANAGEMENT — Người giúp việc quản lý hồ sơ bản thân
    // -------------------------------------------------------------
    Route::prefix('helper')->group(function () {
      // Xem thống kê lịch trình làm việc và tổng số doanh thu của tôi trên trang chủ Dashboard
      Route::get('dashboard-stats',      [HelperController::class, 'dashboardStats']);
      // Lấy thông tin hồ sơ chi tiết hiện tại của tôi (Người giúp việc đang đăng nhập)
      Route::get('profile',              [HelperController::class, 'myProfile']);
      // Tạo mới hồ sơ cá nhân Người giúp việc (Lần đầu đăng ký)
      Route::post('profile',             [HelperController::class, 'createProfile']);
      // Cập nhật/chỉnh sửa thông tin hồ sơ cá nhân
      Route::put('profile',              [HelperController::class, 'updateProfile']);

      // Skills (Kỹ năng nghiệp vụ)
      // Liệt kê danh sách các dịch vụ con mà tôi đăng ký nhận làm việc
      Route::get('skills',               [HelperController::class, 'listSkills']);
      // Đăng ký thêm một kỹ năng dịch vụ mới
      Route::post('skills',              [HelperController::class, 'addSkill']);
      // Hủy đăng ký tiếp nhận công việc của dịch vụ cụ thể
      Route::delete('skills/{serviceId}', [HelperController::class, 'removeSkill']);

      // Working Areas (Địa bàn làm việc)
      // Liệt kê danh sách các Quận/Huyện/Khu vực mà tôi đăng ký nhận việc đi làm
      Route::get('working-areas',        [HelperController::class, 'listWorkingAreas']);
      // Đăng ký thêm các khu vực quận/huyện mới có thể nhận lịch
      Route::post('working-areas',       [HelperController::class, 'addWorkingArea']);
      // Xóa bỏ một khu vực không còn nhận lịch làm việc nữa
      Route::delete('working-areas/{id}', [HelperController::class, 'removeWorkingArea']);

      // Availability (Lịch rảnh nhận việc trong tuần)
      // Xem danh sách các khung giờ rảnh rỗi tôi đăng ký đi làm trong tuần
      Route::get('availability',         [HelperController::class, 'listAvailability']);
      // Đăng ký thêm một khung giờ rảnh rỗi đơn lẻ
      Route::post('availability',        [HelperController::class, 'addAvailability']);
      // Đăng ký lịch rảnh hoạt động hàng loạt (Bulk insert các khung thời gian)
      Route::post('availability/bulk',   [HelperController::class, 'bulkAvailability']);
      // Dọn dẹp/Xóa bỏ toàn bộ lịch biểu rảnh rỗi đã đăng ký của bản thân
      Route::delete('availability',      [HelperController::class, 'clearAllAvailability']);
      // Xóa bỏ một khung giờ rảnh rỗi cụ thể theo ID
      Route::delete('availability/{id}', [HelperController::class, 'removeAvailability']);

      // Verification (Hồ sơ xác minh căn cước)
      // Nộp tài liệu xác minh (CCCD mặt trước/sau, ảnh chân dung, sơ yếu lý lịch) để chờ duyệt
      Route::post('verification',        [HelperController::class, 'submitVerification']);
      // Xem trạng thái duyệt hồ sơ xác thực hiện tại của bản thân
      Route::get('verification',         [HelperController::class, 'myVerificationStatus']);
    });

    // -------------------------------------------------------------
    //  CUSTOMER FAVORITES — Khách hàng quản lý danh sách Helper yêu thích
    // -------------------------------------------------------------
    Route::prefix('favorites')->group(function () {
      // Lấy danh sách tất cả những Người giúp việc đã được khách hàng này thêm vào yêu thích
      Route::get('/',                [FavoriteController::class, 'index']);
      // Thêm một Người giúp việc vào danh sách yêu thích
      Route::post('{helperId}',      [FavoriteController::class, 'store']);
      // Xóa Người giúp việc ra khỏi danh sách yêu thích
      Route::delete('{helperId}',    [FavoriteController::class, 'destroy']);
      // Kiểm tra nhanh xem người giúp việc này đã nằm trong mục ưu tiên/yêu thích chưa
      Route::get('{helperId}/check', [FavoriteController::class, 'check']);
    });

    // -------------------------------------------------------------
    //  ADMIN + OPERATOR — Nghiệp vụ Quản trị viên và Nhân viên vận hành
    // -------------------------------------------------------------
    Route::prefix('admin')->group(function () {

      // Helpers Management (Quản lý hồ sơ người giúp việc)
      // Lấy danh sách quản lý tất cả hồ sơ người giúp việc (chờ duyệt, đã duyệt, bị từ chối)
      Route::get('helpers',               [AdminProviderController::class, 'listHelpers'])->middleware('permission:helper_profile.verify');
      // Xem báo cáo số liệu thống kê chung về các helper (Số lượng đang hoạt động, chờ duyệt)
      Route::get('helpers/stats',         [AdminProviderController::class, 'stats'])->middleware('permission:helper_profile.verify');
      // Xem chi tiết hồ sơ xác minh (ảnh cccd, lí lịch) của 1 helper để kiểm định
      Route::get('helpers/{id}',          [AdminProviderController::class, 'showHelper'])->middleware('permission:helper_profile.verify');
      // Duyệt hoặc Từ chối cấp quyền hoạt động dựa trên hồ sơ xác định của Helper
      Route::patch('helpers/{id}/verify', [AdminProviderController::class, 'verifyHelper'])->middleware('permission:helper_profile.verify');
      // Bật/khóa nhanh trạng thái hoạt động của một Người giúp việc
      Route::patch('helpers/{id}/status', [AdminProviderController::class, 'toggleHelperStatus']);
      // Xóa hồ sơ Người giúp việc ra khỏi hệ thống
      Route::delete('helpers/{id}',       [AdminProviderController::class, 'deleteHelper'])->middleware('permission:helper_profile.delete');
      // Xóa hàng loạt danh sách hồ sơ người giúp việc được chọn
      Route::post('helpers/bulk-delete',  [AdminProviderController::class, 'bulkDeleteHelpers'])->middleware('permission:helper_profile.delete');

      // Service Categories (Quản lý Danh mục Dịch vụ)
      // Admin lấy danh sách phân trang các danh mục dịch vụ lớn
      Route::get('service-categories',         [ServiceController::class, 'adminListCategories'])->middleware('permission:categories.view');
      // Tạo mới một danh mục dịch vụ
      Route::post('service-categories',        [ServiceController::class, 'createCategory'])->middleware('permission:categories.create');
      // Cập nhật thông tin chi tiết một danh mục dịch vụ
      Route::put('service-categories/{id}',    [ServiceController::class, 'updateCategory'])->middleware('permission:categories.update');
      // Xóa một danh mục dịch vụ
      Route::delete('service-categories/{id}', [ServiceController::class, 'deleteCategory'])->middleware('permission:categories.delete');

      // Services (Quản lý Dịch vụ con chi tiết)
      // Lấy danh sách dịch vụ phổ biến nhất (phổ dụng theo người dùng)
      Route::get('services/popular',  [ServiceController::class, 'popularServices'])->middleware('permission:services.view');
      // Admin lấy danh sách phân trang các dịch vụ con chi tiết
      Route::get('services',          [ServiceController::class, 'adminListServices'])->middleware('permission:services.view');
      // Tạo mới một dịch vụ chi tiết (tên dọn dẹp, mô tả, đơn giá, thời lượng)
      Route::post('services',         [ServiceController::class, 'createService'])->middleware('permission:services.create');
      // Tải hình ảnh thu nhỏ/hình nền của dịch vụ chi tiết lên thư mục public/uploads/services
      Route::post('services/upload',  [ServiceController::class, 'uploadImage']);
      // Chỉnh sửa thông tin chi tiết dịch vụ con
      Route::put('services/{id}',     [ServiceController::class, 'updateService']);
      // Xóa dịch vụ con ra khỏi trang chủ
      Route::delete('services/{id}',  [ServiceController::class, 'deleteService'])->middleware('permission:services.delete');
    });
  });
});
