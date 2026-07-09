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
     *
     * Body:
     * {
     *   "helper_id": 5,
     *   "address_id": 3,
     *   "booking_date": "2024-08-15",
     *   "start_time": "08:00",
     *   "note": "...",
     *   "services": [
     *     {"service_id": 1, "price": 200000, "duration_hours": 2, "quantity": 1}
     *   ]
     * }
     */
    public function store(Request $request)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Only customers can create bookings.'], Response::HTTP_FORBIDDEN);
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
                return response()->json([
                    'message' => 'Người giúp việc này hiện đang bận hoặc đã có lịch làm việc khác trùng thời gian này.'
                ], Response::HTTP_BAD_REQUEST);
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

        $this->recordStatusHistory($booking->id, null, 'pending', $request->authUser['id'], 'Booking created.');

        return response()->json([
            'message' => 'Booking created successfully.',
            'data'    => $booking->load('services'),
        ], Response::HTTP_CREATED);
    }

    /**
     * List the authenticated customer's own bookings.
     * Filter: status, from_date, to_date
     */
    public function myBookings(Request $request)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $query = Booking::with(['services'])
                        ->where('customer_id', $request->authUser['id']);

        if ($request->filled('status'))    $query->where('status', $request->query('status'));
        if ($request->filled('from_date')) $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))   $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = (int) $request->query('limit', 20);
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
                Log::error('Failed to fetch user details for myBookings: ' . $e->getMessage());
            }
        }

        foreach ($bookings->items() as $booking) {
            $booking->helper = $userMap[$booking->helper_id] ?? null;
        }

        return response()->json(['data' => $bookings], Response::HTTP_OK);
    }

    /**
     * Get booking detail — accessible to the booking's customer or assigned helper.
     */
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['services', 'statusHistories', 'workLogs', 'reviews'])->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);
        }

        $userId  = $request->authUser['id'];
        $roleId  = $request->authUser['role_id'];

        // Only the customer who owns it, the assigned helper, or admin/operator may view
        $allowed = in_array($roleId, [1, 2])
            || $booking->customer_id == $userId
            || $booking->helper_id  == $userId;

        if (!$allowed) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        return response()->json(['data' => $booking], Response::HTTP_OK);
    }

    /**
     * Customer cancels a booking.
     * Allowed when status in: pending, confirmed
     */
    public function cancel(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Only customers can cancel bookings.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)
                          ->where('customer_id', $request->authUser['id'])
                          ->first();

        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if (!in_array($booking->status, self::CUSTOMER_CANCEL_ALLOWED)) {
            return response()->json([
                'message' => "Cannot cancel a booking with status '{$booking->status}'."
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $old = $booking->status;
        $booking->update([
            'status'        => 'cancelled',
            'cancel_by'     => $request->authUser['id'],
            'cancel_reason' => $request->input('reason'),
        ]);

        $this->recordStatusHistory($booking->id, $old, 'cancelled', $request->authUser['id'], $request->input('reason'));

        return response()->json(['message' => 'Booking cancelled successfully.', 'data' => $booking->fresh()], Response::HTTP_OK);
    }

    /**
     * Customer submits a review after booking is completed.
     * One review per booking, rating 1–5.
     */
    public function review(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::CUSTOMER) {
            return response()->json(['message' => 'Only customers can submit reviews.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)
                          ->where('customer_id', $request->authUser['id'])
                          ->first();

        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'You can only review completed bookings.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Review::where('booking_id', $id)->where('customer_id', $request->authUser['id'])->exists()) {
            return response()->json(['message' => 'You have already reviewed this booking.'], Response::HTTP_CONFLICT);
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

        return response()->json(['message' => 'Review submitted successfully.', 'data' => $review], Response::HTTP_CREATED);
    }

    // =====================================================================
    //  HELPER — Booking management
    // =====================================================================

    /**
     * List bookings assigned to the authenticated helper.
     */
    public function helperBookings(Request $request)
    {
        if ($request->authUser['role_id'] !== Role::HELPER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $query = Booking::with(['services'])
                        ->where('helper_id', $request->authUser['id']);

        if ($request->filled('status'))    $query->where('status', $request->query('status'));
        if ($request->filled('from_date')) $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))   $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = (int) $request->query('limit', 20);
        $bookings = $query->orderBy('booking_date')->paginate($limit);

        // Fetch customer user info from identity-service internally
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
                Log::error('Failed to fetch user details for helperBookings: ' . $e->getMessage());
            }
        }

        foreach ($bookings->items() as $booking) {
            $booking->customer = $userMap[$booking->customer_id] ?? null;
        }

        return response()->json(['data' => $bookings], Response::HTTP_OK);
    }

    /**
     * Helper accepts a booking (pending → confirmed).
     */
    public function accept(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::HELPER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if (!in_array($booking->status, self::HELPER_ACCEPT_FROM)) {
            return response()->json(['message' => "Cannot accept a booking with status '{$booking->status}'."], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $old = $booking->status;
        $booking->update(['status' => 'confirmed']);
        $this->recordStatusHistory($booking->id, $old, 'confirmed', $request->authUser['id'], 'Helper accepted.');

        return response()->json(['message' => 'Booking accepted.', 'data' => $booking->fresh()], Response::HTTP_OK);
    }

    /**
     * Helper rejects a booking (pending → cancelled).
     */
    public function reject(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::HELPER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if (!in_array($booking->status, self::HELPER_REJECT_FROM)) {
            return response()->json(['message' => "Cannot reject a booking with status '{$booking->status}'."], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $old = $booking->status;
        $booking->update([
            'status'        => 'cancelled',
            'cancel_by'     => $request->authUser['id'],
            'cancel_reason' => $request->input('reason', 'Helper rejected.'),
        ]);

        $this->recordStatusHistory($booking->id, $old, 'cancelled', $request->authUser['id'], 'Helper rejected.');

        return response()->json(['message' => 'Booking rejected.', 'data' => $booking->fresh()], Response::HTTP_OK);
    }

    /**
     * Helper starts moving (confirmed → on_the_way).
     */
    public function startMoving(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::HELPER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if (!in_array($booking->status, self::HELPER_START_MOVING_FROM)) {
            return response()->json(['message' => "Cannot start moving for a booking with status '{$booking->status}'."], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $old = $booking->status;
        $booking->update(['status' => 'on_the_way']);
        $this->recordStatusHistory($booking->id, $old, 'on_the_way', $request->authUser['id'], 'Helper started moving.');

        // Notify Customer
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $booking->customer_id,
                'title'   => 'Người giúp việc đang di chuyển',
                'message' => 'Người giúp việc đang trên đường đến địa chỉ của bạn.',
                'type'    => 'booking',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify customer helper moving: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Started moving.', 'data' => $booking->fresh()], Response::HTTP_OK);
    }

    /**
     * Helper checks in — records start time and sets status to in_progress.
     */
    public function checkin(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::HELPER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if (!in_array($booking->status, self::HELPER_CHECKIN_FROM)) {
            return response()->json(['message' => "Cannot check in for a booking with status '{$booking->status}'."], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $workLog = BookingWorkLog::create([
            'booking_id'   => $id,
            'helper_id'    => $request->authUser['id'],
            'checkin_time' => now(),
            'status'       => 'in_progress',
        ]);

        $old = $booking->status;
        $booking->update(['status' => 'in_progress']);
        $this->recordStatusHistory($booking->id, $old, 'in_progress', $request->authUser['id'], 'Helper checked in.');

        // Notify Customer
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $booking->customer_id,
                'title'   => 'Người giúp việc đã đến nơi',
                'message' => 'Người giúp việc đã đến địa chỉ của bạn và bắt đầu công việc.',
                'type'    => 'booking',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify customer helper checkin: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Checked in successfully.', 'data' => $workLog], Response::HTTP_OK);
    }

    /**
     * Helper checks out — records end time and marks booking as completed.
     */
    public function checkout(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::HELPER) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        if (!in_array($booking->status, self::HELPER_CHECKOUT_FROM)) {
            return response()->json(['message' => "Cannot check out from a booking with status '{$booking->status}'."], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Find the open work log
        $workLog = BookingWorkLog::where('booking_id', $id)
                                 ->where('helper_id', $request->authUser['id'])
                                 ->whereNull('checkout_time')
                                 ->latest('checkin_time')
                                 ->first();

        if ($workLog) {
            $workLog->update(['checkout_time' => now(), 'status' => 'completed']);
        }

        $request->validate(['note' => 'nullable|string|max:500']);

        $old = $booking->status;
        $booking->update(['status' => 'completed']);
        $this->recordStatusHistory($booking->id, $old, 'completed', $request->authUser['id'],
            $request->input('note', 'Helper checked out.'));

        // Notify Customer
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $booking->customer_id,
                'title'   => 'Công việc đã hoàn thành',
                'message' => 'Người giúp việc đã hoàn thành công việc. Vui lòng đánh giá chất lượng dịch vụ.',
                'type'    => 'booking',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify customer helper checkout: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Checked out successfully. Booking completed.', 'data' => $booking->fresh()], Response::HTTP_OK);
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Full management
    // =====================================================================

    /**
     * List all bookings with filters.
     * Role: admin (1) or operator (4)
     */
    public function adminIndex(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $query = Booking::with(['services']);

        if ($request->filled('ids')) {
            $ids = explode(',', $request->query('ids'));
            $query->whereIn('id', $ids);
        }

        if ($request->filled('status'))      $query->where('status', $request->query('status'));
        if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));
        if ($request->filled('helper_id'))   $query->where('helper_id', $request->query('helper_id'));
        if ($request->filled('from_date'))   $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))     $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = (int) $request->query('limit', 20);
        $bookings = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $bookings], Response::HTTP_OK);
    }

    /**
     * Get full booking detail including status history.
     * Role: admin (1) or operator (4)
     */
    public function adminShow(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::with(['services', 'statusHistories', 'workLogs', 'reviews', 'reports'])->find($id);
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        return response()->json(['data' => $booking], Response::HTTP_OK);
    }

    /**
     * Admin manually overrides booking status.
     * Role: admin (1) only
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== Role::ADMIN) {
            return response()->json(['message' => 'Only administrators can override booking status.'], Response::HTTP_FORBIDDEN);
        }

        $booking = Booking::find($id);
        if (!$booking) return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);

        $fields = $request->validate([
            'new_status' => 'required|string|in:pending,confirmed,in_progress,completed,cancelled',
            'note'       => 'nullable|string|max:500',
        ]);

        $old = $booking->status;
        $booking->update(['status' => $fields['new_status']]);
        $this->recordStatusHistory($booking->id, $old, $fields['new_status'], $request->authUser['id'],
            $fields['note'] ?? 'Admin override.');

        return response()->json(['message' => 'Booking status updated.', 'data' => $booking->fresh()], Response::HTTP_OK);
    }

    /**
     * Lấy dữ liệu tổng quan Dashboard cho Admin/Operator.
     */
    public function dashboardOverview(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $authHeader = $request->header('Authorization');

        // 1. Doanh thu & Thay đổi doanh thu
        $totalRevenue = 0;
        $revenueChangePercent = 0;
        try {
            $revenueResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get(env('PAYMENT_SERVICE_URL', 'http://payment-service:8000') . '/api/payments/admin/stats');
            if ($revenueResponse->successful()) {
                $revData = $revenueResponse->json('data');
                $totalRevenue = $revData['total_revenue'] ?? 0;
                $revenueChangePercent = $revData['change_percent'] ?? 0;
            } else {
                throw new \Exception('Failed to fetch from payment service');
            }
        } catch (\Exception $e) {
            $totalRevenue = Booking::whereIn('status', ['completed', 'confirmed'])->sum('total_price');
            $thisMonth = now()->startOfMonth();
            $lastMonth = now()->subMonth()->startOfMonth();
            $thisMonthRevenue = Booking::whereIn('status', ['completed', 'confirmed'])->where('booking_date', '>=', $thisMonth->toDateString())->sum('total_price');
            $lastMonthRevenue = Booking::whereIn('status', ['completed', 'confirmed'])->where('booking_date', '>=', $lastMonth->toDateString())->where('booking_date', '<', $thisMonth->toDateString())->sum('total_price');
            if ($lastMonthRevenue > 0) {
                $revenueChangePercent = (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
            } elseif ($thisMonthRevenue > 0) {
                $revenueChangePercent = 100;
            }
        }

        // 2. Tổng số Bookings & Thay đổi bookings
        $totalBookings = Booking::count();
        $thisMonthBookings = Booking::where('booking_date', '>=', now()->startOfMonth()->toDateString())->count();
        $lastMonthBookings = Booking::where('booking_date', '>=', now()->subMonth()->startOfMonth()->toDateString())
            ->where('booking_date', '<', now()->startOfMonth()->toDateString())->count();
        $bookingsChangePercent = 0;
        if ($lastMonthBookings > 0) {
            $bookingsChangePercent = (($thisMonthBookings - $lastMonthBookings) / $lastMonthBookings) * 100;
        } elseif ($thisMonthBookings > 0) {
            $bookingsChangePercent = 100;
        }

        // 3. Số lượng Helper hoạt động
        $activeHelpers = 0;
        $helpersChangeStr = "+0 new";
        try {
            $helperStatsResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/admin/helpers/stats');
            if ($helperStatsResponse->successful()) {
                $activeHelpers = $helperStatsResponse->json('data.active') ?? 0;
                $pendingVerifications = $helperStatsResponse->json('data.pending_verifications') ?? 0;
                $helpersChangeStr = "+" . $pendingVerifications . " pending";
            } else {
                throw new \Exception('Failed to fetch helper stats');
            }
        } catch (\Exception $e) {
            $activeHelpers = Booking::whereNotNull('helper_id')->distinct('helper_id')->count('helper_id');
            $helpersChangeStr = "active";
        }

        // 4. Mức độ hài lòng (Reviews)
        $avgRating = Review::avg('rating');
        $avgRating = $avgRating ? round($avgRating, 1) : 5.0;
        $satisfactionPercent = ($avgRating / 5) * 100;
        $satisfactionStr = number_format($satisfactionPercent, 1) . "%";

        // 5. Weekly Booking Activity
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $bookingsByDay = Booking::whereBetween('booking_date', [$startOfWeek->toDateString(), $endOfWeek->toDateString()])
            ->selectRaw('DAYOFWEEK(booking_date) as day_num, COUNT(*) as count')
            ->groupBy('day_num')
            ->pluck('count', 'day_num')
            ->toArray();

        $dayMap = [
            2 => 'Mon',
            3 => 'Tue',
            4 => 'Wed',
            5 => 'Thu',
            6 => 'Fri',
            7 => 'Sat',
            1 => 'Sun'
        ];

        $weeklyBookings = [];
        foreach ($dayMap as $num => $dayName) {
            $weeklyBookings[] = [
                'day' => $dayName,
                'count' => $bookingsByDay[$num] ?? 0
            ];
        }

        // 6. Service category shares
        $serviceCategoryMap = [];
        $serviceNameMap = [];
        try {
            $servicesResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/services?limit=1000');
            if ($servicesResponse->successful()) {
                $servicesData = $servicesResponse->json('data.data') ?? [];
                foreach ($servicesData as $svc) {
                    if (isset($svc['id'])) {
                        if (isset($svc['category']['name'])) {
                            $serviceCategoryMap[$svc['id']] = $svc['category']['name'];
                        }
                        if (isset($svc['name'])) {
                            $serviceNameMap[$svc['id']] = $svc['name'];
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // ignore
        }

        $bookingServicesCounts = BookingService::select('service_id', \DB::raw('COUNT(*) as count'))
            ->groupBy('service_id')
            ->get();

        $shares = [];
        foreach ($bookingServicesCounts as $bs) {
            $categoryName = $serviceCategoryMap[$bs->service_id] ?? 'Others';
            if (!isset($shares[$categoryName])) {
                $shares[$categoryName] = 0;
            }
            $shares[$categoryName] += $bs->count;
        }

        $serviceShares = [];
        foreach ($shares as $name => $val) {
            $serviceShares[] = [
                'name' => $name,
                'value' => (int) $val
            ];
        }

        $defaultCategories = ['Cleaning', 'Repair', 'Care', 'Others'];
        foreach ($defaultCategories as $cat) {
            $found = false;
            foreach ($serviceShares as $share) {
                if ($share['name'] === $cat) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $serviceShares[] = [
                    'name' => $cat,
                    'value' => 0
                ];
            }
        }

        // 7. Recent Bookings
        $userNameMap = [];
        try {
            $usersResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/admin/users?limit=1000');
            if ($usersResponse->successful()) {
                $usersData = $usersResponse->json('data.data') ?? [];
                foreach ($usersData as $user) {
                    if (isset($user['id']) && isset($user['name'])) {
                        $userNameMap[$user['id']] = $user['name'];
                    }
                }
            }
        } catch (\Exception $e) {
            // ignore
        }

        $recentBookingsRaw = Booking::with('services')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $recentBookings = [];
        foreach ($recentBookingsRaw as $b) {
            $svcNames = [];
            foreach ($b->services as $bs) {
                $svcNames[] = $serviceNameMap[$bs->service_id] ?? 'Dịch vụ #' . $bs->service_id;
            }
            $serviceStr = implode(', ', $svcNames);
            if (empty($serviceStr)) {
                $serviceStr = 'Không có dịch vụ';
            }

            $statusMap = [
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'in_progress' => 'Confirmed',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
            ];
            $displayStatus = $statusMap[$b->status] ?? ucfirst($b->status);

            $recentBookings[] = [
                'customer' => $userNameMap[$b->customer_id] ?? 'Khách hàng #' . $b->customer_id,
                'service' => $serviceStr,
                'date' => \Carbon\Carbon::parse($b->booking_date)->format('F j, Y'),
                'price' => (float) $b->total_price,
                'status' => $displayStatus
            ];
        }

        return response()->json([
            'kpis' => [
                [
                    'title' => 'Total Revenue',
                    'value' => (float) $totalRevenue,
                    'change' => ($revenueChangePercent >= 0 ? '+' : '') . $revenueChangePercent . '%',
                    'isPositive' => $revenueChangePercent >= 0,
                ],
                [
                    'title' => 'Bookings',
                    'value' => $totalBookings,
                    'change' => ($bookingsChangePercent >= 0 ? '+' : '') . $bookingsChangePercent . '%',
                    'isPositive' => $bookingsChangePercent >= 0,
                ],
                [
                    'title' => 'Active Helpers',
                    'value' => $activeHelpers,
                    'change' => $helpersChangeStr,
                    'isPositive' => true,
                ],
                [
                    'title' => 'Satisfaction',
                    'value' => $satisfactionStr,
                    'change' => 'Avg ' . $avgRating . '★',
                    'isPositive' => true,
                ]
            ],
            'weeklyBookings' => $weeklyBookings,
            'serviceShares' => $serviceShares,
            'recentBookings' => $recentBookings
        ], Response::HTTP_OK);
    }

    // =====================================================================
    //  PRIVATE HELPERS
    // =====================================================================

    public function updatePaymentStatus(Request $request)
    {
        $fields = $request->validate([
            'booking_id' => 'required|integer',
            'status'     => 'required|string',
        ]);

        $booking = Booking::find($fields['booking_id']);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], Response::HTTP_NOT_FOUND);
        }

        $oldStatus = $booking->status;

        // If payment is completed and booking is pending, mark it confirmed
        if ($fields['status'] === 'completed' && $booking->status === 'pending') {
            $booking->update(['status' => 'confirmed']);
            $this->recordStatusHistory($booking->id, $oldStatus, 'confirmed', 0, 'Thanh toán thành công.');

            // Send notification to Customer
            try {
                Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                    'user_id' => $booking->customer_id,
                    'title'   => 'Thanh toán thành công',
                    'message' => 'Bạn đã thanh toán thành công cho đơn đặt lịch ' . ($booking->booking_code ?: '#' . $booking->id) . '. Lịch hẹn đã được xác nhận.',
                    'type'    => 'payment',
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to notify customer payment success: ' . $e->getMessage());
            }

            // Send notification to Helper
            if ($booking->helper_id) {
                try {
                    Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                        'user_id' => $booking->helper_id,
                        'title'   => 'Lịch hẹn được xác nhận',
                        'message' => 'Khách hàng đã thanh toán thành công cho đơn đặt lịch ' . ($booking->booking_code ?: '#' . $booking->id) . '. Lịch hẹn đã được xác nhận.',
                        'type'    => 'booking',
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to notify helper payment success: ' . $e->getMessage());
                }
            }

            // Send socket real-time update
            try {
                Http::post(env('SOCKET_SERVICE_URL', 'http://socket-service:3000') . '/publish', [
                    'event' => 'booking_updated',
                    'data' => [
                        'booking_id'  => $booking->id,
                        'status'      => 'confirmed',
                        'helper_id'   => $booking->helper_id,
                        'customer_id' => $booking->customer_id
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to publish booking payment update to socket: ' . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Payment status processed.'], Response::HTTP_OK);
    }

    private function recordStatusHistory(int $bookingId, ?string $old, string $new, int $changedBy, ?string $note): void
    {
        BookingStatusHistory::create([
            'booking_id' => $bookingId,
            'old_status' => $old,
            'new_status' => $new,
            'changed_by' => $changedBy,
            'note'       => $note,
        ]);
    }
}
