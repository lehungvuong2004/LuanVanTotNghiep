<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

// 1. Trang chủ hiển thị trạng thái của API Gateway
Route::get('/', function () {
    return response()->json([
        'service' => 'API Gateway',
        'status' => 'Running',
        'timestamp' => now()->toIso8601String()
    ], 200);
});

/**
 * Hàm trung chuyển (Proxy) request từ Gateway tới từng Microservice đích.
 * 
 * @param string $targetUrl - URL đích của Microservice nội bộ (VD: http://identity-service:8000/api/auth/login)
 * @param Request $request - Request gốc nhận được từ Client
 */
function proxyTo($targetUrl, Request $request) {
    // Lấy Token Authorization để đảm bảo quyền truy cập (JWT) được truyền đi tiếp
    $headers = [
        'Authorization' => $request->header('Authorization'),
        'Accept' => 'application/json',
    ];

    $contentType = $request->header('Content-Type', '');
    if (str_contains($contentType, 'multipart/form-data')) {
        $pendingRequest = Http::withHeaders($headers);
        
        // Đọc tất cả input & file để đóng gói gửi đi
        foreach ($request->all() as $name => $value) {
            if ($request->hasFile($name)) {
                $file = $request->file($name);
                $pendingRequest->attach(
                    $name,
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName(),
                    ['Content-Type' => $file->getClientMimeType()]
                );
            } else {
                $pendingRequest->attach($name, $value);
            }
        }
        $response = $pendingRequest->send($request->method(), $targetUrl, [
            'query' => $request->query(),
            'multipart' => []
        ]);
    } 
    // TH 2: Request dạng JSON hoặc dữ liệu thường
    else {
        $headers['Content-Type'] = 'application/json';
        $response = Http::withHeaders($headers)
            ->send($request->method(), $targetUrl, [
                'query' => $request->query(),      
                'body'  => $request->getContent(),  
            ]);
    }

    // Trả lại kết quả và kiểu dữ liệu (Content-Type) từ microservice về cho Client
    $body = $response->body();
    $resContentType = $response->header('Content-Type');

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

    return response($body, $response->status())
        ->header('Content-Type', $resContentType);
}

// 2. Định tuyến cho Identity Service (Xác thực, Phân quyền, Quản lý User và Admin)
Route::any('/api/auth/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/auth/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

Route::any('/api/admin/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/admin/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

Route::any('/api/customer/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/customer/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

Route::any('/api/notifications/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/notifications/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

Route::any('/api/profile/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/profile' . ($any !== '' ? '/' . $any : '');
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

Route::any('/api/banners/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/banners/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Tin tức — proxy sang Identity Service
Route::any('/api/news/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/news/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Liên hệ — proxy sang Identity Service
Route::any('/api/contacts/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/contacts' . ($any !== '' ? '/' . $any : '');
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// Chatbot — proxy sang Identity Service
Route::any('/api/chatbot/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/api/chatbot' . ($any !== '' ? '/' . $any : '');
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// 3. Định tuyến cho Order Service (Quản lý đơn đặt dịch vụ)
Route::any('/api/orders/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://order-service:8000/api/orders/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// 4. Định tuyến cho Payment Service (Quản lý giao dịch, thanh toán)
Route::any('/api/payments/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://payment-service:8000/api/payments/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// 5. Định tuyến cho Provider Service (Quản lý thợ, nhà cung cấp dịch vụ)
Route::any('/api/providers/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://provider-service:8000/api/providers/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');

// 6. Định tuyến tải ảnh tĩnh (uploads) từ Identity Service
Route::any('/uploads/{any?}', function (Request $request, $any = '') {
    $targetUrl = 'http://identity-service:8000/uploads/' . $any;
    return proxyTo($targetUrl, $request);
})->where('any', '.*');
