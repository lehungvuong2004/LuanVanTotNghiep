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
      return response()->json(['message' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
    }

    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');
    $roleId = $request->authUser['role_id'] ?? null;
    $bookingIds = [];
    $jobPostIds = [];

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
      Log::error('Failed to fetch user bookings for payments: ' . $e->getMessage());
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
        Log::error('Failed to fetch user job posts for payments: ' . $e->getMessage());
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

    $limit = (int) $request->query('limit', 20);
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

    // Enrich with user details from the request authUser
    foreach ($payments->items() as $payment) {
      $payment->user = $request->authUser;
    }

    return response()->json(['data' => $payments], Response::HTTP_OK);
  }

  /**
   * Customer creates a new payment for a booking or job post.
   */
  public function store(Request $request)
  {
    if ($request->authUser['role_id'] !== Role::CUSTOMER) {
      return response()->json(['message' => 'Only customers can initiate payments.'], Response::HTTP_FORBIDDEN);
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
      return response()->json([
        'message' => 'Payment must be associated with a booking or a job post.'
      ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $payment = Payment::create([
      'booking_id'       => $fields['booking_id'] ?? null,
      'job_post_id'      => $fields['job_post_id'] ?? null,
      'payment_method'   => $fields['payment_method'],
      'transaction_code' => 'TXN-' . strtoupper(Str::random(10)),
      'amount'           => $fields['amount'],
      'status'           => 'pending',
      'paid_at'          => null,
    ]);

    return response()->json([
      'message' => 'Payment initiated successfully.',
      'data'    => $payment,
    ], Response::HTTP_CREATED);
  }

  /**
   * View payment details (Customer/Admin).
   */
  public function show(Request $request, $id)
  {
    $payment = Payment::with('refunds')->find($id);

    if (!$payment) {
      return response()->json(['message' => 'Payment not found.'], Response::HTTP_NOT_FOUND);
    }

    // Ideally, check if the customer owns the booking/job_post here (requires calling order-service or passing ownership data).
    // For simplicity, we allow Admin/Operator (1, 2) and Customer (4) to view.
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR, Role::CUSTOMER])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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
        Log::error('Failed to fetch user details for show payment: ' . $e->getMessage());
      }
    }

    return response()->json(['data' => $payment], Response::HTTP_OK);
  }

  /**
   * Simulate a successful payment callback (e.g., from VNPAY/Momo).
   */
  public function callback(Request $request, $id)
  {
    $payment = Payment::find($id);

    if (!$payment) {
      return response()->json(['message' => 'Payment not found.'], Response::HTTP_NOT_FOUND);
    }

    if ($payment->status === 'completed') {
      return response()->json(['message' => 'Payment already completed.'], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $payment->update([
      'status'  => 'completed',
      'paid_at' => now(),
    ]);

    $this->syncPaymentStatusWithOrderService($payment);

    return response()->json([
      'message' => 'Payment marked as completed.',
      'data'    => $payment,
    ], Response::HTTP_OK);
  }

  /**
   * Admin/Operator lists all payments.
   */
  public function adminIndex(Request $request)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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

    $limit    = (int) $request->query('limit', 20);
    $payments = $query->paginate($limit);

    $this->enrichPaymentsWithUsers($payments, $request);

    return response()->json(['data' => $payments], Response::HTTP_OK);
  }

  /**
   * Admin manually updates payment status.
   */
  public function adminUpdateStatus(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return response()->json(['message' => 'Only administrators can update payment status.'], Response::HTTP_FORBIDDEN);
    }

    $payment = Payment::find($id);

    if (!$payment) {
      return response()->json(['message' => 'Payment not found.'], Response::HTTP_NOT_FOUND);
    }

    $fields = $request->validate([
      'status' => 'required|string|in:pending,completed,failed,refunded',
    ]);

    $updateData = ['status' => $fields['status']];
    if ($fields['status'] === 'completed' && !$payment->paid_at) {
      $updateData['paid_at'] = now();
    }

    $payment->update($updateData);

    return response()->json([
      'message' => 'Payment status updated.',
      'data'    => $payment->fresh(),
    ], Response::HTTP_OK);
  }

  /**
   * Thống kê doanh thu cho Admin/Operator.
   */
  public function stats(Request $request)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $totalRevenue = Payment::where('status', 'completed')->sum('amount');

    $thisMonth = now()->startOfMonth();
    $lastMonth = now()->subMonth()->startOfMonth();

    $thisMonthRevenue = Payment::where('status', 'completed')
      ->where('paid_at', '>=', $thisMonth)
      ->sum('amount');

    $lastMonthRevenue = Payment::where('status', 'completed')
      ->where('paid_at', '>=', $lastMonth)
      ->where('paid_at', '<', $thisMonth)
      ->sum('amount');

    $changePercent = 0;
    if ($lastMonthRevenue > 0) {
      $changePercent = (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
    } elseif ($thisMonthRevenue > 0) {
      $changePercent = 100;
    }

    return response()->json([
      'data' => [
        'total_revenue' => (float) $totalRevenue,
        'this_month_revenue' => (float) $thisMonthRevenue,
        'last_month_revenue' => (float) $lastMonthRevenue,
        'change_percent' => round($changePercent, 1)
      ]
    ], Response::HTTP_OK);
  }

    // =========================================================
    //  VNPay Integration
    // =========================================================

  /**
   * Customer requests a VNPay payment URL.
   * Creates a pending Payment record, then returns the redirect URL.
   *
   * POST /payments/vnpay/create
   */
  public function createVnpayUrl(Request $request)
  {
    if ($request->authUser['role_id'] !== Role::CUSTOMER) {
      return response()->json(['message' => 'Only customers can initiate payments.'], Response::HTTP_FORBIDDEN);
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
      return response()->json([
        'message' => 'Payment must be associated with a booking or a job post.'
      ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    // 1. Create a pending payment record
    $payment = Payment::create([
      'booking_id'       => $fields['booking_id']  ?? null,
      'job_post_id'      => $fields['job_post_id'] ?? null,
      'payment_method'   => 'vnpay',
      'transaction_code' => 'VNP-' . strtoupper(Str::random(8)),
      'amount'           => $fields['amount'],
      'status'           => 'pending',
      'paid_at'          => null,
    ]);

    // 2. Fetch customer details for VNPay Billing info
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
        Log::error('Failed to fetch customer profile for VNPay: ' . $e->getMessage());
      }
    }

    // 3. Build VNPay redirect URL
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
      'message'     => 'VNPay URL generated.',
      'payment_id'  => $payment->id,
      'payment_url' => $paymentUrl,
    ], Response::HTTP_CREATED);
  }

  /**
   * VNPay Return URL — user is redirected here after paying (GET).
   * Verifies signature and updates payment status.
   *
   * GET /payments/vnpay/return
   */
  public function vnpayReturn(Request $request)
  {
    $data = $request->query();

    $vnpay = new VnpayService();

    if (!$vnpay->verifySignature($data)) {
      Log::warning('VNPay return: invalid signature', $data);
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
      return response()->json(['message' => 'Không tìm thấy thanh toán.'], Response::HTTP_NOT_FOUND);
    }

    // Only update if still pending (guard against duplicate callbacks)
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
   * VNPay IPN (Instant Payment Notification) — server-to-server (GET/POST).
   * Must respond with JSON { RspCode, Message } for VNPay to acknowledge.
   *
   * POST /payments/vnpay/ipn
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

    // Check amount matches
    $vnpAmount = (int) ($data['vnp_Amount'] ?? 0);
    if ($vnpAmount !== (int) ($payment->amount * 100)) {
      return response()->json(['RspCode' => '04', 'Message' => 'Invalid amount'], Response::HTTP_OK);
    }

    if ($payment->status !== 'pending') {
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

    // 1. Fetch Bookings in bulk
    if (!empty($bookingIds)) {
      try {
        $response = \Illuminate\Support\Facades\Http::timeout(3)
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
        Log::error('Failed to bulk fetch bookings: ' . $e->getMessage());
      }
    }

    // 2. Fetch Job Posts in bulk
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
        Log::error('Failed to bulk fetch job posts: ' . $e->getMessage());
      }
    }

    // 3. Map payments to customer IDs and gather unique customer IDs
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

    // 4. Fetch User Details from identity-service in bulk
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
      Log::error('Failed to fetch user details for payments: ' . $e->getMessage());
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
        Log::error('Failed to fetch booking: ' . $e->getMessage());
      }
    }

    if ($jobPostId) {
      try {
        // Try admin endpoint first
        $response = Http::timeout(3)
          ->withHeaders(['Authorization' => $token])
          ->get($orderUrl . '/api/orders/admin/job-posts/' . $jobPostId);

        if ($response->successful()) {
          return $response->json('data.customer_id');
        }

        // Public endpoint
        $response = Http::timeout(3)
          ->get($orderUrl . '/api/orders/job-posts/' . $jobPostId);

        if ($response->successful()) {
          return $response->json('data.customer_id');
        }
      } catch (\Exception $e) {
        Log::error('Failed to fetch job post: ' . $e->getMessage());
      }
    }

    return null;
  }

  private function syncPaymentStatusWithOrderService($payment)
  {
    $orderUrl = env('ORDER_SERVICE_URL', 'http://order-service:8002');

    if ($payment->booking_id) {
      try {
        Http::timeout(3)
          ->post($orderUrl . '/api/orders/internal/bookings/update-payment-status', [
            'booking_id' => $payment->booking_id,
            'status'     => $payment->status,
          ]);
      } catch (\Exception $e) {
        Log::error('Failed to sync booking payment status: ' . $e->getMessage());
      }
    }

    if ($payment->job_post_id) {
      try {
        Http::timeout(3)
          ->post($orderUrl . '/api/orders/internal/job-posts/update-payment-status', [
            'job_post_id' => $payment->job_post_id,
            'status'      => $payment->status,
          ]);
      } catch (\Exception $e) {
        Log::error('Failed to sync job post payment status: ' . $e->getMessage());
      }
    }
  }

  public function helperEarningsStats(Request $request)
  {
    if ($request->authUser['role_id'] !== Role::HELPER) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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
      ->where(function($q) use ($bookingIds, $jobPostIds) {
        if (!empty($bookingIds)) {
          $q->whereIn('booking_id', $bookingIds);
        }
        if (!empty($jobPostIds)) {
          $q->orWhereIn('job_post_id', $jobPostIds);
        }
      })
      ->sum('amount');

    $bookingIncome = 0;
    if (!empty($bookingIds)) {
      $bookingIncome = Payment::where('status', 'completed')
        ->whereIn('booking_id', $bookingIds)
        ->sum('amount');
    }

    $jobPostIncome = 0;
    if (!empty($jobPostIds)) {
      $jobPostIncome = Payment::where('status', 'completed')
        ->whereIn('job_post_id', $jobPostIds)
        ->sum('amount');
    }

    $monthlyQuery = Payment::where('status', 'completed')
      ->where(function($q) use ($bookingIds, $jobPostIds) {
        if (!empty($bookingIds)) {
          $q->whereIn('booking_id', $bookingIds);
        }
        if (!empty($jobPostIds)) {
          $q->orWhereIn('job_post_id', $jobPostIds);
        }
      })
      ->selectRaw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') as month, SUM(amount) as total")
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
}
