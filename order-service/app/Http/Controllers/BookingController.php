<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Booking;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use App\Models\BookingService;
use App\Models\BookingStatusHistory;
use App\Models\BookingWorkLog;
use App\Models\Review;
use App\Services\InternalNotificationService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    // =====================================================================
    //  HELPER — Status transition rules
    // =====================================================================

    /** Valid status transitions per actor */
    private const CUSTOMER_CANCEL_ALLOWED = ['pending', 'confirmed'];
    private const HELPER_ACCEPT_FROM      = ['pending'];
    private const HELPER_REJECT_FROM      = ['pending'];
    private const HELPER_START_MOVING_FROM= ['confirmed'];
    private const HELPER_CHECKIN_FROM     = ['on_the_way', 'confirmed'];
    private const HELPER_CHECKOUT_FROM    = ['in_progress'];

    // =====================================================================
    //  CUSTOMER — Booking flow
    // =====================================================================

    /**
     * Create a new booking.
     * Role: customer (role_id=4)
     */
    public function store(Request $request)
    {
        if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có thể tạo đơn đặt lịch.')) {
            return $unauthorized;
        }

        $fields = $request->validate([
            'helper_id'    => 'nullable|integer',
            'address_id'   => 'required|integer',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time'   => 'required|date_format:H:i',
            'note'         => 'nullable|string|max:500',
            'services'     => 'required|array|min:1',
            'services.*.service_id'     => 'required|integer',
            'services.*.price'          => 'required|numeric|min:0',
            'services.*.duration_hours' => 'required|integer|in:2,4,6,8',
            'services.*.quantity'       => 'sometimes|integer|min:1',
        ]);

        $totalPrice = collect($fields['services'])
            ->sum(fn($s) => $s['price'] * ($s['quantity'] ?? 1));

        if (!empty($fields['helper_id'])) {
            $durationHours = collect($fields['services'])
                ->sum(fn($s) => $s['duration_hours'] * ($s['quantity'] ?? 1));
            if (Booking::hasConflict((int) $fields['helper_id'], $fields['booking_date'], $fields['start_time'], (float) $durationHours)) {
                return $this->errorResponse('Người giúp việc này hiện đang bận hoặc đã có lịch làm việc khác trùng thời gian này.', Response::HTTP_BAD_REQUEST);
            }
        }

        $booking = Booking::create([
            'booking_code' => 'BK-' . strtoupper(Str::random(8)),
            'customer_id'  => $request->authUser['id'],
            'helper_id'    => $fields['helper_id'] ?? null,
            'address_id'   => $fields['address_id'],
            'booking_date' => $fields['booking_date'],
            'start_time'   => $fields['start_time'],
            'total_price'  => $totalPrice,
            'status'       => 'pending',
            'note'         => $fields['note'] ?? null,
            'refund_status'=> 'none',
        ]);

        foreach ($fields['services'] as $i => $svc) {
            BookingService::create([
                'booking_id'     => $booking->id,
                'service_id'     => $svc['service_id'],
                'price'          => $svc['price'],
                'duration_hours' => $svc['duration_hours'],
                'quantity'       => $svc['quantity'] ?? 1,
                'service_order'  => $i + 1,
            ]);
        }

        $this->recordStatusHistory($booking->id, null, 'pending', $request->authUser['id'], 'Đơn đặt lịch đã được tạo.');

        return $this->successResponse($booking->load('services'), 'Tạo đơn đặt lịch thành công.', Response::HTTP_CREATED);
    }

    /**
     * List the authenticated customer's own bookings.
     */
    public function myBookings(Request $request)
    {
        if ($unauthorized = $this->authorizeCustomer($request)) {
            return $unauthorized;
        }

        $query = Booking::with(['services', 'reviews', 'reports'])
                        ->where('customer_id', $request->authUser['id']);

        if ($request->filled('status'))    $query->where('status', $request->query('status'));
        if ($request->filled('from_date')) $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))   $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = $request->integer('limit', 20);
        $bookings = $query->orderByDesc('created_at')->paginate($limit);

        // Fetch helper user info from identity-service internally
        $helperIds = collect($bookings->items())->pluck('helper_id')->filter()->unique()->toArray();
        $userMap = [];

        if (!empty($helperIds)) {
            try {
                $response = Http::timeout(3)
                    ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $helperIds]);

                if ($response->successful()) {
                    $users = $response->json('data') ?? [];
                    foreach ($users as $u) {
                        $userMap[$u['id']] = $u;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Không thể lấy thông tin chi tiết người giúp việc cho myBookings: ' . $e->getMessage());
            }
        }

        foreach ($bookings->items() as $booking) {
            $booking->helper = $userMap[$booking->helper_id] ?? null;
        }

        return $this->successResponse($bookings);
    }

    /**
     * Get booking detail — accessible to the booking's customer or assigned helper.
     */
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['services', 'statusHistories', 'workLogs', 'reviews'])->find($id);

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        $userId  = $request->authUser['id'];
        $roleId  = $request->authUser['role_id'];

        $allowed = in_array($roleId, [Role::ADMIN, Role::OPERATOR])
            || $booking->customer_id == $userId
            || $booking->helper_id  == $userId;

        if (!$allowed) {
            return $this->forbiddenResponse();
        }

        return $this->successResponse($booking);
    }

    /**
     * Customer cancels a booking.
     */
    public function cancel(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có thể hủy đơn đặt lịch.')) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('customer_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if (!in_array($booking->status, self::CUSTOMER_CANCEL_ALLOWED)) {
            return $this->errorResponse("Không thể hủy đơn đặt lịch ở trạng thái '{$booking->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus       = $booking->status;
        $booking->status = 'cancelled';
        $booking->save();

        $this->recordStatusHistory(
            $booking->id,
            $oldStatus,
            'cancelled',
            $request->authUser['id'],
            $fields['reason'] ?? 'Khách hàng đã hủy đơn đặt lịch.'
        );

        if ($booking->helper_id) {
            InternalNotificationService::sendToUser(
                $booking->helper_id,
                'Đơn đặt lịch đã bị hủy',
                "Khách hàng đã hủy đơn đặt lịch #{$booking->booking_code}.",
                'booking'
            );
        }

        return $this->successResponse($booking->fresh(), 'Hủy đơn đặt lịch thành công.');
    }

    /**
     * Customer submits a review after completed booking.
     */
    public function review(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có thể gửi đánh giá.')) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('customer_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if ($booking->status !== 'completed') {
            return $this->errorResponse('Bạn chỉ có thể đánh giá đơn đặt lịch đã hoàn thành.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Review::where('booking_id', $id)->exists()) {
            return $this->errorResponse('Bạn đã gửi đánh giá cho đơn đặt lịch này rồi.', Response::HTTP_CONFLICT);
        }

        $fields = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'booking_id'  => $id,
            'customer_id' => $request->authUser['id'],
            'helper_id'   => $booking->helper_id,
            'rating'      => $fields['rating'],
            'comment'     => $fields['comment'] ?? null,
        ]);

        return $this->successResponse($review, 'Gửi đánh giá thành công.', Response::HTTP_CREATED);
    }

    // =====================================================================
    //  HELPER — Booking lifecycle actions
    // =====================================================================

    /**
     * List bookings assigned to the authenticated helper.
     */
    public function helperBookings(Request $request)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $query = Booking::with(['services', 'reviews', 'reports'])
                        ->where('helper_id', $request->authUser['id']);

        if ($request->filled('status'))    $query->where('status', $request->query('status'));
        if ($request->filled('from_date')) $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))   $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = $request->integer('limit', 20);
        $bookings = $query->orderByDesc('created_at')->paginate($limit);

        $customerIds = collect($bookings->items())->pluck('customer_id')->filter()->unique()->toArray();
        $userMap = [];

        if (!empty($customerIds)) {
            try {
                $response = Http::timeout(3)
                    ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $customerIds]);

                if ($response->successful()) {
                    $users = $response->json('data') ?? [];
                    foreach ($users as $u) {
                        $userMap[$u['id']] = $u;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Không thể lấy thông tin chi tiết khách hàng cho helperBookings: ' . $e->getMessage());
            }
        }

        foreach ($bookings->items() as $booking) {
            $booking->customer = $userMap[$booking->customer_id] ?? null;
        }

        return $this->successResponse($bookings);
    }

    /**
     * Helper accepts a pending booking.
     */
    public function accept(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('helper_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if (!in_array($booking->status, self::HELPER_ACCEPT_FROM)) {
            return $this->errorResponse("Không thể chấp nhận đơn đặt lịch ở trạng thái '{$booking->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $durationHours = $booking->services()->sum(\Illuminate\Support\Facades\DB::raw('duration_hours * quantity')) ?: 2;
        if (Booking::hasConflict((int) $request->authUser['id'], $booking->booking_date, $booking->start_time, (float) $durationHours, (int) $booking->id)) {
            return $this->errorResponse('Bạn không thể nhận việc này do trùng lịch với một công việc khác.');
        }

        $oldStatus       = $booking->status;
        $booking->status = 'confirmed';
        $booking->save();

        $this->recordStatusHistory($booking->id, $oldStatus, 'confirmed', $request->authUser['id'], 'Người giúp việc đã chấp nhận công việc.');

        InternalNotificationService::sendToUser(
            $booking->customer_id,
            'Đơn đặt lịch đã được chấp nhận',
            "Người giúp việc đã chấp nhận đơn đặt lịch #{$booking->booking_code}.",
            'booking'
        );

        return $this->successResponse($booking->fresh(), 'Đã chấp nhận đơn đặt lịch.');
    }

    /**
     * Helper rejects a pending booking.
     */
    public function reject(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('helper_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if (!in_array($booking->status, self::HELPER_REJECT_FROM)) {
            return $this->errorResponse("Không thể từ chối đơn đặt lịch ở trạng thái '{$booking->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus        = $booking->status;
        $booking->status  = 'cancelled';
        $booking->save();

        $this->recordStatusHistory(
            $booking->id,
            $oldStatus,
            'cancelled',
            $request->authUser['id'],
            $fields['reason'] ?? 'Người giúp việc đã từ chối công việc.'
        );

        InternalNotificationService::sendToUser(
            $booking->customer_id,
            'Đơn đặt lịch bị từ chối',
            "Người giúp việc đã từ chối đơn đặt lịch #{$booking->booking_code}.",
            'booking'
        );

        return $this->successResponse($booking->fresh(), 'Đã từ chối đơn đặt lịch.');
    }

    /**
     * Helper starts moving to the job location.
     */
    public function startMoving(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('helper_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if (!in_array($booking->status, self::HELPER_START_MOVING_FROM)) {
            if (in_array($booking->status, ['on_the_way', 'in_progress', 'completed'])) {
                return $this->successResponse($booking, 'Đã di chuyển thành công trước đó.');
            }
            return $this->errorResponse("Không thể bắt đầu di chuyển cho đơn đặt lịch ở trạng thái '{$booking->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $oldStatus       = $booking->status;
        $booking->status = 'on_the_way';
        $booking->save();

        $this->recordStatusHistory($booking->id, $oldStatus, 'on_the_way', $request->authUser['id'], 'Người giúp việc đang trên đường đến.');

        InternalNotificationService::sendToUser(
            $booking->customer_id,
            'Người giúp việc đang trên đường đến',
            "Người giúp việc đang di chuyển đến địa điểm cho đơn #{$booking->booking_code}.",
            'booking'
        );

        return $this->successResponse($booking->fresh(), 'Bắt đầu di chuyển thành công.');
    }

    /**
     * Helper checks in at the job location.
     */
    public function checkin(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('helper_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if (!in_array($booking->status, self::HELPER_CHECKIN_FROM)) {
            if (in_array($booking->status, ['in_progress', 'completed'])) {
                return $this->successResponse($booking, 'Đã điểm danh (check-in) thành công trước đó.');
            }
            return $this->errorResponse("Không thể điểm danh (check-in) cho đơn đặt lịch ở trạng thái '{$booking->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'photo_url' => 'nullable|string|max:500',
            'note'      => 'nullable|string|max:500',
        ]);

        $oldStatus       = $booking->status;
        $booking->status = 'in_progress';
        $booking->save();

        BookingWorkLog::create([
            'booking_id'    => $booking->id,
            'log_type'      => 'checkin',
            'logged_time'   => now(),
            'photo_url'     => $fields['photo_url'] ?? null,
            'note'          => $fields['note'] ?? null,
            'logged_by_user'=> $request->authUser['id'],
        ]);

        $this->recordStatusHistory($booking->id, $oldStatus, 'in_progress', $request->authUser['id'], 'Người giúp việc đã check-in và bắt đầu làm việc.');

        InternalNotificationService::sendToUser(
            $booking->customer_id,
            'Người giúp việc đã đến nơi',
            "Người giúp việc đã check-in và bắt đầu công việc cho đơn #{$booking->booking_code}.",
            'booking'
        );

        return $this->successResponse($booking->fresh(), 'Điểm danh (check-in) thành công.');
    }

    /**
     * Helper checks out after completing work.
     */
    public function checkout(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $booking = Booking::where('id', $id)
                          ->where('helper_id', $request->authUser['id'])
                          ->first();

        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if (!in_array($booking->status, self::HELPER_CHECKOUT_FROM)) {
            if ($booking->status === 'completed') {
                return $this->successResponse($booking, 'Đã hoàn thành công việc trước đó.');
            }
            return $this->errorResponse("Không thể hoàn thành (check-out) cho đơn đặt lịch ở trạng thái '{$booking->status}'.", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'photo_url' => 'nullable|string|max:500',
            'note'      => 'nullable|string|max:500',
        ]);

        $oldStatus       = $booking->status;
        $booking->status = 'completed';
        $booking->save();

        BookingWorkLog::create([
            'booking_id'    => $booking->id,
            'log_type'      => 'checkout',
            'logged_time'   => now(),
            'photo_url'     => $fields['photo_url'] ?? null,
            'note'          => $fields['note'] ?? null,
            'logged_by_user'=> $request->authUser['id'],
        ]);

        $this->recordStatusHistory($booking->id, $oldStatus, 'completed', $request->authUser['id'], 'Người giúp việc đã hoàn thành công việc.');
        $this->syncJobApplicationStatus($booking);

        InternalNotificationService::sendToUser(
            $booking->customer_id,
            'Công việc đã hoàn thành',
            "Người giúp việc đã hoàn thành đơn đặt lịch #{$booking->booking_code}. Vui lòng để lại đánh giá!",
            'booking'
        );

        return $this->successResponse($booking->fresh(), 'Hoàn thành công việc (check-out) thành công. Đơn đặt lịch đã hoàn tất.');
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Management & Dashboard
    // =====================================================================

    /**
     * List all bookings with filters.
     */
    public function adminIndex(Request $request)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $query = Booking::with(['services']);

        if ($request->filled('status'))      $query->where('status', $request->query('status'));
        if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));
        if ($request->filled('helper_id'))   $query->where('helper_id', $request->query('helper_id'));
        if ($request->filled('from_date'))   $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))     $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = $request->integer('limit', 20);
        $bookings = $query->orderByDesc('created_at')->paginate($limit);

        $customerIds = collect($bookings->items())->pluck('customer_id')->filter()->unique()->toArray();
        $helperIds   = collect($bookings->items())->pluck('helper_id')->filter()->unique()->toArray();
        $allUserIds  = array_unique(array_merge($customerIds, $helperIds));
        $userMap     = [];

        if (!empty($allUserIds)) {
            try {
                $response = Http::timeout(3)
                    ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => array_values($allUserIds)]);

                if ($response->successful()) {
                    $users = $response->json('data') ?? [];
                    foreach ($users as $u) {
                        $userMap[$u['id']] = $u;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Không thể lấy thông tin chi tiết người dùng cho adminIndex bookings: ' . $e->getMessage());
            }
        }

        foreach ($bookings->items() as $b) {
            $b->customer = $userMap[$b->customer_id] ?? null;
            $b->helper   = $userMap[$b->helper_id] ?? null;
        }

        return $this->successResponse($bookings);
    }

    /**
     * Get booking details with all relations.
     */
    public function adminShow(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $booking = Booking::with(['services', 'statusHistories', 'workLogs', 'reviews', 'reports'])->find($id);
        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        return $this->successResponse($booking);
    }

    /**
     * Admin/Operator updates booking status directly.
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $booking = Booking::find($id);
        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        $fields = $request->validate([
            'status' => 'required|string|in:pending,confirmed,on_the_way,in_progress,completed,cancelled',
            'note'   => 'nullable|string|max:500',
        ]);

        $oldStatus       = $booking->status;
        $booking->status = $fields['status'];
        $booking->save();

        $this->recordStatusHistory(
            $booking->id,
            $oldStatus,
            $fields['status'],
            $request->authUser['id'],
            $fields['note'] ?? 'Quản trị viên đã cập nhật trạng thái đơn.'
        );

        if ($fields['status'] === 'completed') {
            $this->syncJobApplicationStatus($booking);
        }

        return $this->successResponse($booking->fresh(), 'Đã cập nhật trạng thái đơn đặt lịch.');
    }

    /**
     * Overview stats for Admin dashboard.
     */
    public function dashboardOverview(Request $request)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $today = now()->toDateString();
        $totalBookings   = Booking::count();
        $completedCount  = Booking::where('status', 'completed')->count();
        $totalRevenue    = (float) Booking::where('status', 'completed')->sum('total_price');
        $activeHelpers   = Booking::whereNotNull('helper_id')->distinct('helper_id')->count('helper_id');
        $avgRating       = round((float) (Review::avg('rating') ?: 5.0), 1);

        // Fetch exact total revenue from payment-service stats for 100% cross-service synchronization
        $token = $request->header('Authorization');
        try {
            $paymentUrl = env('PAYMENT_SERVICE_URL', 'http://payment-service:8000');
            $payRes = Http::timeout(3)
                ->withHeaders($token ? ['Authorization' => $token] : [])
                ->get($paymentUrl . '/api/payments/admin/stats');
            if ($payRes->successful()) {
                $payStats = $payRes->json('data') ?? [];
                if (isset($payStats['total_revenue'])) {
                    $totalRevenue = (float) $payStats['total_revenue'];
                }
            }
        } catch (\Exception $e) {
            Log::error('DashboardOverview - Payment stats fetch error: ' . $e->getMessage());
        }

        // Dynamic Growth Calculation (% change over last 30 days vs prior 30 days)
        $last30Days = now()->subDays(30);
        $prev30Days = now()->subDays(60);

        $revenueCurrent = (float) Booking::where('status', 'completed')
            ->where('created_at', '>=', $last30Days)
            ->sum('total_price');
        $revenuePrev    = (float) Booking::where('status', 'completed')
            ->whereBetween('created_at', [$prev30Days, $last30Days])
            ->sum('total_price');
        $revenueChange  = $revenuePrev > 0
            ? round((($revenueCurrent - $revenuePrev) / $revenuePrev) * 100, 1)
            : ($revenueCurrent > 0 ? 100.0 : 0.0);

        $bookingsCurrent = Booking::where('created_at', '>=', $last30Days)->count();
        $bookingsPrev    = Booking::whereBetween('created_at', [$prev30Days, $last30Days])->count();
        $bookingsChange  = $bookingsPrev > 0
            ? round((($bookingsCurrent - $bookingsPrev) / $bookingsPrev) * 100, 1)
            : ($bookingsCurrent > 0 ? 100.0 : 0.0);

        // Fetch Service Titles Map from provider-service
        $serviceMap = [];
        try {
            $svcRes = Http::timeout(3)->get(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/services');
            if ($svcRes->successful()) {
                $svcs = $svcRes->json('data') ?? $svcRes->json() ?? [];
                if (is_array($svcs)) {
                    foreach ($svcs as $s) {
                        if (isset($s['id'])) {
                            $serviceMap[$s['id']] = $s['title'] ?? $s['name'] ?? ('Dịch vụ #' . $s['id']);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('DashboardOverview - Service names fetch error: ' . $e->getMessage());
        }

        $kpis = [
            [
                'type'       => 'revenue',
                'title'      => 'Tổng doanh thu',
                'value'      => $totalRevenue,
                'change'     => $revenueChange,
                'isPositive' => $revenueChange >= 0,
            ],
            [
                'type'       => 'bookings',
                'title'      => 'Tổng số đặt chỗ',
                'value'      => $totalBookings,
                'change'     => $bookingsChange,
                'isPositive' => $bookingsChange >= 0,
            ],
            [
                'type'       => 'helpers',
                'title'      => 'Cộng tác viên hoạt động',
                'value'      => $activeHelpers,
                'change'     => $activeHelpers,
                'isPositive' => true,
            ],
            [
                'type'       => 'satisfaction',
                'title'      => 'Mức độ hài lòng',
                'value'      => $avgRating . ' / 5.0',
                'change'     => (string) $avgRating,
                'isPositive' => true,
            ],
        ];

        // Weekly Bookings chart data (by day of week)
        $weeklyBookings = [];
        foreach ([2, 3, 4, 5, 6, 7, 1] as $d) {
            $weeklyBookings[] = [
                'day'   => $d,
                'count' => Booking::whereRaw('DAYOFWEEK(created_at) = ?', [$d])->count(),
            ];
        }

        // Service shares from real BookingServices in DB
        $servicesGrouped = BookingService::selectRaw('service_id, count(*) as total')
            ->groupBy('service_id')
            ->get();
        $serviceShares = [];
        foreach ($servicesGrouped as $sg) {
            $serviceShares[] = [
                'name'  => $serviceMap[$sg->service_id] ?? ('Dịch vụ #' . $sg->service_id),
                'value' => (int) $sg->total,
            ];
        }

        // Recent Bookings from DB (top 5)
        $recentBookings = [];
        $recentList = Booking::with('services')->latest()->take(5)->get();

        $customerIds = $recentList->pluck('customer_id')->filter()->unique()->toArray();
        $userMap = [];
        if (!empty($customerIds)) {
            try {
                $response = Http::timeout(3)
                    ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => array_values($customerIds)]);
                if ($response->successful()) {
                    $users = $response->json('data') ?? [];
                    foreach ($users as $u) {
                        $userMap[$u['id']] = $u['full_name'] ?? $u['email'];
                    }
                }
            } catch (\Exception $e) {}
        }

        foreach ($recentList as $b) {
            $firstService = $b->services->first();
            $serviceName = $firstService ? ($serviceMap[$firstService->service_id] ?? ('Dịch vụ #' . $firstService->service_id)) : 'Chưa phân loại';
            $recentBookings[] = [
                'customer' => $userMap[$b->customer_id] ?? ('Khách hàng #' . $b->customer_id),
                'service'  => $serviceName,
                'date'     => $b->booking_date ? \Carbon\Carbon::parse($b->booking_date)->format('Y-m-d') : $b->created_at->format('Y-m-d'),
                'price'    => (float) $b->total_price,
                'status'   => ucfirst($b->status),
            ];
        }

        $data = [
            'total_bookings'      => $totalBookings,
            'today_bookings'      => Booking::whereDate('created_at', $today)->count(),
            'pending_bookings'    => Booking::where('status', 'pending')->count(),
            'confirmed_bookings'  => Booking::where('status', 'confirmed')->count(),
            'in_progress_bookings'=> Booking::where('status', 'in_progress')->count(),
            'completed_bookings'  => $completedCount,
            'cancelled_bookings'  => Booking::where('status', 'cancelled')->count(),
            'total_revenue'       => $totalRevenue,
            'kpis'                => $kpis,
            'weeklyBookings'      => $weeklyBookings,
            'serviceShares'       => $serviceShares,
            'recentBookings'      => $recentBookings,
        ];

        return $this->successResponse($data);
    }

    /**
     * Internal endpoint called by payment-service when VNPay IPN succeeds.
     */
    public function updatePaymentStatus(Request $request)
    {
        $fields = $request->validate([
            'booking_id' => 'required|integer',
            'status'     => 'required|string',
        ]);

        $booking = Booking::find($fields['booking_id']);
        if (!$booking) {
            return $this->notFoundResponse('Không tìm thấy đơn đặt lịch.');
        }

        if ($fields['status'] === 'completed' && $booking->status === 'pending') {
            $oldStatus       = $booking->status;
            $booking->status = 'confirmed';
            $booking->save();

            $this->recordStatusHistory($booking->id, $oldStatus, 'confirmed', 0, 'Thanh toán VNPay thành công.');

            InternalNotificationService::sendToUser(
                $booking->customer_id,
                'Thanh toán thành công',
                "Đơn đặt lịch #{$booking->booking_code} đã được thanh toán thành công.",
                'payment'
            );

            if ($booking->helper_id) {
                InternalNotificationService::sendToUser(
                    $booking->helper_id,
                    'Công việc mới được xác nhận',
                    "Khách hàng đã thanh toán thành công cho đơn #{$booking->booking_code}.",
                    'booking'
                );
            }
        }

        return $this->successResponse(null, 'Đã xử lý trạng thái thanh toán.');
    }

    /**
     * Record a status change in booking_status_histories table.
     */
    private function recordStatusHistory(int $bookingId, ?string $oldStatus, string $newStatus, int $changedBy, ?string $note = null): void
    {
        BookingStatusHistory::create([
            'booking_id' => $bookingId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'note'       => $note,
        ]);
    }

    /**
     * Internal helper to sync job application status if booking belongs to a job post.
     */
    private function syncJobApplicationStatus(Booking $booking): void
    {
        if (preg_match('/\[Bài tuyển dụng:\s*([^\]]+)\]/', $booking->note ?? '', $matches)) {
            $jobTitle = trim($matches[1]);
            $jobPost  = \App\Models\JobPost::where('title', $jobTitle)
                                          ->where('customer_id', $booking->customer_id)
                                          ->first();
            if ($jobPost) {
                \App\Models\JobApplication::where('job_post_id', $jobPost->id)
                                          ->where('helper_id', $booking->helper_id)
                                          ->update(['status' => 'completed']);
            }
        }
    }

    /**
     * Internal endpoint: get stats for a helper (called by provider-service).
     */
    public function helperStats(Request $request, $helperId)
    {
        $completedCount = Booking::where('helper_id', $helperId)
                                 ->where('status', 'completed')
                                 ->count();

        $cancelledCount = Booking::where('helper_id', $helperId)
                                 ->where('status', 'cancelled')
                                 ->count();

        return $this->successResponse([
            'completed_bookings' => $completedCount,
            'cancelled_bookings' => $cancelledCount,
        ]);
    }
}
