<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobPost;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use App\Models\JobPostService;
use App\Models\JobApplication;
use App\Models\Review;
use App\Models\Booking;
use App\Models\BookingService;
use App\Services\InternalNotificationService;
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

        $limit = $request->integer('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return $this->successResponse($posts);
    }

    /**
     * Get public detail of a single job post.
     */
    public function show($id)
    {
        $post = JobPost::with(['services', 'applications'])
                       ->where('status', 'open')
                       ->find($id);

        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        return $this->successResponse($post);
    }

    // =====================================================================
    //  CUSTOMER — Manage own job posts (role_id=4)
    // =====================================================================

    /**
     * List the authenticated customer's own job posts.
     */
    public function myPosts(Request $request)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $query = JobPost::with(['services'])
                        ->where('customer_id', $request->authUser['id']);

        if ($request->filled('status')) $query->where('status', $request->query('status'));

        $limit = $request->integer('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return $this->successResponse($posts);
    }

    public function store(Request $request)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request, 'Chỉ khách hàng, quản trị viên hoặc điều hành viên mới có thể đăng bài tuyển dụng.')) {
            return $unauthorized;
        }

        if ($request->authUser['role_id'] === Role::CUSTOMER) {
            try {
                $statusResponse = Http::timeout(3)
                    ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/customer/profile-status', [
                        'user_id' => $request->authUser['id']
                    ]);

                if ($statusResponse->successful()) {
                    $statusData = $statusResponse->json();
                    if (isset($statusData['is_complete']) && !$statusData['is_complete']) {
                        return $this->errorResponse('Vui lòng hoàn thiện hồ sơ trước khi đăng bài tuyển dụng: ' . $statusData['message']);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Không thể kiểm tra hoàn thiện hồ sơ khách hàng: ' . $e->getMessage());
            }
        }

        $fields = $request->validate([
            'title'        => 'required|string|max:150',
            'description'  => 'nullable|string',
            'category_id'  => 'nullable|integer',
            'salary'       => 'nullable|numeric|min:10000|max:1000000000',
            'address'      => 'nullable|string|max:255',
            'district'     => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'working_time' => 'nullable|string|max:255',
            'expired_at'   => 'nullable|date|after:today',
            'service_ids'  => 'nullable|array',
            'service_ids.*'=> 'integer',
        ], [
            'salary.min' => 'Mức lương tối thiểu là 10.000 đ.',
            'salary.max' => 'Mức lương tối đa không vượt quá giới hạn 1.000.000.000 đ của VNPay.',
        ]);

        if (isset($fields['title'])) {
            $cleaned = preg_replace('/\s+/', '', $fields['title']);
            if (preg_match('/^\d+$/', $cleaned)) {
                return $this->errorResponse('Tiêu đề không được chỉ chứa chữ số.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (!empty($fields['description'])) {
            if (preg_match('/\[Danh mục:\s*([^\]\r\n]+)\]/', $fields['description'], $matches)) {
                $category = trim($matches[1]);
                $cleaned = preg_replace('/\s+/', '', $category);
                if (preg_match('/^\d+$/', $cleaned)) {
                    return $this->errorResponse('Tên danh mục không được chỉ chứa chữ số.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }

            if (preg_match('/\[Dịch vụ:\s*([^\]\r\n]+)\]/', $fields['description'], $matches)) {
                $service = trim($matches[1]);
                $cleaned = preg_replace('/\s+/', '', $service);
                if (preg_match('/^\d+$/', $cleaned)) {
                    return $this->errorResponse('Tên dịch vụ không được chỉ chứa chữ số.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }
        }

        $isAdminOrOperator = in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR]);

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
            'status'       => $isAdminOrOperator ? 'open' : 'pending',
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

        InternalNotificationService::publishSocket([
            'event' => 'new_job_post',
            'data'  => $post->fresh('services'),
        ]);

        return $this->successResponse($post->load('services'), 'Tạo bài đăng tuyển dụng thành công.', Response::HTTP_CREATED);
    }

    /**
     * Customer updates their own job post (only if status is open/pending/rejected).
     */
    public function update(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        if (!in_array($post->status, ['open', 'pending', 'rejected'])) {
            return $this->errorResponse('Chỉ có thể chỉnh sửa bài đăng ở trạng thái chờ duyệt, mở hoặc từ chối.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fields = $request->validate([
            'title'        => 'sometimes|required|string|max:150',
            'description'  => 'sometimes|nullable|string',
            'category_id'  => 'sometimes|nullable|integer',
            'salary'       => 'sometimes|nullable|numeric|min:10000|max:1000000000',
            'address'      => 'sometimes|nullable|string|max:255',
            'district'     => 'sometimes|nullable|string|max:100',
            'city'         => 'sometimes|nullable|string|max:100',
            'working_time' => 'sometimes|nullable|string|max:255',
            'expired_at'   => 'sometimes|nullable|date|after:today',
        ], [
            'salary.min' => 'Mức lương tối thiểu là 10.000 đ.',
            'salary.max' => 'Mức lương tối đa không vượt quá giới hạn 1.000.000.000 đ của VNPay.',
        ]);

        if (isset($fields['title'])) {
            $cleaned = preg_replace('/\s+/', '', $fields['title']);
            if (preg_match('/^\d+$/', $cleaned)) {
                return $this->errorResponse('Tiêu đề không được chỉ chứa chữ số.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (!empty($fields['description'])) {
            if (preg_match('/\[Danh mục:\s*([^\]\r\n]+)\]/', $fields['description'], $matches)) {
                $category = trim($matches[1]);
                $cleaned = preg_replace('/\s+/', '', $category);
                if (preg_match('/^\d+$/', $cleaned)) {
                    return $this->errorResponse('Tên danh mục không được chỉ chứa chữ số.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }

            if (preg_match('/\[Dịch vụ:\s*([^\]\r\n]+)\]/', $fields['description'], $matches)) {
                $service = trim($matches[1]);
                $cleaned = preg_replace('/\s+/', '', $service);
                if (preg_match('/^\d+$/', $cleaned)) {
                    return $this->errorResponse('Tên dịch vụ không được chỉ chứa chữ số.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }
        }

        if ($request->authUser['role_id'] === Role::CUSTOMER) {
            $fields['status'] = 'pending';
        }
        $post->update($fields);

        return $this->successResponse($post->fresh(['services']), 'Cập nhật bài đăng tuyển dụng thành công.');
    }

    /**
     * Customer closes their own job post.
     */
    public function close(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        $post->update(['status' => 'closed']);

        return $this->successResponse($post->fresh(), 'Đã đóng bài đăng tuyển dụng.');
    }

    /**
     * Customer deletes their own job post.
     */
    public function destroy(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        $post->delete();

        return $this->successResponse(null, 'Đã xóa bài đăng tuyển dụng thành công.');
    }

    /**
     * Customer views applications on their job post.
     */
    public function applications(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

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
                Log::error('Không thể lấy thông tin chi tiết ứng viên: ' . $e->getMessage());
            }
        }

        foreach ($apps as $app) {
            $app->helper = $userMap[$app->helper_id] ?? null;
        }

        return $this->successResponse($apps);
    }

    /**
     * Customer selects a helper from the applicants.
     */
    public function selectHelper(Request $request, $id, $helperId)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        if ($post->status !== 'open') {
            return $this->errorResponse('Chỉ có thể chọn người giúp việc cho bài đăng đang công khai.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $application = JobApplication::where('job_post_id', $id)
                                     ->where('helper_id', $helperId)
                                     ->where('status', 'pending')
                                     ->first();

        if (!$application) {
            return $this->notFoundResponse('Không tìm thấy ứng tuyển ở trạng thái chờ duyệt từ người giúp việc này.');
        }

        if ($post->working_time) {
            $parsedTime = strtotime($post->working_time);
            if ($parsedTime !== false) {
                $bookingDate = date('Y-m-d', $parsedTime);
                $startTime = date('H:i:s', $parsedTime);
                $servicesCount = $post->services()->count();
                $durationHours = $servicesCount > 0 ? $servicesCount * 2 : 2;

                if (Booking::hasConflict((int) $helperId, $bookingDate, $startTime, (float) $durationHours)) {
                    return $this->errorResponse('Người giúp việc này hiện đang bận hoặc đã có lịch làm việc khác trùng thời gian này.');
                }
            }
        }

        $application->update(['status' => 'selected']);

        $post->update([
            'selected_helper_id' => $helperId,
            'status'             => 'closed',
        ]);

        InternalNotificationService::sendToUser(
            $helperId,
            'Bạn được mời nhận công việc',
            'Khách hàng đã chọn bạn cho công việc. Vui lòng phản hồi Đồng ý hoặc Từ chối.',
            'recruitment'
        );

        return $this->successResponse($application, 'Đã chọn người giúp việc. Đang chờ phản hồi xác nhận.');
    }

    /**
     * Helper responds to Customer's invitation (accept / reject).
     */
    public function respondToSelection(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $fields = $request->validate([
            'action' => 'required|string|in:accept,reject',
        ]);

        $application = JobApplication::where('id', $id)
                                     ->where('helper_id', $request->authUser['id'])
                                     ->where('status', 'selected')
                                     ->first();

        if (!$application) {
            return $this->notFoundResponse('Không tìm thấy lời mời ứng tuyển để phản hồi.');
        }

        $post = JobPost::find($application->job_post_id);
        if (!$post) {
            return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');
        }

        if ($fields['action'] === 'accept') {
            if ($post->working_time) {
                $parsedTime = strtotime($post->working_time);
                if ($parsedTime !== false) {
                    $bookingDate = date('Y-m-d', $parsedTime);
                    $startTime = date('H:i:s', $parsedTime);
                    $servicesCount = $post->services()->count();
                    $durationHours = $servicesCount > 0 ? $servicesCount * 2 : 2;

                    if (Booking::hasConflict((int) $request->authUser['id'], $bookingDate, $startTime, (float) $durationHours)) {
                        return $this->errorResponse('Bạn không thể nhận việc này do trùng lịch với một công việc khác.');
                    }
                }
            }

            $application->update(['status' => 'confirmed']);

            JobApplication::where('job_post_id', $post->id)
                          ->where('helper_id', '!=', $request->authUser['id'])
                          ->where('status', 'pending')
                          ->update(['status' => 'rejected']);

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

            InternalNotificationService::sendToUser(
                $post->customer_id,
                'Người giúp việc đã đồng ý nhận công việc',
                'Người giúp việc đã đồng ý nhận công việc. Vui lòng thanh toán trong 30 phút.',
                'booking'
            );

            return response()->json([
                'success'    => true,
                'message'    => 'Đã chấp nhận lời mời. Đơn đặt lịch đã được khởi tạo ở trạng thái chờ thanh toán.',
                'data'       => $application,
                'booking_id' => $booking->id,
            ], Response::HTTP_OK);

        } else {
            $application->update(['status' => 'rejected']);

            $post->update([
                'selected_helper_id' => null,
                'status'             => 'open',
            ]);

            InternalNotificationService::sendToUser(
                $post->customer_id,
                'Người giúp việc từ chối lời mời',
                'Người giúp việc đã từ chối nhận công việc. Vui lòng chọn người giúp việc khác.',
                'recruitment'
            );

            return $this->successResponse($application, 'Đã từ chối lời mời. Bài đăng tuyển dụng đã được mở lại.');
        }
    }

    /**
     * Customer rejects a helper application.
     */
    public function rejectHelper(Request $request, $id, $helperId)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)->where('customer_id', $request->authUser['id'])->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        if ($post->status !== 'open') {
            return $this->errorResponse('Chỉ có thể từ chối ứng tuyển đối với bài đăng đang công khai.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $application = JobApplication::where('job_post_id', $id)
                                     ->where('helper_id', $helperId)
                                     ->where('status', 'pending')
                                     ->first();

        if (!$application) {
            return $this->notFoundResponse('Không tìm thấy đơn ứng tuyển chờ duyệt từ người giúp việc này.');
        }

        $application->update(['status' => 'rejected']);

        InternalNotificationService::sendToUser(
            $helperId,
            'Kết quả ứng tuyển',
            'Rất tiếc, đơn ứng tuyển của bạn cho công việc: ' . $post->title . ' đã bị từ chối.',
            'booking'
        );

        return $this->successResponse($post->fresh(), 'Đã từ chối đơn ứng tuyển của người giúp việc.');
    }

    /**
     * Customer reviews a helper after job post is resolved.
     */
    public function review(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeCustomerOrAdmin($request)) {
            return $unauthorized;
        }

        $post = JobPost::where('id', $id)
                       ->where('customer_id', $request->authUser['id'])
                       ->where('status', 'closed')
                       ->whereNotNull('selected_helper_id')
                       ->first();

        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng hoặc bài đăng chưa đóng.');

        if (Review::where('job_post_id', $id)->where('customer_id', $request->authUser['id'])->exists()) {
            return $this->errorResponse('Bạn đã gửi đánh giá cho bài đăng công việc này rồi.', Response::HTTP_CONFLICT);
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

        return $this->successResponse($review, 'Gửi đánh giá thành công.', Response::HTTP_CREATED);
    }

    // =====================================================================
    //  HELPER — Browse and apply to job posts (role_id=3)
    // =====================================================================

    /**
     * Helper browses job posts.
     */
    public function helperBrowse(Request $request)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $query = JobPost::with(['services'])
                        ->where('status', 'open')
                        ->where(function ($q) {
                            $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
                        });

        if ($request->filled('city'))        $query->where('city', $request->query('city'));
        if ($request->filled('district'))    $query->where('district', $request->query('district'));
        if ($request->filled('category_id')) $query->where('category_id', $request->query('category_id'));

        $limit = $request->integer('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return $this->successResponse($posts);
    }

    /**
     * Helper applies to a job post.
     */
    public function apply(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeHelper($request, 'Chỉ người giúp việc mới có thể ứng tuyển công việc.')) {
            return $unauthorized;
        }

        try {
            $userResponse = Http::timeout(3)
                ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', [
                    'ids' => [$request->authUser['id']]
                ]);

            if ($userResponse->successful()) {
                $users = $userResponse->json('data') ?? [];
                if (empty($users) || empty($users[0]['phone'])) {
                    return $this->errorResponse('Vui lòng cập nhật số điện thoại liên hệ trước khi ứng tuyển.');
                }
            }
        } catch (\Exception $e) {
            Log::error('Không thể kiểm tra số điện thoại liên hệ người giúp việc: ' . $e->getMessage());
        }

        try {
            $statusResponse = Http::timeout(3)
                ->get(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/helpers/' . $request->authUser['id'] . '/status-check');

            if ($statusResponse->successful()) {
                $statusData = $statusResponse->json();
                if (isset($statusData['is_complete']) && !$statusData['is_complete']) {
                    return $this->errorResponse('Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển: ' . $statusData['message']);
                }
            }
        } catch (\Exception $e) {
            Log::error('Không thể kiểm tra hoàn thiện hồ sơ người giúp việc: ' . $e->getMessage());
        }

        $post = JobPost::where('id', $id)->where('status', 'open')->first();
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc hoặc bài đăng đã đóng.');

        if ($post->working_time) {
            $parsedTime = strtotime($post->working_time);
            if ($parsedTime !== false) {
                $bookingDate = date('Y-m-d', $parsedTime);
                $startTime = date('H:i:s', $parsedTime);
                $servicesCount = $post->services()->count();
                $durationHours = $servicesCount > 0 ? $servicesCount * 2 : 2;

                if (Booking::hasConflict((int) $request->authUser['id'], $bookingDate, $startTime, (float) $durationHours)) {
                    return $this->errorResponse('Bạn không thể ứng tuyển do trùng ngày giờ hoặc đang trong lịch làm việc ca khác.');
                }
            }
        }

        if (JobApplication::where('job_post_id', $id)->where('helper_id', $request->authUser['id'])->exists()) {
            return $this->errorResponse('Bạn đã nộp hồ sơ ứng tuyển cho công việc này rồi.', Response::HTTP_CONFLICT);
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

        InternalNotificationService::sendToUser(
            $post->customer_id,
            'Có người ứng tuyển mới',
            'Một người giúp việc đã nộp hồ sơ ứng tuyển cho công việc: ' . $post->title . ' (Mã: #' . $id . ')',
            'booking'
        );

        return $this->successResponse($application, 'Nộp hồ sơ ứng tuyển thành công.', Response::HTTP_CREATED);
    }

    /**
     * Helper views their own applications.
     */
    public function myApplications(Request $request)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $query = JobApplication::with(['jobPost'])
                               ->where('helper_id', $request->authUser['id']);

        if ($request->filled('status')) $query->where('status', $request->query('status'));

        $limit = $request->integer('limit', 20);
        $apps  = $query->orderByDesc('created_at')->paginate($limit);

        return $this->successResponse($apps);
    }

    /**
     * Helper withdraws a pending application.
     */
    public function withdraw(Request $request, $applicationId)
    {
        if ($unauthorized = $this->authorizeHelper($request)) {
            return $unauthorized;
        }

        $application = JobApplication::where('id', $applicationId)
                                     ->where('helper_id', $request->authUser['id'])
                                     ->where('status', 'pending')
                                     ->first();

        if (!$application) return $this->notFoundResponse('Không tìm thấy đơn ứng tuyển hoặc không thể rút đơn.');

        $application->update(['status' => 'withdrawn']);

        return $this->successResponse(null, 'Đã rút đơn ứng tuyển thành công.');
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Management
    // =====================================================================

    /**
     * Admin/Operator lists all job posts with filters.
     */
    public function adminIndex(Request $request)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $query = JobPost::with(['services']);

        if ($request->filled('ids')) {
            $ids = explode(',', $request->query('ids'));
            $query->whereIn('id', $ids);
        }

        if ($request->filled('status'))      $query->where('status', $request->query('status'));
        if ($request->filled('city'))        $query->where('city', $request->query('city'));
        if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));

        $limit = $request->integer('limit', 20);
        $posts = $query->orderByDesc('created_at')->paginate($limit);

        return $this->successResponse($posts);
    }

    /**
     * Admin/Operator views full detail of a job post.
     */
    public function adminShow(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $post = JobPost::with(['services', 'applications', 'reviews', 'reports'])->find($id);
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        return $this->successResponse($post);
    }

    /**
     * Admin/Operator overrides job post status.
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $post = JobPost::find($id);
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        $fields = $request->validate([
            'status' => 'required|string|in:open,closed,pending,rejected',
            'note'   => 'nullable|string|max:500',
        ]);

        $post->update(['status' => $fields['status']]);

        if ($fields['status'] === 'rejected') {
            InternalNotificationService::sendToUser(
                $post->customer_id,
                'Bài đăng tuyển dụng bị từ chối',
                'Bài đăng tuyển dụng "' . $post->title . '" của bạn đã bị từ chối. Lý do: ' . ($fields['note'] ?? 'Không có lý do cụ thể.'),
                'recruitment'
            );
        } elseif ($fields['status'] === 'open') {
            InternalNotificationService::sendToUser(
                $post->customer_id,
                'Bài đăng tuyển dụng được duyệt',
                'Bài đăng tuyển dụng "' . $post->title . '" của bạn đã được phê duyệt và hiển thị công khai.',
                'recruitment'
            );
        }

        return $this->successResponse($post->fresh(), 'Đã cập nhật trạng thái bài đăng công việc.');
    }

    /**
     * Admin deletes a job post.
     */
    public function adminDestroy(Request $request, $id)
    {
        if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
            return $unauthorized;
        }

        $post = JobPost::find($id);
        if (!$post) return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');

        $post->delete();

        return $this->successResponse(null, 'Đã xóa bài đăng công việc thành công.');
    }

    /**
     * Internal endpoint to update job post application and booking statuses upon successful payment.
     */
    public function updatePaymentStatus(Request $request)
    {
        $fields = $request->validate([
            'job_post_id'    => 'required|integer',
            'status'         => 'required|string',
            'payment_method' => 'nullable|string',
        ]);

        $post = JobPost::find($fields['job_post_id']);
        if (!$post) {
            return $this->notFoundResponse('Không tìm thấy bài đăng công việc.');
        }

        $paymentMethod = $fields['payment_method'] ?? null;
        $shouldConfirm = ($fields['status'] === 'completed' || $paymentMethod === 'cash');

        if ($shouldConfirm) {
            $application = JobApplication::where('job_post_id', $post->id)
                                         ->where('status', 'confirmed')
                                         ->first();

            if ($application) {
                // Update applications to 'paid' so they don't block
                $application->update(['status' => 'paid']);

                $booking = Booking::where('customer_id', $post->customer_id)
                                  ->where('helper_id', $application->helper_id)
                                  ->where('status', 'pending')
                                  ->where('note', 'like', '%[Bài tuyển dụng: %')
                                  ->first();

                if ($booking) {
                    $oldStatus = $booking->status;
                    $booking->update(['status' => 'confirmed']);
                    
                    \App\Models\BookingStatusHistory::create([
                        'booking_id' => $booking->id,
                        'old_status' => $oldStatus,
                        'new_status' => 'confirmed',
                        'changed_by' => 0,
                        'note'       => ($paymentMethod === 'cash') ? 'Khách hàng chọn thanh toán bằng tiền mặt cho tin tuyển dụng.' : 'Thanh toán tin tuyển dụng thành công.',
                    ]);

                    InternalNotificationService::sendToUser(
                        $booking->customer_id,
                        'Xác nhận tuyển dụng',
                        ($paymentMethod === 'cash')
                            ? 'Bạn đã chọn thanh toán bằng tiền mặt cho tin tuyển dụng ' . $post->title . '. Công việc đã được xác nhận.'
                            : 'Bạn đã thanh toán thành công cho tin tuyển dụng ' . $post->title . '. Công việc đã được xác nhận.',
                        'payment'
                    );

                    InternalNotificationService::sendToUser(
                        $booking->helper_id,
                        'Công việc đã được xác nhận',
                        ($paymentMethod === 'cash')
                            ? 'Khách hàng đã chọn thanh toán bằng tiền mặt cho tin tuyển dụng ' . $post->title . '. Công việc đã được xác nhận.'
                            : 'Khách hàng đã thanh toán thành công cho tin tuyển dụng ' . $post->title . '. Công việc đã được xác nhận.',
                        'booking'
                    );

                    InternalNotificationService::publishSocket([
                        'event' => 'booking_updated',
                        'data' => [
                            'booking_id'  => $booking->id,
                            'status'      => 'confirmed',
                            'helper_id'   => $booking->helper_id,
                            'customer_id' => $booking->customer_id
                        ]
                    ]);
                }
            }
        }

        return $this->successResponse(null, 'Đã xử lý trạng thái thanh toán bài đăng tuyển dụng.');
    }
}
