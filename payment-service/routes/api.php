<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RefundController;

Route::prefix('payments')->group(function () {

  // =====================================================================
  //  PUBLIC — VNPay callbacks (Không cần JWT; VNPay gọi hoặc chuyển hướng người dùng về)
  // =====================================================================
  // VNPay redirect người dùng về (GET) để hiển thị thông báo trạng thái thanh toán trên giao diện khách hàng
  Route::get('/vnpay/return', [PaymentController::class, 'vnpayReturn']);
  // Cổng VNPay gửi tín hiệu IPN (POST ngầm Server-to-Server) xác nhận trạng thái thanh toán cuối cùng của giao dịch
  Route::post('/vnpay/ipn',   [PaymentController::class, 'vnpayIpn']);

  // =====================================================================
  //  AUTHENTICATED — JWT required for all routes below
  // =====================================================================
  Route::middleware('jwt.auth')->group(function () {

    // -------------------------------------------------------------
    //  ADMIN / OPERATOR — Quản trị thanh toán và hoàn tiền
    // -------------------------------------------------------------
    Route::prefix('admin')->group(function () {
      // Xem thống kê báo cáo doanh thu hệ thống (tổng doanh thu, doanh thu tháng này/trước đó và % tăng trưởng)
      Route::get('/stats',                 [PaymentController::class, 'stats'])->middleware('permission:payments.history');

      // Payments Management
      // Lấy toàn bộ danh sách lịch sử tất cả các giao dịch thanh toán trong hệ thống (lọc theo trạng thái, phân trang)
      Route::get('/',                      [PaymentController::class, 'adminIndex'])->middleware('permission:payments.history');
      // Admin chủ động thay đổi thủ công trạng thái của bản ghi giao dịch (pending, completed, failed, refunded)
      Route::patch('/{id}/status',         [PaymentController::class, 'adminUpdateStatus'])->middleware('permission:payments.view');

      // Refunds Management
      // Xem toàn bộ danh sách tất cả các yêu cầu hoàn tiền của khách hàng
      Route::get('/refunds',               [RefundController::class, 'adminIndex'])->middleware('permission:refunds.process');
      // Phê duyệt duyệt/từ chối hoặc xác nhận chuyển khoản hoàn tất cho một yêu cầu hoàn tiền
      Route::patch('/refunds/{id}/process', [RefundController::class, 'process'])->middleware('permission:refunds.process');
    });

    // ---- VNPAY (Khách hàng) ----
    // Hộp thoại (Modal) thanh toán trên trang "Lịch sử đặt lịch"
    Route::post('/vnpay/create',    [PaymentController::class, 'createVnpayUrl']);

    // ---- PAYMENTS (Giao dịch) ----
    // Người giúp việc (Helper) gửi danh sách ID booking để tổng hợp ( giao dien: "Thanh toán & Thu nhập") giusp helper theo doix doanh thu
    Route::post('/helper/earnings-stats', [PaymentController::class, 'helperEarningsStats']);

    // Customer (Khách hàng)
    // Khách hàng lấy danh sách giao dịch thanh toán cá nhân của chính mình
    Route::get('/',                 [PaymentController::class, 'index']);
    // Khởi tạo giao dịch cơ sở
    Route::post('/',                [PaymentController::class, 'store']);
    // Xem thông tin chi tiết một giao dịch thanh toán cụ thể
    Route::get('/{id}',             [PaymentController::class, 'show']);
    // Giả lập callback thành công (phục vụ thử nghiệm logic xử lý thanh toán môi trường phát triển)
    Route::post('/{id}/callback',   [PaymentController::class, 'callback']);
    // Người giúp việc xác nhận đã thu/nhận tiền mặt từ khách hàng khi hoàn thành công việc trực tiếp (COD)
    Route::post('/{id}/confirm-cash', [PaymentController::class, 'confirmCashReceipt']);

    // ---- REFUNDS (Hoàn tiền) ----
    // Customer (Khách hàng)
    // Khách hàng tạo yêu cầu hoàn trả tiền cho giao dịch thanh toán đã thành công (kèm lý do và số tiền yêu cầu)
    Route::post('/refunds',         [RefundController::class, 'store']);
    // Lấy toàn bộ danh sách các yêu cầu hoàn tiền của riêng một giao dịch thanh toán cụ thể
    Route::get('/{paymentId}/refunds', [RefundController::class, 'getRefundsByPayment']);
  });
});
