<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobPost;
use App\Models\JobPostService;
use App\Models\JobApplication;
use App\Models\Review;
use App\Models\Booking;
use App\Models\BookingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class JobPostController extends Controller
{
    // =====================================================================
    //  PUBLIC — Browse job posts (no auth required)
    // =====================================================================

    /**
     * Browse open job posts.
     * Filter: city, district, category_id, min_salary, max_salary
     */
    public function index(Request $request)
    {
        $query = JobPost::with(['services'])
                        ->where('status', 'open')
                        ->where(function ($q) {
                            $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                        });

        if ($request->filled('city'))        $query->where('city', $request->query('city'));
        if ($request->filled('district'))    $query->where('district', $request->query('district'));
        if ($request->filled('category_id')) $query->where('category_id', $request->query('category_id'));
        if ($request->filled('min_salary'))  $query->where('salary', '>=', (float) $request->query('min_salary'));
        if ($request->filled('max_salary'))  $query->where('salary', '<=', (float) $request->query('max_salary'));

        $limit = (int) $request->query('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $posts], 200);
    }

    /**
     * Get public detail of a single job post.
     */
    public function show($id)
    {
        $post = JobPost::with(['services', 'applications'])
                       ->where('status', 'open')
                       ->find($id);

        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        return response()->json(['data' => $post], 200);
    }

    // =====================================================================
    //  CUSTOMER — Manage own job posts (role_id=4)
    // =====================================================================

    /**
     * List the authenticated customer's own job posts.
     */
    public function myPosts(Request $request)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can manage job posts.'], 403);
        }

        $query = JobPost::with(['services'])
                        ->where('customer_id', $request->authUser['id']);

        if ($request->filled('status')) $query->where('status', $request->query('status'));

        $limit = (int) $request->query('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $posts], 200);
    }

    public function store(Request $request)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can post jobs.'], 403);
        }

        // Bắt buộc khách hàng hoàn thiện thông tin trước khi đăng bài
        try {
            $statusResponse = Http::timeout(3)
                ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/customer/profile-status', [
                    'user_id' => $request->authUser['id']
                ]);

            if ($statusResponse->successful()) {
                $statusData = $statusResponse->json();
                if (isset($statusData['is_complete']) && !$statusData['is_complete']) {
                    return response()->json([
                        'message' => 'Vui lòng hoàn thiện hồ sơ trước khi đăng bài tuyển dụng: ' . $statusData['message']
                    ], 400);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to validate customer profile completeness: ' . $e->getMessage());
        }

        $fields = $request->validate([
            'title'        => 'required|string|max:150',
            'description'  => 'nullable|string',
            'category_id'  => 'nullable|integer',
            'salary'       => 'nullable|numeric|min:0',
            'address'      => 'nullable|string|max:255',
            'district'     => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'working_time' => 'nullable|string|max:255',
            'expired_at'   => 'nullable|date|after:today',
            'service_ids'  => 'nullable|array',
            'service_ids.*'=> 'integer',
        ]);

        $post = JobPost::create([
            'customer_id'  => $request->authUser['id'],
            'category_id'  => $fields['category_id'] ?? null,
            'title'        => $fields['title'],
            'description'  => $fields['description'] ?? null,
            'salary'       => $fields['salary'] ?? null,
            'address'      => $fields['address'] ?? null,
            'district'     => $fields['district'] ?? null,
            'city'         => $fields['city'] ?? null,
            'working_time' => $fields['working_time'] ?? null,
            'status'       => 'open',
            'expired_at'   => $fields['expired_at'] ?? null,
        ]);

        if (!empty($fields['service_ids'])) {
            foreach (array_unique($fields['service_ids']) as $serviceId) {
                JobPostService::firstOrCreate([
                    'job_post_id' => $post->id,
                    'service_id'  => $serviceId,
                ]);
            }
        }

        // --- thông báo socket io (chỉ phát sự kiện realtime, không lưu db notification toàn bộ) ---
        try {
            $post->refresh();
            Http::post(env('SOCKET_SERVICE_URL', 'http://socket-service:3000') . '/publish', [
                'event' => 'new_job_post',
                'data'  => $post->load('services'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify helpers of new job post via socket: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Job post created successfully.',
            'data'    => $post->load('services'),
        ], 201);
    }

    /**
     * Customer updates their own job post (only if status is open).
     */
    public function update(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        if ($post->status !== 'open') {
            return response()->json(['message' => 'Only open job posts can be edited.'], 422);
        }

        $fields = $request->validate([
            'title'        => 'sometimes|required|string|max:150',
            'description'  => 'sometimes|nullable|string',
            'category_id'  => 'sometimes|nullable|integer',
            'salary'       => 'sometimes|nullable|numeric|min:0',
            'address'      => 'sometimes|nullable|string|max:255',
            'district'     => 'sometimes|nullable|string|max:100',
            'city'         => 'sometimes|nullable|string|max:100',
            'working_time' => 'sometimes|nullable|string|max:255',
            'expired_at'   => 'sometimes|nullable|date|after:today',
        ]);

        $post->update($fields);

        return response()->json([
            'message' => 'Job post updated successfully.',
            'data'    => $post->fresh(['services']),
        ], 200);
    }

    /**
     * Customer closes their own job post.
     */
    public function close(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        $post->update(['status' => 'closed']);

        return response()->json(['message' => 'Job post closed.', 'data' => $post->fresh()], 200);
    }

    /**
     * Customer deletes their own job post.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        $post->delete();

        return response()->json(['message' => 'Job post deleted.'], 200);
    }

    /**
     * Customer views applications on their job post.
     */
    public function applications(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        $apps = JobApplication::where('job_post_id', $id)
                              ->orderByDesc('created_at')
                              ->get();

        $helperIds = $apps->pluck('helper_id')->unique()->toArray();
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
                Log::error('Failed to fetch user details for applications: ' . $e->getMessage());
            }
        }

        foreach ($apps as $app) {
            $helperInfo = $userMap[$app->helper_id] ?? null;
            if ($helperInfo) {
                $app->helper = $helperInfo;
            } else {
                $app->helper = null;
            }
        }

        return response()->json(['data' => $apps], 200);
    }

    /**
     * Customer selects a helper from the applicants.
     * Sets selected_helper_id and changes post status to closed.
     */
    public function selectHelper(Request $request, $id, $helperId)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        if ($post->status !== 'open') {
            return response()->json(['message' => 'Can only select a helper for open job posts.'], 422);
        }

        $application = JobApplication::where('job_post_id', $id)
                                     ->where('helper_id', $helperId)
                                     ->where('status', 'pending')
                                     ->first();

        if (!$application) {
            return response()->json(['message' => 'No pending application from this helper.'], 404);
        }

        // Set this application status to selected
        $application->update(['status' => 'selected']);

        // Temporarily close the job post and link the selected helper
        $post->update([
            'selected_helper_id' => $helperId,
            'status'             => 'closed',
        ]);

        // Send notification to selected helper
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $helperId,
                'title'   => 'Bạn được mời nhận công việc',
                'message' => 'Khách hàng đã chọn bạn cho công việc: ' . $post->title . '. Vui lòng phản hồi Đồng ý hoặc Từ chối.',
                'type'    => 'recruitment',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify accepted helper: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Helper selected. Waiting for helper approval.',
            'data'    => $application,
        ], 200);
    }

    /**
     * Helper responds to Customer's invitation (accept / reject).
     */
    public function respondToSelection(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $fields = $request->validate([
            'action' => 'required|string|in:accept,reject',
        ]);

        $application = JobApplication::where('id', $id)
                                     ->where('helper_id', $request->authUser['id'])
                                     ->where('status', 'selected')
                                     ->first();

        if (!$application) {
            return response()->json(['message' => 'No selected application found to respond to.'], 404);
        }

        $post = JobPost::find($application->job_post_id);
        if (!$post) {
            return response()->json(['message' => 'Job post not found.'], 404);
        }

        if ($fields['action'] === 'accept') {
            // Update this application status to accepted
            $application->update(['status' => 'accepted']);

            // Reject all other applications for this job post
            JobApplication::where('job_post_id', $post->id)
                          ->where('helper_id', '!=', $request->authUser['id'])
                          ->where('status', 'pending')
                          ->update(['status' => 'rejected']);

            // Create matching Booking record with 'pending' status (unpaid)
            $bookingDate = now()->addDay()->toDateString();
            $startTime = '08:00:00';
            if ($post->working_time) {
                $parsedTime = strtotime($post->working_time);
                if ($parsedTime !== false) {
                    $bookingDate = date('Y-m-d', $parsedTime);
                    $startTime = date('H:i:s', $parsedTime);
                }
            }

            $booking = Booking::create([
                'booking_code' => 'BK-' . strtoupper(Str::random(8)),
                'customer_id'  => $post->customer_id,
                'helper_id'    => $request->authUser['id'],
                'address_id'   => 0,
                'booking_date' => $bookingDate,
                'start_time'   => $startTime,
                'total_price'  => $post->salary ?? 0,
                'status'       => 'pending',
                'note'         => '[Bài tuyển dụng: ' . $post->title . '] ' . $post->description,
                'refund_status'=> 'none',
            ]);

            // Link services
            $postServices = JobPostService::where('job_post_id', $post->id)->get();
            if ($postServices->count() > 0) {
                foreach ($postServices as $index => $ps) {
                    BookingService::create([
                        'booking_id'     => $booking->id,
                        'service_id'     => $ps->service_id,
                        'price'          => ($post->salary ?? 0) / $postServices->count(),
                        'duration_hours' => 2,
                        'quantity'       => 1,
                        'service_order'  => $index + 1,
                    ]);
                }
            }

            // Send notification to customer
            try {
                Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                    'user_id' => $post->customer_id,
                    'title'   => 'Người giúp việc đã đồng ý nhận công việc',
                    'message' => 'Người giúp việc đã đồng ý nhận công việc: ' . $post->title . '. Vui lòng thanh toán trong 30 phút.',
                    'type'    => 'booking',
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to notify customer helper agreement: ' . $e->getMessage());
            }

            return response()->json([
                'message'    => 'Invitation accepted. Booking created in pending payment status.',
                'data'       => $application,
                'booking_id' => $booking->id,
            ], 200);

        } else {
            // Reject invitation
            $application->update(['status' => 'rejected']);

            // Reopen the job post and clear selected helper
            $post->update([
                'selected_helper_id' => null,
                'status'             => 'open',
            ]);

            // Send notification to customer
            try {
                Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                    'user_id' => $post->customer_id,
                    'title'   => 'Người giúp việc từ chối lời mời',
                    'message' => 'Người giúp việc đã từ chối nhận công việc: ' . $post->title . '. Vui lòng chọn người giúp việc khác.',
                    'type'    => 'recruitment',
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to notify customer helper rejection: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Invitation declined. Job post reopened.',
                'data'    => $application,
            ], 200);
        }
    }

    /**
     * Customer rejects a helper application.
     */
    public function rejectHelper(Request $request, $id, $helperId)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        if ($post->status !== 'open') {
            return response()->json(['message' => 'Can only manage helper applications for open job posts.'], 422);
        }

        $application = JobApplication::where('job_post_id', $id)
                                     ->where('helper_id', $helperId)
                                     ->where('status', 'pending')
                                     ->first();

        if (!$application) {
            return response()->json(['message' => 'No pending application from this helper.'], 404);
        }

        $application->update(['status' => 'rejected']);

        // Send notification to helper
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $helperId,
                'title'   => 'Kết quả ứng tuyển',
                'message' => 'Rất tiếc, đơn ứng tuyển của bạn cho công việc: ' . $post->title . ' đã bị từ chối.',
                'type'    => 'booking',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify rejected helper: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Helper rejected successfully.',
            'data'    => $post->fresh(),
        ], 200);
    }

    /**
     * Customer reviews a helper after job post is resolved.
     */
    public function review(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can submit reviews.'], 403);
        }

        $post = JobPost::where('id', $id)
                       ->where('customer_id', $request->authUser['id'])
                       ->where('status', 'closed')
                       ->whereNotNull('selected_helper_id')
                       ->first();

        if (!$post) return response()->json(['message' => 'Job post not found or not closed yet.'], 404);

        if (Review::where('job_post_id', $id)->where('customer_id', $request->authUser['id'])->exists()) {
            return response()->json(['message' => 'You have already reviewed this job post.'], 409);
        }

        $fields = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'job_post_id' => $id,
            'customer_id' => $request->authUser['id'],
            'helper_id'   => $post->selected_helper_id,
            'rating'      => $fields['rating'],
            'comment'     => $fields['comment'] ?? null,
        ]);

        return response()->json(['message' => 'Review submitted.', 'data' => $review], 201);
    }

    // =====================================================================
    //  HELPER — Browse and apply to job posts (role_id=3)
    // =====================================================================

    /**
     * Helper browses job posts (same as public but authenticated).
     */
    public function helperBrowse(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = JobPost::with(['services'])
                        ->where('status', 'open')
                        ->where(function ($q) {
                            $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                        });

        if ($request->filled('city'))        $query->where('city', $request->query('city'));
        if ($request->filled('district'))    $query->where('district', $request->query('district'));
        if ($request->filled('category_id')) $query->where('category_id', $request->query('category_id'));

        $limit = (int) $request->query('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $posts], 200);
    }

    /**
     * Helper applies to a job post.
     */
    public function apply(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Only helpers can apply to job posts.'], 403);
        }

        // Bắt buộc thợ giúp việc hoàn thiện thông tin trước khi ứng tuyển
        // 1. Kiểm tra số điện thoại của thợ giúp việc từ identity-service
        try {
            $userResponse = Http::timeout(3)
                ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', [
                    'ids' => [$request->authUser['id']]
                ]);

            if ($userResponse->successful()) {
                $users = $userResponse->json('data') ?? [];
                if (empty($users) || empty($users[0]['phone'])) {
                    return response()->json([
                        'message' => 'Vui lòng cập nhật số điện thoại liên hệ trước khi ứng tuyển.'
                    ], 400);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to validate helper phone completeness: ' . $e->getMessage());
        }

        // 2. Kiểm tra hồ sơ helper (bio, gender, birthday, address, skills, workingAreas) từ provider-service
        try {
            $statusResponse = Http::timeout(3)
                ->get(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/helpers/' . $request->authUser['id'] . '/status-check');

            if ($statusResponse->successful()) {
                $statusData = $statusResponse->json();
                if (isset($statusData['is_complete']) && !$statusData['is_complete']) {
                    return response()->json([
                        'message' => 'Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển: ' . $statusData['message']
                    ], 400);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to validate helper profile completeness: ' . $e->getMessage());
        }

        $post = JobPost::where('id', $id)->where('status', 'open')->first();
        if (!$post) return response()->json(['message' => 'Job post not found or already closed.'], 404);

        if (JobApplication::where('job_post_id', $id)->where('helper_id', $request->authUser['id'])->exists()) {
            return response()->json(['message' => 'You have already applied for this job post.'], 409);
        }

        $fields = $request->validate([
            'message'        => 'nullable|string|max:500',
            'proposed_price' => 'nullable|numeric|min:0',
        ]);

        $application = JobApplication::create([
            'job_post_id'    => $id,
            'helper_id'      => $request->authUser['id'],
            'message'        => $fields['message'] ?? null,
            'proposed_price' => $fields['proposed_price'] ?? null,
            'status'         => 'pending',
        ]);

        // Gửi thông báo đến customer (chủ bài đăng)
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $post->customer_id,
                'title'   => 'Có người ứng tuyển mới',
                'message' => 'Một người giúp việc đã nộp hồ sơ ứng tuyển cho công việc: ' . $post->title . ' (Mã: #' . $id . ')',
                'type'    => 'booking',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send apply notification: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Application submitted.', 'data' => $application], 201);
    }

    /**
     * Helper views their own applications.
     */
    public function myApplications(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = JobApplication::with(['jobPost'])
                               ->where('helper_id', $request->authUser['id']);

        if ($request->filled('status')) $query->where('status', $request->query('status'));

        $limit = (int) $request->query('limit', 20);
        $apps  = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $apps], 200);
    }

    /**
     * Helper withdraws a pending application.
     */
    public function withdraw(Request $request, $applicationId)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $application = JobApplication::where('id', $applicationId)
                                     ->where('helper_id', $request->authUser['id'])
                                     ->where('status', 'pending')
                                     ->first();

        if (!$application) return response()->json(['message' => 'Application not found or cannot be withdrawn.'], 404);

        $application->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Application withdrawn.'], 200);
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Management
    // =====================================================================

    /**
     * Admin/Operator lists all job posts with filters.
     */
    public function adminIndex(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = JobPost::with(['services']);

        if ($request->filled('ids')) {
            $ids = explode(',', $request->query('ids'));
            $query->whereIn('id', $ids);
        }

        if ($request->filled('status'))      $query->where('status', $request->query('status'));
        if ($request->filled('city'))        $query->where('city', $request->query('city'));
        if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));

        $limit = (int) $request->query('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return response()->json(['data' => $posts], 200);
    }

    /**
     * Admin/Operator views full detail of a job post.
     */
    public function adminShow(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::with(['services', 'applications', 'reviews', 'reports'])->find($id);
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        return response()->json(['data' => $post], 200);
    }

    /**
     * Admin/Operator overrides job post status (e.g. force close a violating post).
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post = JobPost::find($id);
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        $fields = $request->validate([
            'status' => 'required|string|in:open,closed,pending',
            'note'   => 'nullable|string|max:500',
        ]);

        $post->update(['status' => $fields['status']]);

        return response()->json(['message' => 'Job post status updated.', 'data' => $post->fresh()], 200);
    }

    /**
     * Admin deletes a job post.
     * Role: admin (1) only
     */
    public function adminDestroy(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Only administrators can delete job posts.'], 403);
        }

        $post = JobPost::find($id);
        if (!$post) return response()->json(['message' => 'Job post not found.'], 404);

        $post->delete();

        return response()->json(['message' => 'Job post deleted.'], 200);
    }
}
