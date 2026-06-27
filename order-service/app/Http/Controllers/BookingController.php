<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\BookingStatusHistory;
use App\Models\BookingWorkLog;
use App\Models\Review;

class BookingController extends Controller
{
    // =====================================================================
    //  HELPER — Status transition rules
    // =====================================================================

    /** Valid status transitions per actor */
    private const CUSTOMER_CANCEL_ALLOWED = ['pending', 'confirmed'];
    private const HELPER_ACCEPT_FROM      = ['pending'];
    private const HELPER_REJECT_FROM      = ['pending'];
    private const HELPER_CHECKIN_FROM     = ['confirmed'];
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
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can create bookings.'], 403);
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
        ], 201);
    }

    /**
     * List the authenticated customer's own bookings.
     * Filter: status, from_date, to_date
     */
    public function myBookings(Request $request)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = Booking::with(['services'])
                        ->where('customer_id', $request->authUser['id']);

        if ($request->filled('status'))    $query->where('status', $request->query('status'));
        if ($request->filled('from_date')) $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))   $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = (int) $request->query('limit', 20);
        $bookings = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $bookings], 200);
    }

    /**
     * Get booking detail — accessible to the booking's customer or assigned helper.
     */
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['services', 'statusHistories', 'workLogs', 'reviews'])->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $userId  = $request->authUser['id'];
        $roleId  = $request->authUser['role_id'];

        // Only the customer who owns it, the assigned helper, or admin/operator may view
        $allowed = in_array($roleId, [1, 2])
            || $booking->customer_id == $userId
            || $booking->helper_id  == $userId;

        if (!$allowed) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => $booking], 200);
    }

    /**
     * Customer cancels a booking.
     * Allowed when status in: pending, confirmed
     */
    public function cancel(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can cancel bookings.'], 403);
        }

        $booking = Booking::where('id', $id)
                          ->where('customer_id', $request->authUser['id'])
                          ->first();

        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        if (!in_array($booking->status, self::CUSTOMER_CANCEL_ALLOWED)) {
            return response()->json([
                'message' => "Cannot cancel a booking with status '{$booking->status}'."
            ], 422);
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $old = $booking->status;
        $booking->update([
            'status'        => 'cancelled',
            'cancel_by'     => $request->authUser['id'],
            'cancel_reason' => $request->input('reason'),
        ]);

        $this->recordStatusHistory($booking->id, $old, 'cancelled', $request->authUser['id'], $request->input('reason'));

        return response()->json(['message' => 'Booking cancelled successfully.', 'data' => $booking->fresh()], 200);
    }

    /**
     * Customer submits a review after booking is completed.
     * One review per booking, rating 1–5.
     */
    public function review(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can submit reviews.'], 403);
        }

        $booking = Booking::where('id', $id)
                          ->where('customer_id', $request->authUser['id'])
                          ->first();

        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'You can only review completed bookings.'], 422);
        }

        if (Review::where('booking_id', $id)->where('customer_id', $request->authUser['id'])->exists()) {
            return response()->json(['message' => 'You have already reviewed this booking.'], 409);
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

        return response()->json(['message' => 'Review submitted successfully.', 'data' => $review], 201);
    }

    // =====================================================================
    //  HELPER — Booking management
    // =====================================================================

    /**
     * List bookings assigned to the authenticated helper.
     */
    public function helperBookings(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = Booking::with(['services'])
                        ->where('helper_id', $request->authUser['id']);

        if ($request->filled('status'))    $query->where('status', $request->query('status'));
        if ($request->filled('from_date')) $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))   $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = (int) $request->query('limit', 20);
        $bookings = $query->orderBy('booking_date')->paginate($limit);

        return response()->json(['data' => $bookings], 200);
    }

    /**
     * Helper accepts a booking (pending → confirmed).
     */
    public function accept(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        if (!in_array($booking->status, self::HELPER_ACCEPT_FROM)) {
            return response()->json(['message' => "Cannot accept a booking with status '{$booking->status}'."], 422);
        }

        $old = $booking->status;
        $booking->update(['status' => 'confirmed']);
        $this->recordStatusHistory($booking->id, $old, 'confirmed', $request->authUser['id'], 'Helper accepted.');

        return response()->json(['message' => 'Booking accepted.', 'data' => $booking->fresh()], 200);
    }

    /**
     * Helper rejects a booking (pending → cancelled).
     */
    public function reject(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        if (!in_array($booking->status, self::HELPER_REJECT_FROM)) {
            return response()->json(['message' => "Cannot reject a booking with status '{$booking->status}'."], 422);
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $old = $booking->status;
        $booking->update([
            'status'        => 'cancelled',
            'cancel_by'     => $request->authUser['id'],
            'cancel_reason' => $request->input('reason', 'Helper rejected.'),
        ]);

        $this->recordStatusHistory($booking->id, $old, 'cancelled', $request->authUser['id'], 'Helper rejected.');

        return response()->json(['message' => 'Booking rejected.', 'data' => $booking->fresh()], 200);
    }

    /**
     * Helper checks in — records start time and sets status to in_progress.
     */
    public function checkin(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        if (!in_array($booking->status, self::HELPER_CHECKIN_FROM)) {
            return response()->json(['message' => "Cannot check in for a booking with status '{$booking->status}'."], 422);
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

        return response()->json(['message' => 'Checked in successfully.', 'data' => $workLog], 200);
    }

    /**
     * Helper checks out — records end time and marks booking as completed.
     */
    public function checkout(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking = Booking::where('id', $id)->where('helper_id', $request->authUser['id'])->first();
        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        if (!in_array($booking->status, self::HELPER_CHECKOUT_FROM)) {
            return response()->json(['message' => "Cannot check out from a booking with status '{$booking->status}'."], 422);
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

        return response()->json(['message' => 'Checked out successfully. Booking completed.', 'data' => $booking->fresh()], 200);
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
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = Booking::with(['services']);

        if ($request->filled('status'))      $query->where('status', $request->query('status'));
        if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));
        if ($request->filled('helper_id'))   $query->where('helper_id', $request->query('helper_id'));
        if ($request->filled('from_date'))   $query->where('booking_date', '>=', $request->query('from_date'));
        if ($request->filled('to_date'))     $query->where('booking_date', '<=', $request->query('to_date'));

        $limit    = (int) $request->query('limit', 20);
        $bookings = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $bookings], 200);
    }

    /**
     * Get full booking detail including status history.
     * Role: admin (1) or operator (4)
     */
    public function adminShow(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking = Booking::with(['services', 'statusHistories', 'workLogs', 'reviews', 'reports'])->find($id);
        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        return response()->json(['data' => $booking], 200);
    }

    /**
     * Admin manually overrides booking status.
     * Role: admin (1) only
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Only administrators can override booking status.'], 403);
        }

        $booking = Booking::find($id);
        if (!$booking) return response()->json(['message' => 'Booking not found.'], 404);

        $fields = $request->validate([
            'new_status' => 'required|string|in:pending,confirmed,in_progress,completed,cancelled',
            'note'       => 'nullable|string|max:500',
        ]);

        $old = $booking->status;
        $booking->update(['status' => $fields['new_status']]);
        $this->recordStatusHistory($booking->id, $old, $fields['new_status'], $request->authUser['id'],
            $fields['note'] ?? 'Admin override.');

        return response()->json(['message' => 'Booking status updated.', 'data' => $booking->fresh()], 200);
    }

    /**
     * Lấy dữ liệu tổng quan Dashboard cho Admin/Operator.
     */
    public function dashboardOverview(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $authHeader = $request->header('Authorization');

        // 1. Doanh thu & Thay đổi doanh thu
        $totalRevenue = 0;
        $revenueChangePercent = 0;
        try {
            $revenueResponse = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get('http://payment-service:8000/api/payments/admin/stats');
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
            $helperStatsResponse = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get('http://provider-service:8000/api/providers/admin/helpers/stats');
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
            $servicesResponse = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get('http://provider-service:8000/api/providers/services?limit=1000');
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
            $usersResponse = \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->get('http://identity-service:8000/api/admin/users?limit=1000');
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
        ], 200);
    }

    // =====================================================================
    //  PRIVATE HELPERS
    // =====================================================================

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
