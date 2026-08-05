<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\JobPostController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;

Route::prefix('orders')->group(function () {
  // xem danh sách các tin đăng (tuyển dụng ) giúp việc ngoài trang chủ
  Route::get('job-posts',             [JobPostController::class, 'index']);
  // Xem nội dung chi tiết của một tin đăng tuyển dụng (History)
  Route::get('job-posts/{id}',        [JobPostController::class, 'show']);
  // Xem toàn bộ đánh giá, nhận xét của khách hàng đối với một người giúp việc ( /dich-vu/1)
  Route::get('reviews/helper/{helperId}', [ReviewController::class, 'helperReviews']);

  // Internal — Cổng nội bộ đồng bộ trạng thái thanh toán đơn đặt dịch vụ (từ payment-service gọi sang)
  Route::post('internal/bookings/update-payment-status', [BookingController::class, 'updatePaymentStatus']);
  // Internal — Cổng nội bộ đồng bộ trạng thái thanh toán tin đăng tuyển giúp việc (từ payment-service gọi sang)
  Route::post('internal/job-posts/update-payment-status', [JobPostController::class, 'updatePaymentStatus']);

  // Internal — Thu thập và tính toán thống kê số lượng đánh giá, số sao trung bình của dịch vụ con
  Route::post('internal/service-review-stats', [ReviewController::class, 'serviceReviewStats']);
  // Internal — Lấy nhanh danh sách phản hồi/đánh giá hàng loạt theo list IDs Helper
  Route::post('internal/reviews-by-helpers', [ReviewController::class, 'reviewsByHelpers']);
  // Internal — Lấy danh sách lịch bận của helpers để kiểm tra chéo ca rảnh/đặt trùng ca
  Route::post('internal/helpers-busy-bookings', [BookingController::class, 'helpersBusyBookings']);
  // Internal — Lấy thống kê số lượng khách hàng và lượt đặt lịch của từng dịch vụ
  Route::get('internal/service-usage-stats', [BookingController::class, 'serviceUsageStats']);

  // ============================================================
  //  AUTHENTICATED — Yêu cầu JWT token xác thực thông tin
  // ============================================================
  Route::middleware('jwt.auth')->group(function () {

    // -------------------------------------------------------------
    //  CUSTOMER ACTIONS — Nghiệp vụ dành riêng cho Khách hàng
    // -------------------------------------------------------------
    // là dùng cho nghiệp vụ Đặt dịch vụ nhanh trực tiếp (ví dụ khách hàng đặt lịch dọn nhà ngay lập tức).
    Route::post('bookings',                      [BookingController::class, 'store']);
    // Xem danh sách các lịch hẹn giúp việc mà khách hàng này đã đặt
    Route::get('bookings',                       [BookingController::class, 'myBookings']);
    // Xem chi tiết toàn bộ tiến trình của một đơn đặt lịch cụ thể bằng ID đơn hàng.
    Route::get('bookings/{id}',                  [BookingController::class, 'show']);
    // Khách hàng gửi yêu cầu hủy đơn đặt lịch (kèm theo lý do)
    Route::patch('bookings/{id}/cancel',         [BookingController::class, 'cancel']);
    // Đánh giá nhanh trực tiếp cho một đơn đặt lịch giúp việc sau khi kết thúc công việc
    Route::post('bookings/{id}/review',          [BookingController::class, 'review']);
    
    // Đánh giá độc lập
    // Gửi phản hồi, chấm điểm đánh giá độc lập
    Route::post('reviews',                       [ReviewController::class, 'customerCreate']);
    // Sửa đổi nội dung bình luận, số sao đánh giá
    Route::put('reviews/{id}',                   [ReviewController::class, 'customerUpdate']);
    // Xóa phản hồi/đánh giá
    Route::delete('reviews/{id}',                [ReviewController::class, 'customerDestroy']);

    // -------------------------------------------------------------
    //  HELPER ACTIONS — Nghiệp vụ dành riêng cho Người giúp việc
    // -------------------------------------------------------------
    // Xem thống kê tỷ lệ hoàn thành công việc, số đơn làm trong tuần/tháng của Helper
    Route::get('helper/stats',                   [BookingController::class, 'helperStats']);
    // Liệt kê danh sách các lịch hẹn được hệ thống phân bổ cho Helper này (/lich-su-dat-lich )
    Route::get('helper/bookings',                [BookingController::class, 'helperBookings']);
    // Chấp nhận tiếp nhận đơn đặt lịch giúp việc được giao
    Route::patch('helper/bookings/{id}/accept',  [BookingController::class, 'accept']);
    // Từ chối đơn đặt lịch được phân công (Yêu cầu lưu kèm lý do)
    Route::patch('helper/bookings/{id}/reject',  [BookingController::class, 'reject']);
    // Báo trạng thái bắt đầu di chuyển đến địa chỉ nhà của khách hàng
    Route::post('helper/bookings/{id}/start-moving', [BookingController::class, 'startMoving']);
    // Check-in: Khai báo bắt đầu làm việc tại nhà khách hàng (cập nhật vị trí GPS/thời gian)
    Route::post('helper/bookings/{id}/checkin',  [BookingController::class, 'checkin']);
    // Check-out: Báo hoàn tất công việc (xác nhận giờ về, chụp ảnh nghiệm thu)
    Route::post('helper/bookings/{id}/checkout', [BookingController::class, 'checkout']);

    // -------------------------------------------------------------
    //  JOB POSTS — Hoạt động đăng tin tuyển dụng / Nhận việc
    // -------------------------------------------------------------

    // Customer (Khách đăng tin)
    // Xem danh sách tin tuyển dụng giúp việc riêng của khách hàng hiện tại
    Route::get('my/job-posts',                              [JobPostController::class, 'myPosts']);
    // Đăng một tin tuyển dụng tìm người giúp việc mới (nêu rõ yêu cầu, mức lương, khu vực)
    Route::post('job-posts',                                [JobPostController::class, 'store']);
    // Cập nhật lại thông tin tin đăng tuyển (Chỉ được sửa khi chưa có helper nào đăng ký)
    Route::put('job-posts/{id}',                            [JobPostController::class, 'update']);
    // Đóng tin đăng tuyển dụng (ngưng nhận hồ sơ ứng tuyển mới)
    Route::patch('job-posts/{id}/close',                    [JobPostController::class, 'close']);
    // Xóa bỏ tin đăng tuyển dụng ra khỏi hệ thống
    Route::delete('job-posts/{id}',                         [JobPostController::class, 'destroy']);
    // Xem danh sách hồ sơ ứng tuyển của các Người giúp việc cho tin đăng này
    Route::get('job-posts/{id}/applications',               [JobPostController::class, 'applications']);
    // Phê duyệt tuyển dụng một Người giúp việc cụ thể đi làm
    Route::patch('job-posts/{id}/select/{helperId}',        [JobPostController::class, 'selectHelper']);
    // Từ chối hồ sơ ứng tuyển của một Người giúp việc cụ thể
    Route::patch('job-posts/{id}/reject/{helperId}',        [JobPostController::class, 'rejectHelper']);
    // Khách hàng đánh giá chất lượng hoàn thành công việc của helper trúng tuyển
    Route::post('job-posts/{id}/review',                    [JobPostController::class, 'review']);

    // Helper (Người giúp việc tìm việc đăng tuyển)
    // (Private - yêu cầu đăng nhập với tài khoản Helper) Helper duyệt xem các tin tuyển dụng đang cần tìm người hỗ trợ quanh khu vực
    Route::get('helper/job-posts',              [JobPostController::class, 'helperBrowse']);
    // Nộp đơn ứng tuyển làm việc cho một tin tuyển dụng cụ thể
    Route::post('helper/job-posts/{id}/apply',  [JobPostController::class, 'apply']);
    // Lấy lịch sử các tin tuyển dụng mà Helper đã gửi đơn ứng tuyển
    Route::get('helper/applications',           [JobPostController::class, 'myApplications']);
    // Rút hồ sơ ứng tuyển (Hủy đơn khi chưa được duyệt làm), ( nút hủy bên lịch sử ứng tuyển)
    Route::patch('helper/applications/{id}/withdraw', [JobPostController::class, 'withdraw']);
    // Helper phản hồi Chấp nhận hay Từ chối lời mời làm việc sau khi Khách hàng chọn duyệt
    Route::patch('helper/applications/{id}/respond',  [JobPostController::class, 'respondToSelection']);

    // -------------------------------------------------------------
    //  REPORTS — Khiếu nại / Báo cáo vi phạm
    // -------------------------------------------------------------
    // Gửi báo cáo phàn nàn/vi phạm về đối phương (Khách hàng báo cáo Helper/Helper báo cáo Khách hàng)
    Route::post('reports',              [ReportController::class, 'store']);

    // -------------------------------------------------------------
    //  ADMIN & OPERATOR — Quản trị viên và Nhân viên kiểm soát
    // -------------------------------------------------------------
    Route::prefix('admin')->group(function () {

      // Dashboard Overview
      // Tổng hợp thông số doanh số, lượng đặt lịch và biểu đồ phân bố cho màn hình quản trị
      Route::get('dashboard-overview',     [BookingController::class, 'dashboardOverview']);

      // Bookings Management (Quản trị đặt lịch trực tiếp) (OPERATOR) http://localhost:5173/admin/dashboard
      // Admin lấy danh sách toàn bộ các lịch đặt và lọc theo trạng thái
      Route::get('bookings',               [BookingController::class, 'adminIndex']);
      // Xem chi tiết quy trình di chuyển và thực tế của 1 đơn đặt lịch giúp việc
      Route::get('bookings/{id}',          [BookingController::class, 'adminShow']);
      // Thủ công thay đổi trạng thái làm việc (Can thiệp khi xảy ra tranh chấp/sửa lỗi)
      Route::patch('bookings/{id}/status', [BookingController::class, 'adminUpdateStatus']);

      // Job Posts Management (Quản trị tin tuyển dụng)
      // Lấy danh sách toàn bộ các tin tuyển dụng giúp việc trên hệ thống
      Route::get('job-posts',               [JobPostController::class, 'adminIndex'])->middleware('permission:job_posts.view');
      // Xem chi tiết tin tuyển dụng dưới quyền quản trị
      Route::get('job-posts/{id}',          [JobPostController::class, 'adminShow'])->middleware('permission:job_posts.view');
      // Phê duyệt cấp phép đăng tin hoặc từ chối bài đăng lừa đảo ( trạng thái pending, approved, rejected)
      Route::patch('job-posts/{id}/status', [JobPostController::class, 'adminUpdateStatus'])->middleware('permission:job_posts.approve');
      // Xóa bỏ bài đăng ra khỏi hệ thống tuyển dụng
      Route::delete('job-posts/{id}',       [JobPostController::class, 'adminDestroy'])->middleware('permission:job_posts.delete');

      // Reviews Management (Giám sát đánh giá)
      // Xem danh sách toàn bộ các bài đánh giá, bình luận trong hệ thống
      Route::get('reviews',                 [ReviewController::class, 'adminIndex'])->middleware('permission:reviews.view');
      // Thêm đánh giá bổ sung cho hệ thống
      Route::post('reviews',                [ReviewController::class, 'adminCreate'])->middleware('permission:reviews.create');
      // Cập nhật thông tin đánh giá
      Route::put('reviews/{id}',            [ReviewController::class, 'adminUpdate'])->middleware('permission:reviews.update');
      // Gỡ bỏ bình luận đánh giá không lịch sự hoặc sai thực tế
      Route::delete('reviews/{id}',         [ReviewController::class, 'adminDestroy'])->middleware('permission:reviews.update');

      // Reports Management (Quản trị báo cáo vi phạm/Tranh chấp)
      // Lấy danh sách toàn bộ các đơn báo cáo phản ánh từ người dùng
      Route::get('reports',                 [ReportController::class, 'adminIndex']);
      // Xem chi tiết báo cáo phản ánh kèm bằng chứng
      Route::get('reports/{id}',            [ReportController::class, 'adminShow']);
      // Cập nhật tình trạng giải quyết vi phạm (Khóa tài khoản vi phạm, gửi cảnh cáo...)
      Route::patch('reports/{id}/process',  [ReportController::class, 'process']);
      // Xóa hàng loạt danh sách các phản ánh vi phạm cũ
      Route::delete('reports/bulk-delete',  [ReportController::class, 'bulkDestroy']);
      // Xóa bỏ một dòng phản ánh vi phạm cụ thể
      Route::delete('reports/{id}',         [ReportController::class, 'destroy']);
    });
  });
});
