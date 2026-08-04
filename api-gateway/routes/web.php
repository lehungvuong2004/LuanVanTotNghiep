<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

// ============================================================
// 1. TRANG CHỦ & PHƯƠNG THỨC TRUNG CHUYỂN (PROXY CORE)
// ============================================================

// Trang chủ hiển thị trạng thái hoạt động tức thời của API Gateway
Route::get('/', function () {
  return response()->json([
    'service' => 'API Gateway',
    'status' => 'Running',
    'timestamp' => now()->toIso8601String()
  ], 200);
});

/**
 * Hàm trung chuyển (Proxy) nhận request từ Client, truyền tiếp dữ liệu và tiêu đề (Header)
 * đến các Microservices cụ thể chạy ngầm trong Docker Network, sau đó phản hồi ngược lại Client.
 * 
 * @param string $targetUrl - URL đích của Microservice nội bộ cần xử lý
 * @param Request $request - Đối tượng Request nguyên bản từ Client
 */
function proxyTo($targetUrl, Request $request)
{
  // Giữ lại token và cấu hình định dạng phản hồi JSON
  $headers = [
    'Authorization' => $request->header('Authorization'),
    'Accept' => 'application/json',
  ];

  $contentType = $request->header('Content-Type', '');

  // TRƯỜNG HỢP 1: Dữ liệu tải lên có chứa tập tin (Ảnh đại diện, tài liệu, file CSV...)
  if (str_contains($contentType, 'multipart/form-data')) {
    $pendingRequest = Http::withHeaders($headers);

    // Duyệt qua tất cả các input và file đính kèm để đóng gói luồng dữ liệu
    foreach ($request->all() as $name => $value) {
      if ($request->hasFile($name)) {
        $file = $request->file($name);
        $pendingRequest->attach(
          $name,
          file_get_contents($file->getRealPath()), // Đọc nội dung file thô
          $file->getClientOriginalName(),           // Tên file gốc
          ['Content-Type' => $file->getClientMimeType()] // Định dạng file (MIME type)
        );
      } else {
        // Đóng gói tham số text thường vào request multipart
        $pendingRequest->attach($name, $value);
      }
    }

    // Gửi request multipart đi sang Microservice tương ứng
    $response = $pendingRequest->send($request->method(), $targetUrl, [
      'query' => $request->query(),
      'multipart' => []
    ]);
  }
  // TRƯỜNG HỢP 2: Các request thông thường (GET, POST JSON, PUT, DELETE...)
  else {
    $headers['Content-Type'] = 'application/json';
    $response = Http::withHeaders($headers)
      ->send($request->method(), $targetUrl, [
        'query' => $request->query(),
        'body'  => $request->getContent(),
      ]);
  }

  $body = $response->body();
  $resContentType = $response->header('Content-Type');

  // Xử lý viết lại đường dẫn (URL Rewriting):
  // Nếu dữ liệu trả về từ Microservice là chuỗi JSON chứa các link ảnh hoặc link API nội bộ (VD: http://identity-service:8000/uploads/...)
  // cần thay thế sang tên miền/IP công khai của API Gateway để Client/Frontend bên ngoài có thể truy cập được.
  if ($resContentType && str_contains(strtolower($resContentType), 'application/json')) {
    $gatewayUrl = $request->getSchemeAndHttpHost();
    $escapedGatewayUrl = str_replace('/', '\/', $gatewayUrl);

    $body = str_replace(
      [
        'http://identity-service:8000',
        'http:\/\/identity-service:8000',
        'http://order-service:8000',
        'http:\/\/order-service:8000',
        'http://payment-service:8000',
        'http:\/\/payment-service:8000',
        'http://provider-service:8000',
        'http:\/\/provider-service:8000'
      ],
      [
        $gatewayUrl,
        $escapedGatewayUrl,
        $gatewayUrl,
        $escapedGatewayUrl,
        $gatewayUrl,
        $escapedGatewayUrl,
        $gatewayUrl,
        $escapedGatewayUrl
      ],
      $body
    );
  }

  // Trả về kết quả cuối cùng cho Client kèm mã HTTP Status Code tương ứng
  return response($body, $response->status())
    ->header('Content-Type', $resContentType);
}

// ============================================================
// 2. ĐỊNH TUYẾN PROXY CHO IDENTITY SERVICE (Dịch vụ định danh)
// ============================================================

// Proxy cho các API xác thực thành viên (Đăng nhập, Đăng ký, Quên mật khẩu...)
Route::any('/api/auth/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/auth/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy các thao tác quản trị viên cấp cao (Quản lý User, vai trò, phân quyền, logs, liên hệ...)
Route::any('/api/admin/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/admin/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho các API quản lý thông tin hồ sơ của khách hàng
Route::any('/api/customer/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/customer/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho các API quản lý thông báo, chuông báo của người dùng
Route::any('/api/notifications/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/notifications/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho các tác vụ thay đổi, tải lên avatar của riêng cá nhân đăng nhập
Route::any('/api/profile/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/profile' . ($any !== '' ? '/' . $any : '');
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho việc hiển thị banner quảng cáo công khai
Route::any('/api/banners/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/banners/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho việc xem danh sách và chi tiết các bài đăng tin tức
Route::any('/api/news/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/news/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho việc gửi yêu cầu thắc mắc, phản hồi qua form Contact Us
Route::any('/api/contacts/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/contacts' . ($any !== '' ? '/' . $any : '');
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Proxy cho các truy vấn giải đáp thông tin từ Chatbot AI RAG
Route::any('/api/chatbot/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/api/chatbot' . ($any !== '' ? '/' . $any : '');
  return proxyTo($targetUrl, $request);
})->where('any', '.*');



// ============================================================
// 3. ĐỊNH TUYẾN PROXY CHO ORDER SERVICE (Dịch vụ đơn hàng/đặt lịch)
// ============================================================
// Proxy các API liên quan đến đặt lịch giúp việc trực tiếp và đăng tin tuyển dụng thợ
Route::any('/api/orders/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://order-service:8000/api/orders/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');
// ::prefix('payments')
// ============================================================
// 4. ĐỊNH TUYẾN PROXY CHO PAYMENT SERVICE (Dịch vụ thanh toán/hoàn tiền)
// ============================================================
// Proxy các yêu cầu khởi tạo hoá đơn, liên kết VNPay và quản lý doanh thu
Route::any('/api/payments/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://payment-service:8000/api/payments/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// ============================================================
// 5. ĐỊNH TUYẾN PROXY CHO PROVIDER SERVICE (Dịch vụ người giúp việc)
// ============================================================
// Proxy các yêu cầu cài đặt kỹ năng, vùng nhận việc và lịch biểu rảnh rỗi của thợ
Route::any('/api/providers/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://provider-service:8000/api/providers/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');

// ============================================================
// 6. ĐỊNH TUYẾN TẢI THƯ MỤC TĨNH (STATIC UPLOADS PROXY)
// ============================================================
// Chuyển hướng các request tải tài nguyên tĩnh (Avatars, Banners, ảnh mô tả dịch vụ) từ Identity-Service
Route::any('/uploads/{any?}', function (Request $request, $any = '') {
  $targetUrl = 'http://identity-service:8000/uploads/' . $any;
  return proxyTo($targetUrl, $request);
})->where('any', '.*');
