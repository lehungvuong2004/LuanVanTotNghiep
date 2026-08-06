<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Payment;
use App\Models\Refund;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use App\Services\VnpayService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
  /**
   * Get payments for the authenticated user (Customer).
   */
  public function index(Request $request)
  {
    $token = $request->header('Authorization');
    if (!$token) {
      return $this->unauthorizedResponse('Chưa xác thực danh tính.');
    }

    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');
    $roleId = $request->authUser['role_id'] ?? null;
    $bookingIds = [];
    $jobPostIds = [];
    $bookingsData = [];

    // 1. Fetch customer's or helper's booking IDs
    try {
      $bookingsEndpoint = ($roleId === Role::HELPER) ? '/api/orders/helper/bookings' : '/api/orders/bookings';
      $response = Http::timeout(3)
        ->withHeaders(['Authorization' => $token])
        ->get($orderUrl . $bookingsEndpoint, ['limit' => 1000]);

      if ($response->successful()) {
        $bookingsData = $response->json('data.data') ?? $response->json('data') ?? [];
        $bookingIds = collect($bookingsData)->pluck('id')->toArray();
      }
    } catch (\Exception $e) {
      Log::error('Không thể lấy danh sách đơn đặt lịch để tra cứu thanh toán: ' . $e->getMessage());
    }

    // 2. Fetch customer's job post IDs (only for customers/admins)
    if ($roleId !== Role::HELPER) {
      try {
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/my/job-posts', ['limit' => 1000]);

        if ($response->successful()) {
          $jobPostsData = $response->json('data.data') ?? $response->json('data') ?? [];
          $jobPostIds = collect($jobPostsData)->pluck('id')->toArray();
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy danh sách tin tuyển dụng để tra cứu thanh toán: ' . $e->getMessage());
      }
    }

    // If no bookings and no job posts, return empty pagination format
    if (empty($bookingIds) && empty($jobPostIds)) {
      return response()->json([
        'data' => [
          'current_page' => 1,
          'data' => [],
          'total' => 0,
          'last_page' => 1,
          'per_page' => 20,
        ]
      ], Response::HTTP_OK);
    }

    $limit = $request->integer('limit', 20);
    $query = Payment::with('refunds');

    $query->where(function ($q) use ($bookingIds, $jobPostIds) {
      if (!empty($bookingIds)) {
        $q->whereIn('booking_id', $bookingIds);
      }
      if (!empty($jobPostIds)) {
        $q->orWhereIn('job_post_id', $jobPostIds);
      }
    });

    $payments = $query->orderByDesc('created_at')->paginate($limit);

    $bookingStatusMap = [];
    if (is_array($bookingsData)) {
      foreach ($bookingsData as $b) {
        if (isset($b['id']) && isset($b['status'])) {
          $bookingStatusMap[$b['id']] = $b['status'];
        }
      }
    }

    foreach ($payments->items() as $payment) {
      $payment->user = $request->authUser;

      // Auto-reconciliation self-healing check
      if ($payment->status === 'completed' && $payment->booking_id) {
        $bStatus = $bookingStatusMap[$payment->booking_id] ?? null;
        if ($bStatus === 'pending') {
          try {
            $this->syncPaymentStatusWithOrderService($payment);
            Log::info("Self-healing: Resynced completed payment ID {$payment->id} for booking ID {$payment->booking_id}");
          } catch (\Exception $syncEx) {
            Log::error("Self-healing failed for payment ID {$payment->id}: " . $syncEx->getMessage());
          }
        }
      }
    }

    return $this->successResponse($payments);
  }

  /**
   * Customer creates a new payment for a booking or job post.
   */
  public function store(Request $request)
  {
    if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có thể khởi tạo thanh toán.')) {
      return $unauthorized;
    }

    $fields = $request->validate([
      'booking_id'     => 'nullable|integer',
      'job_post_id'    => 'nullable|integer',
      'payment_method' => 'required|string|max:30',
      'amount'         => 'required|numeric|min:0',
    ]);

    if ($fields['payment_method'] === 'vnpay') {
      $request->validate([
        'amount' => 'numeric|min:10000|max:1000000000'
      ], [
        'amount.min' => 'Số tiền thanh toán tối thiểu qua VNPay là 10.000 đ.',
        'amount.max' => 'Số tiền thanh toán tối đa qua VNPay là 1.000.000.000 đ.',
      ]);
    }

    if (empty($fields['booking_id']) && empty($fields['job_post_id'])) {
      return $this->errorResponse('Thanh toán phải gắn liền với một đơn đặt lịch hoặc một tin tuyển dụng.', Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $jobPostId = $fields['job_post_id'] ?? null;
    $bookingId = $fields['booking_id'] ?? null;

    if ($bookingId && !$jobPostId) {
      $jobPostId = $this->getJobPostIdFromBooking($request, $bookingId);
    }

    $payment = Payment::create([
      'booking_id'       => $bookingId,
      'job_post_id'      => $jobPostId,
      'payment_method'   => $fields['payment_method'],
      'transaction_code' => 'TXN-' . strtoupper(Str::random(10)),
      'amount'           => $fields['amount'],
      'status'           => 'pending',
      'paid_at'          => null,
    ]);

    $this->syncPaymentStatusWithOrderService($payment);

    return $this->successResponse($payment, 'Khởi tạo thanh toán thành công.', Response::HTTP_CREATED);
  }

  /**
   * View payment details (Customer/Admin).
   */
  public function show(Request $request, $id)
  {
    $payment = Payment::with('refunds')->find($id);

    if (!$payment) {
      return $this->notFoundResponse('Không tìm thấy giao dịch thanh toán.');
    }

    if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
      return $unauthorized;
    }

    $customerId = $this->getCustomerIdFromOrderService($request, $payment->booking_id, $payment->job_post_id);

    if ($customerId) {
      try {
        $identityUrl = env('IDENTITY_SERVICE_URL', 'http://identity-service:8000');
        $response = Http::timeout(3)
          ->post($identityUrl . '/api/internal/users/by-ids', ['ids' => [$customerId]]);

        if ($response->successful()) {
          $users = $response->json('data') ?? [];
          $payment->user = !empty($users) ? $users[0] : null;
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin người dùng cho giao dịch thanh toán: ' . $e->getMessage());
      }
    }

    return $this->successResponse($payment);
  }

  /**
   * Simulate a successful payment callback (e.g., from VNPAY/Momo).
   */
  public function callback(Request $request, $id)
  {
    $payment = Payment::find($id);

    if (!$payment) {
      return $this->notFoundResponse('Không tìm thấy giao dịch thanh toán.');
    }

    if ($payment->status === 'completed') {
      return $this->errorResponse('Giao dịch thanh toán đã được hoàn tất trước đó.', Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $payment->update([
      'status'  => 'completed',
      'paid_at' => now(),
    ]);

    $this->syncPaymentStatusWithOrderService($payment);

    return $this->successResponse($payment, 'Đã cập nhật trạng thái thanh toán thành công.');
  }

  /**
   * Admin/Operator lists all payments.
   */
  public function adminIndex(Request $request)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $query = Payment::orderByDesc('created_at');

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    if ($request->filled('payment_method')) {
      $query->where('payment_method', $request->query('payment_method'));
    }

    if ($request->filled('booking_id')) {
      $query->where('booking_id', $request->query('booking_id'));
    }

    if ($request->filled('job_post_id')) {
      $query->where('job_post_id', $request->query('job_post_id'));
    }

    $limit    = $request->integer('limit', 20);
    $payments = $query->paginate($limit);

    $this->enrichPaymentsWithUsers($payments, $request);

    return $this->successResponse($payments);
  }

  /**
   * Admin manually updates payment status.
   */
  public function adminUpdateStatus(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return $this->forbiddenResponse('Chỉ quản trị viên mới có quyền cập nhật trạng thái thanh toán.');
    }

    $payment = Payment::find($id);

    if (!$payment) {
      return $this->notFoundResponse('Không tìm thấy giao dịch thanh toán.');
    }

    $fields = $request->validate([
      'status' => 'required|string|in:pending,completed,failed,refunded',
    ]);

    $updateData = ['status' => $fields['status']];
    if ($fields['status'] === 'completed' && !$payment->paid_at) {
      $updateData['paid_at'] = now();
    }

    $payment->update($updateData);

    return $this->successResponse($payment->fresh(), 'Cập nhật trạng thái thanh toán thành công.');
  }

  /**
   * Thống kê doanh thu cho Admin/Operator.
   */
  public function stats(Request $request)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $totalRevenue = Payment::where('status', 'completed')->sum('commission_amount');
    $totalSales = Payment::where('status', 'completed')->sum('gross_amount');

    $thisMonth = now()->startOfMonth();
    $lastMonth = now()->subMonth()->startOfMonth();

    $thisMonthRevenue = Payment::where('status', 'completed')
      ->where('paid_at', '>=', $thisMonth)
      ->sum('commission_amount');

    $lastMonthRevenue = Payment::where('status', 'completed')
      ->where('paid_at', '>=', $lastMonth)
      ->where('paid_at', '<', $thisMonth)
      ->sum('commission_amount');

    $changePercent = 0;
    if ($lastMonthRevenue > 0) {
      $changePercent = (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
    } elseif ($thisMonthRevenue > 0) {
      $changePercent = 100;
    }

    return $this->successResponse([
      'total_revenue'      => (float) $totalRevenue,
      'total_sales'        => (float) $totalSales,
      'this_month_revenue' => (float) $thisMonthRevenue,
      'last_month_revenue' => (float) $lastMonthRevenue,
      'change_percent'     => round($changePercent, 1)
    ]);
  }

    // =========================================================
    //  VNPay Integration
    // =========================================================

  /**
   * Customer requests a VNPay payment URL.
   */
  public function createVnpayUrl(Request $request)
  {
    if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có thể tạo liên kết thanh toán.')) {
      return $unauthorized;
    }

    $fields = $request->validate([
      'booking_id'  => 'nullable|integer',
      'job_post_id' => 'nullable|integer',
      'amount'      => 'required|numeric|min:10000|max:1000000000',
      'order_info'  => 'nullable|string|max:255',
      'locale'      => 'nullable|string|in:vn,en',
    ], [
      'amount.min' => 'Số tiền thanh toán tối thiểu qua VNPay là 10.000 đ.',
      'amount.max' => 'Số tiền thanh toán tối đa qua VNPay là 1.000.000.000 đ.',
    ]);

    if (empty($fields['booking_id']) && empty($fields['job_post_id'])) {
      return $this->errorResponse('Thanh toán phải gắn liền với một đơn đặt lịch hoặc một tin tuyển dụng.', Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $jobPostId = $fields['job_post_id'] ?? null;
    $bookingId = $fields['booking_id'] ?? null;

    if ($bookingId && !$jobPostId) {
      $jobPostId = $this->getJobPostIdFromBooking($request, $bookingId);
    }

    $payment = Payment::create([
      'booking_id'       => $bookingId,
      'job_post_id'      => $jobPostId,
      'payment_method'   => 'vnpay',
      'transaction_code' => 'VNP-' . strtoupper(Str::random(8)),
      'amount'           => $fields['amount'],
      'status'           => 'pending',
      'paid_at'          => null,
    ]);

    $billingInfo = [];
    $customerId = $request->authUser['id'] ?? null;
    if ($customerId) {
      try {
        $identityUrl = env('IDENTITY_SERVICE_URL', 'http://identity-service:8000');
        $response = Http::timeout(3)
          ->post($identityUrl . '/api/internal/users/by-ids', ['ids' => [$customerId]]);

        if ($response->successful()) {
          $users = $response->json('data') ?? [];
          if (!empty($users)) {
            $u = $users[0];
            $fullName = $u['full_name'] ?? 'Nguoi thanh toan';
            $email    = $u['email'] ?? ($request->authUser['email'] ?? 'customer@example.com');
            $phone    = $u['phone'] ?? '0901234567';

            $nameParts = explode(' ', trim($fullName));
            $lastName  = array_pop($nameParts) ?: 'Customer';
            $firstName = implode(' ', $nameParts) ?: 'Customer';

            $billingInfo = [
              'vnp_Bill_Mobile'    => $phone,
              'vnp_Bill_Email'     => $email,
              'vnp_Bill_FirstName' => $firstName,
              'vnp_Bill_LastName'  => $lastName,
            ];
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin hồ sơ khách hàng cho VNPay: ' . $e->getMessage());
      }
    }

    $vnpay      = new VnpayService();
    $clientIp   = $request->ip() ?? '127.0.0.1';
    $orderInfo  = $fields['order_info'] ?? 'Thanh toan dich vu HomeService #' . $payment->id;
    $locale     = $fields['locale'] ?? 'vn';

    $paymentUrl = $vnpay->buildPaymentUrl(
      $payment->id,
      (float) $fields['amount'],
      $orderInfo,
      $clientIp,
      $locale,
      $billingInfo
    );

    return response()->json([
      'message'     => 'Khởi tạo đường dẫn thanh toán VNPay thành công.',
      'payment_id'  => $payment->id,
      'payment_url' => $paymentUrl,
    ], Response::HTTP_CREATED);
  }

  /**
   * VNPay Return URL — user is redirected here after paying (GET).
   */
  public function vnpayReturn(Request $request)
  {
    $data = $request->query();

    $vnpay = new VnpayService();

    if (!$vnpay->verifySignature($data)) {
      Log::warning('VNPay return: chữ ký không hợp lệ', $data);
      return response()->json(['message' => 'Chữ ký không hợp lệ.', 'code' => '97'], Response::HTTP_BAD_REQUEST);
    }

    $responseCode = $data['vnp_ResponseCode'] ?? '';
    $txnRef       = $data['vnp_TxnRef']       ?? '';
    $paymentId    = $vnpay->extractPaymentId($txnRef);

    if (!$paymentId) {
      return response()->json(['message' => 'Mã giao dịch không hợp lệ.'], Response::HTTP_BAD_REQUEST);
    }

    $payment = Payment::find($paymentId);
    if (!$payment) {
      return $this->notFoundResponse('Không tìm thấy thanh toán.');
    }

    if ($payment->status === 'pending') {
      if ($responseCode === '00') {
        $payment->update([
          'status'  => 'completed',
          'paid_at' => now()->toDateTimeString(),
          'transaction_code' => $data['vnp_TransactionNo'] ?? $payment->transaction_code,
        ]);
        $this->syncPaymentStatusWithOrderService($payment);
      } else {
        $payment->update(['status' => 'failed']);
      }
    }

    return response()->json([
      'message'      => $responseCode === '00' ? 'Thanh toán thành công.' : 'Thanh toán thất bại.',
      'code'         => $responseCode,
      'payment_id'   => $payment->id,
      'status'       => $payment->fresh()->status,
      'amount'       => $payment->amount,
      'paid_at'      => $payment->paid_at,
      'order_info'   => $data['vnp_OrderInfo'] ?? null,
      'bank_code'    => $data['vnp_BankCode']  ?? null,
      'txn_ref'      => $txnRef,
    ], Response::HTTP_OK);
  }

  /**
   * VNPay IPN (Instant Payment Notification).
   */
  public function vnpayIpn(Request $request)
  {
    $data = $request->all();

    $vnpay = new VnpayService();

    if (!$vnpay->verifySignature($data)) {
      return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature'], Response::HTTP_OK);
    }

    $responseCode = $data['vnp_ResponseCode'] ?? '';
    $txnRef       = $data['vnp_TxnRef']       ?? '';
    $paymentId    = $vnpay->extractPaymentId($txnRef);

    if (!$paymentId) {
      return response()->json(['RspCode' => '01', 'Message' => 'Order not found'], Response::HTTP_OK);
    }

    $payment = Payment::find($paymentId);
    if (!$payment) {
      return response()->json(['RspCode' => '01', 'Message' => 'Order not found'], Response::HTTP_OK);
    }

    $vnpAmount = (int) ($data['vnp_Amount'] ?? 0);
    if ($vnpAmount !== (int) ($payment->amount * 100)) {
      return response()->json(['RspCode' => '04', 'Message' => 'Invalid amount'], Response::HTTP_OK);
    }

    if ($payment->status !== 'pending') {
      if ($payment->status === 'completed') {
        try {
          $this->syncPaymentStatusWithOrderService($payment);
        } catch (\Exception $e) {
          Log::warning('VNPay IPN: retry sync failed: ' . $e->getMessage());
          return response()->json(['RspCode' => '99', 'Message' => 'Sync failed, retry later'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
      }
      return response()->json(['RspCode' => '02', 'Message' => 'Order already confirmed'], Response::HTTP_OK);
    }

    if ($responseCode === '00') {
      $payment->update([
        'status'           => 'completed',
        'paid_at'          => now()->toDateTimeString(),
        'transaction_code' => $data['vnp_TransactionNo'] ?? $payment->transaction_code,
      ]);
      $this->syncPaymentStatusWithOrderService($payment);
    } else {
      $payment->update(['status' => 'failed']);
    }

    return response()->json(['RspCode' => '00', 'Message' => 'Confirm success'], Response::HTTP_OK);
  }

  private function enrichPaymentsWithUsers($payments, Request $request)
  {
    $token = $request->header('Authorization');
    if (!$token) {
      return;
    }

    $bookingIds = collect($payments->items())->pluck('booking_id')->filter()->unique()->toArray();
    $jobPostIds = collect($payments->items())->pluck('job_post_id')->filter()->unique()->toArray();

    $bookingToCustomer = [];
    $jobPostToCustomer = [];

    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');

    if (!empty($bookingIds)) {
      try {
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/admin/bookings', [
            'ids' => implode(',', $bookingIds),
            'limit' => 1000
          ]);

        if ($response->successful()) {
          $bookings = $response->json('data.data') ?? [];
          foreach ($bookings as $b) {
            $bookingToCustomer[$b['id']] = $b['customer_id'];
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy danh sách đơn đặt lịch hàng loạt: ' . $e->getMessage());
      }
    }

    if (!empty($jobPostIds)) {
      try {
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/admin/job-posts', [
            'ids' => implode(',', $jobPostIds),
            'limit' => 1000
          ]);

        if ($response->successful()) {
          $posts = $response->json('data.data') ?? [];
          foreach ($posts as $p) {
            $jobPostToCustomer[$p['id']] = $p['customer_id'];
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy danh sách tin tuyển dụng hàng loạt: ' . $e->getMessage());
      }
    }

    $customerIds = [];
    foreach ($payments->items() as $payment) {
      $cId = null;
      if ($payment->booking_id) {
        $cId = $bookingToCustomer[$payment->booking_id] ?? null;
      }
      if (!$cId && $payment->job_post_id) {
        $cId = $jobPostToCustomer[$payment->job_post_id] ?? null;
      }
      if ($cId) {
        $payment->customer_id_temp = $cId;
        $customerIds[] = $cId;
      }
    }

    $customerIds = array_unique(array_filter($customerIds));
    if (empty($customerIds)) {
      return;
    }

    try {
      $identityUrl = env('IDENTITY_SERVICE_URL', 'http://identity-service:8000');
      $response = Http::timeout(3)
        ->post($identityUrl . '/api/internal/users/by-ids', ['ids' => array_values($customerIds)]);

      if ($response->successful()) {
        $users = $response->json('data') ?? [];
        $userMap = [];
        foreach ($users as $u) {
          $userMap[$u['id']] = $u;
        }

        foreach ($payments->items() as $payment) {
          if (isset($payment->customer_id_temp)) {
            $payment->user = $userMap[$payment->customer_id_temp] ?? null;
            unset($payment->customer_id_temp);
          }
        }
      }
    } catch (\Exception $e) {
      Log::error('Không thể lấy thông tin chi tiết người dùng cho danh sách thanh toán: ' . $e->getMessage());
    }
  }

  private function getCustomerIdFromOrderService(Request $request, ?int $bookingId, ?int $jobPostId): ?int
  {
    $token = $request->header('Authorization');
    if (!$token) {
      return null;
    }

    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');

    if ($bookingId) {
      try {
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/admin/bookings/' . $bookingId);

        if ($response->successful()) {
          return $response->json('data.customer_id');
        }
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/bookings/' . $bookingId);

        if ($response->successful()) {
          return $response->json('data.customer_id');
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin đơn đặt lịch: ' . $e->getMessage());
      }
    }

    if ($jobPostId) {
      try {
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/admin/job-posts/' . $jobPostId);

        if ($response->successful()) {
          return $response->json('data.customer_id');
        }

        $response = Http::timeout(3)
          ->get($orderUrl . '/api/orders/job-posts/' . $jobPostId);

        if ($response->successful()) {
          return $response->json('data.customer_id');
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin tin tuyển dụng: ' . $e->getMessage());
      }
    }

    return null;
  }

  private function syncPaymentStatusWithOrderService($payment)
  {
    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');

    if ($payment->booking_id) {
      $response = Http::timeout(3)
        ->post($orderUrl . '/api/orders/internal/bookings/update-payment-status', [
          'booking_id'     => $payment->booking_id,
          'status'         => $payment->status,
          'payment_method' => $payment->payment_method,
        ]);
      if (!$response->successful()) {
        throw new \Exception('Không thể đồng bộ trạng thái thanh toán đơn đặt lịch: HTTP ' . $response->status());
      }
    }

    if ($payment->job_post_id) {
      $response = Http::timeout(3)
        ->post($orderUrl . '/api/orders/internal/job-posts/update-payment-status', [
          'job_post_id'    => $payment->job_post_id,
          'status'         => $payment->status,
          'payment_method' => $payment->payment_method,
        ]);
      if (!$response->successful()) {
        throw new \Exception('Không thể đồng bộ trạng thái thanh toán tin tuyển dụng: HTTP ' . $response->status());
      }
    }
  }

  public function helperEarningsStats(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $bookingIds = $request->input('booking_ids', []);
    $jobPostIds = $request->input('job_post_ids', []);

    if (empty($bookingIds) && empty($jobPostIds)) {
      return response()->json([
        'total_income' => 0.0,
        'booking_income' => 0.0,
        'job_post_income' => 0.0,
        'monthly_income' => [],
      ], Response::HTTP_OK);
    }

    $totalIncome = Payment::where('status', 'completed')
      ->where(function ($q) use ($bookingIds, $jobPostIds) {
        if (!empty($bookingIds)) {
          $q->whereIn('booking_id', $bookingIds);
        }
        if (!empty($jobPostIds)) {
          $q->orWhereIn('job_post_id', $jobPostIds);
        }
      })
      ->sum('earned_amount');

    $bookingIncome = 0;
    if (!empty($bookingIds)) {
      $bookingIncome = Payment::where('status', 'completed')
        ->whereIn('booking_id', $bookingIds)
        ->whereNull('job_post_id')
        ->sum('earned_amount');
    }

    $jobPostIncome = 0;
    if (!empty($jobPostIds)) {
      $jobPostIncome = Payment::where('status', 'completed')
        ->where(function ($q) use ($jobPostIds, $bookingIds) {
          $q->whereIn('job_post_id', $jobPostIds);
          if (!empty($bookingIds)) {
            $q->orWhere(function ($sub) use ($bookingIds) {
              $sub->whereIn('booking_id', $bookingIds)
                  ->whereNotNull('job_post_id');
            });
          }
        })
        ->sum('earned_amount');
    }

    $monthlyQuery = Payment::where('status', 'completed')
      ->where(function ($q) use ($bookingIds, $jobPostIds) {
        if (!empty($bookingIds)) {
          $q->whereIn('booking_id', $bookingIds);
        }
        if (!empty($jobPostIds)) {
          $q->orWhereIn('job_post_id', $jobPostIds);
        }
      })
      ->selectRaw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') as month, SUM(earned_amount) as total")
      ->groupBy('month')
      ->orderBy('month', 'asc')
      ->get();

    $monthlyIncome = [];
    foreach ($monthlyQuery as $m) {
      $monthlyIncome[$m->month] = (float)$m->total;
    }

    return response()->json([
      'total_income' => (float)$totalIncome,
      'booking_income' => (float)$bookingIncome,
      'job_post_income' => (float)$jobPostIncome,
      'monthly_income' => $monthlyIncome,
    ], Response::HTTP_OK);
  }

  /**
   * Helper confirms receipt of cash for a completed booking (POST).
   */
  public function confirmCashReceipt(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $payment = Payment::find($id);

    if (!$payment) {
      return $this->notFoundResponse('Không tìm thấy giao dịch thanh toán.');
    }

    if ($payment->status === 'completed') {
      return $this->errorResponse('Giao dịch thanh toán đã được hoàn tất trước đó.', Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    if ($payment->payment_method !== 'cash') {
      return $this->errorResponse('Chỉ có thể xác nhận thanh toán trực tiếp đối với phương thức Tiền mặt.', Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $token = $request->header('Authorization');
    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');
    $helperId = $request->authUser['id'] ?? null;
    $bookingId = $payment->booking_id;

    if ($bookingId) {
      try {
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/bookings/' . $bookingId);

        if ($response->successful()) {
          $booking = $response->json('data');
          if (!$booking || (int)($booking['helper_id'] ?? 0) !== (int)$helperId) {
            return $this->forbiddenResponse('Bạn không phải là người giúp việc được giao cho lịch hẹn này.');
          }
        } else {
          Log::warning("confirmCashReceipt: status from order service: " . $response->status());
        }
      } catch (\Exception $e) {
        Log::error('Lỗi khi kiểm tra thông tin người giúp việc của booking: ' . $e->getMessage());
      }
    }

    $payment->update([
      'status'  => 'completed',
      'paid_at' => now(),
    ]);

    $this->syncPaymentStatusWithOrderService($payment);

    return $this->successResponse($payment, 'Đã xác nhận nhận tiền mặt và hoàn tất giao dịch.');
  }

  private function getJobPostIdFromBooking(Request $request, ?int $bookingId): ?int
  {
    if (!$bookingId) {
      return null;
    }

    $token = $request->header('Authorization');
    if (!$token) {
      return null;
    }

    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');
    try {
      $response = Http::timeout(3)
        ->withHeaders(['Authorization' => $token])
        ->get($orderUrl . '/api/orders/bookings/' . $bookingId);

      if ($response->successful()) {
        return $response->json('data.job_post_id');
      }
    } catch (\Exception $e) {
      Log::error('getJobPostIdFromBooking - Error fetching booking detail: ' . $e->getMessage());
    }

    return null;
  }
}
