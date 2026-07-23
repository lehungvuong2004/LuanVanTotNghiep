<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HelperProfile;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use App\Models\HelperSkill;
use App\Models\HelperWorkingArea;
use App\Models\HelperAvailability;
use App\Models\HelperVerification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\AvailabilityService;

class HelperController extends Controller
{
    // =====================================================================
    //  PUBLIC — Không cần đăng nhập
    // =====================================================================

  /**
   * Tìm kiếm danh sách helper công khai.
   * Filter: city, district, service_id, gender, rating_min, status=active
   * Sắp xếp: rating_avg DESC, total_reviews DESC
   */
  public function publicList(Request $request)
  {
    $query = HelperProfile::with(['skills.service', 'workingAreas'])
      ->where('status', 'active');

    if ($request->filled('city')) {
      $city = $request->query('city');
      $query->whereHas('workingAreas', fn($q) => $q->where('city', $city));
    }

    if ($request->filled('district')) {
      $district = $request->query('district');
      $query->whereHas('workingAreas', fn($q) => $q->where('district', $district));
    }

    if ($request->filled('service_id')) {
      $serviceId = $request->query('service_id');
      $query->whereHas('skills', fn($q) => $q->where('service_id', $serviceId));
    }

    if ($request->filled('gender')) {
      $query->where('gender', $request->query('gender'));
    }

    if ($request->filled('rating_min')) {
      $query->where('rating_avg', '>=', (float) $request->query('rating_min'));
    }

    $limit   = $request->integer('limit', 20);

    $helpers = $query->orderByDesc('rating_avg')
      ->orderByDesc('total_reviews')
      ->paginate($limit);

    // Fetch user info for each helper in the page from identity-service internally
    $userIds = $helpers->pluck('user_id')->filter()->unique()->toArray();
    if (!empty($userIds)) {
      try {
        $userResponse = Http::timeout(3)
          ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $userIds]);

        if ($userResponse->successful()) {
          $users = $userResponse->json('data') ?? [];
          $userMap = collect($users)->keyBy('id');
          foreach ($helpers->items() as $helper) {
            $helper->user = $userMap->get($helper->user_id);
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin chi tiết người dùng cho danh sách người giúp việc: ' . $e->getMessage());
      }
    }

    return $this->successResponse($helpers);
  }

  /**
   * Xem hồ sơ công khai của một helper.
   */
  public function publicShow($id)
  {
    $helper = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities'])
      ->where(function ($q) use ($id) {
        $q->where('id', $id)
          ->orWhere('user_id', $id);
      })
      ->first();

    if (!$helper) {
      try {
        $userResponse = Http::timeout(3)
          ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => [$id]]);

        if ($userResponse->successful()) {
          $users = $userResponse->json('data') ?? [];
          if (!empty($users) && $users[0]['role_id'] == Role::HELPER) {
            $helper = HelperProfile::create([
              'user_id' => $users[0]['id'],
              'bio' => 'Chưa cập nhật giới thiệu.',
              'experience_year' => 0,
              'status' => 'approved',
              'rating_avg' => 5.0,
              'total_reviews' => 0
            ]);
            $helper->load(['skills.service', 'workingAreas', 'availabilities']);
            $helper->user = $users[0];
            return $this->successResponse($helper);
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể tự động tạo hồ sơ người giúp việc: ' . $e->getMessage());
      }

      return $this->notFoundResponse('Không tìm thấy người giúp việc.');
    }

    // Fetch user info from identity-service internally
    try {
      $userResponse = Http::timeout(3)
        ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => [$helper->user_id]]);

      if ($userResponse->successful()) {
        $users = $userResponse->json('data') ?? [];
        if (!empty($users)) {
          $helper->user = $users[0];
        }
      }
    } catch (\Exception $e) {
      Log::error('Không thể lấy thông tin chi tiết người dùng cho hồ sơ người giúp việc: ' . $e->getMessage());
    }

    return $this->successResponse($helper);
  }

  /**
   * API nội bộ: Kiểm tra trạng thái hoàn thiện hồ sơ của Helper.
   */
  public function profileStatusCheck($id)
  {
    $helper = HelperProfile::with(['skills', 'workingAreas'])
      ->where('user_id', $id)
      ->orWhere('id', $id)
      ->first();

    if (!$helper) {
      return response()->json(['is_complete' => false, 'message' => 'Vui lòng cập nhật thông tin hồ sơ người giúp việc.'], Response::HTTP_OK);
    }

    if (empty($helper->bio)) {
      return response()->json(['is_complete' => false, 'message' => 'Vui lòng cập nhật phần giới thiệu bản thân.'], Response::HTTP_OK);
    }

    if (empty($helper->gender) || empty($helper->birthday)) {
      return response()->json(['is_complete' => false, 'message' => 'Vui lòng cập nhật giới tính và ngày sinh.'], Response::HTTP_OK);
    }

    if (empty($helper->address)) {
      return response()->json(['is_complete' => false, 'message' => 'Vui lòng cập nhật địa chỉ liên hệ.'], Response::HTTP_OK);
    }

    if ($helper->skills->count() === 0) {
      return response()->json(['is_complete' => false, 'message' => 'Vui lòng chọn ít nhất một kỹ năng/dịch vụ chuyên môn.'], Response::HTTP_OK);
    }

    if ($helper->workingAreas->count() === 0) {
      return response()->json(['is_complete' => false, 'message' => 'Vui lòng chọn ít nhất một khu vực hoạt động.'], Response::HTTP_OK);
    }

    return response()->json(['is_complete' => true], Response::HTTP_OK);
  }

  /**
   * Lấy danh sách user_id của tất cả helper (được gọi nội bộ/công khai).
   */
  public function getHelperUserIds()
  {
    $userIds = HelperProfile::pluck('user_id')->toArray();
    return response()->json($userIds, Response::HTTP_OK);
  }

  /**
   * Internal: Cập nhật rating_avg & total_reviews từ order-service.
   */
  public function updateHelperRating(Request $request)
  {
    $helperId = $request->input('helper_id');
    $ratingAvg = $request->input('rating_avg');
    $totalReviews = $request->input('total_reviews');

    // Tìm helper bằng id hoặc user_id
    $helper = HelperProfile::where('id', $helperId)
      ->orWhere('user_id', $helperId)
      ->first();

    if (!$helper) {
      return $this->notFoundResponse('Không tìm thấy người giúp việc.');
    }

    $helper->update([
      'rating_avg'    => $ratingAvg,
      'total_reviews' => $totalReviews,
    ]);

    return $this->successResponse($helper, 'Đã cập nhật điểm đánh giá.');
  }

    // =====================================================================
    //  HELPER — Quản lý hồ sơ của chính mình (role_id = 3)
    // =====================================================================
  public function myProfile(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $userId = $request->authUser['id'];

    $profile = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities', 'verifications'])
      ->where('user_id', $userId)
      ->first();

    if (!$profile) {
      return $this->successResponse(null, 'Bạn chưa có hồ sơ. Vui lòng tạo hồ sơ trước.');
    }

    return $this->successResponse($profile);
  }

  /**
   * Tạo hồ sơ helper lần đầu.
   */
  public function createProfile(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $userId = $request->authUser['id'];

    $existing = HelperProfile::where('user_id', $userId)->first();
    if ($existing) {
      return $this->errorResponse('Bạn đã có hồ sơ. Vui lòng dùng API cập nhật.', Response::HTTP_CONFLICT);
    }

    $fields = $request->validate([
      'bio'             => 'nullable|string|max:1000',
      'experience_year' => 'nullable|integer|min:0|max:50',
      'gender'          => 'nullable|string|in:male,female,other',
      'birthday'        => 'nullable|date|before:today',
      'address'         => 'nullable|string|max:255',
    ]);

    $profile = HelperProfile::create(array_merge($fields, [
      'user_id' => $userId,
      'status'  => 'pending', // Chờ Admin/Operator duyệt
    ]));

    return $this->successResponse($profile, 'Tạo hồ sơ thành công. Hồ sơ đang chờ xét duyệt.', Response::HTTP_CREATED);
  }

  /**
   * Cập nhật hồ sơ helper.
   */
  public function updateProfile(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $userId  = $request->authUser['id'];
    $profile = HelperProfile::where('user_id', $userId)->first();

    if (!$profile) {
      return $this->notFoundResponse('Bạn chưa có hồ sơ.');
    }

    $fields = $request->validate([
      'bio'             => 'sometimes|nullable|string|max:1000',
      'experience_year' => 'sometimes|nullable|integer|min:0|max:50',
      'gender'          => 'sometimes|nullable|string|in:male,female,other',
      'birthday'        => 'sometimes|nullable|date|before:today',
      'address'         => 'sometimes|nullable|string|max:255',
    ]);

    $profile->update($fields);

    return $this->successResponse($profile->fresh(['skills.service', 'workingAreas']), 'Cập nhật hồ sơ thành công.');
  }

  // =====================================================================
  //  SKILLS (role: helper)
  // =====================================================================

  public function listSkills(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->successResponse([]);

    $skills = HelperSkill::with('service')
      ->where('helper_id', $profile->id)
      ->get();

    return $this->successResponse($skills);
  }

  public function addSkill(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    // Limit to maximum 3 skills
    $currentCount = HelperSkill::where('helper_id', $profile->id)->count();
    if ($currentCount >= 3) {
      return $this->errorResponse('Bạn chỉ được chọn tối đa 3 kỹ năng.', Response::HTTP_BAD_REQUEST);
    }

    $fields = $request->validate([
      'service_id' => 'required|integer|exists:services,id',
    ]);

    $existing = HelperSkill::where('helper_id', $profile->id)
      ->where('service_id', $fields['service_id'])
      ->first();

    if ($existing) {
      return $this->errorResponse('Kỹ năng này đã tồn tại trong hồ sơ của bạn.', Response::HTTP_CONFLICT);
    }

    $skill = HelperSkill::create([
      'helper_id'  => $profile->id,
      'service_id' => $fields['service_id'],
    ]);

    // Reset status to pending and create verification request
    $profile->update(['status' => 'pending']);
    HelperVerification::updateOrCreate(
      ['helper_id' => $profile->id, 'status' => 'pending'],
      ['created_at' => now(), 'note' => 'Cập nhật danh sách kỹ năng']
    );

    return $this->successResponse($skill->load('service'), 'Thêm kỹ năng thành công. Hồ sơ của bạn đã chuyển về trạng thái chờ xét duyệt.', Response::HTTP_CREATED);
  }

  public function removeSkill(Request $request, $serviceId)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    $skill = HelperSkill::where('helper_id', $profile->id)
      ->where('service_id', $serviceId)
      ->first();

    if (!$skill) return $this->notFoundResponse('Không tìm thấy kỹ năng.');

    $skill->delete();

    // Reset status to pending and create verification request
    $profile->update(['status' => 'pending']);
    HelperVerification::updateOrCreate(
      ['helper_id' => $profile->id, 'status' => 'pending'],
      ['created_at' => now(), 'note' => 'Cập nhật danh sách kỹ năng']
    );

    return $this->successResponse(null, 'Đã xóa kỹ năng. Hồ sơ của bạn đã chuyển về trạng thái chờ xét duyệt.');
  }

  // =====================================================================
  //  WORKING AREAS (role: helper)
  // =====================================================================

  public function listWorkingAreas(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->successResponse([]);

    return $this->successResponse($profile->workingAreas);
  }

  public function addWorkingArea(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    $fields = $request->validate([
      'district' => 'required|string|max:100',
      'city'     => 'required|string|max:100',
    ]);

    $area = HelperWorkingArea::create(array_merge($fields, ['helper_id' => $profile->id]));

    return $this->successResponse($area, 'Thêm khu vực làm việc thành công.', Response::HTTP_CREATED);
  }

  public function removeWorkingArea(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    $area = HelperWorkingArea::where('id', $id)->where('helper_id', $profile->id)->first();
    if (!$area) return $this->notFoundResponse('Không tìm thấy khu vực.');

    $area->delete();
    return $this->successResponse(null, 'Đã xóa khu vực làm việc.');
  }

  // =====================================================================
  //  AVAILABILITY (role: helper)
  // =====================================================================

  public function listAvailability(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->successResponse([]);

    $slots = HelperAvailability::where('helper_id', $profile->id)
      ->where('available_date', '>=', now()->toDateString())
      ->orderBy('available_date')
      ->orderBy('start_time')
      ->get();

    return $this->successResponse($slots);
  }

  public function addAvailability(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    $fields = $request->validate([
      'available_date' => 'required|date|after_or_equal:today',
      'start_time'     => 'required|date_format:H:i',
      'status'         => 'sometimes|string|in:available,booked',
    ]);

    // Kiểm tra trùng lịch
    $exists = HelperAvailability::where('helper_id', $profile->id)
      ->where('available_date', $fields['available_date'])
      ->where('start_time', $fields['start_time'])
      ->exists();

    if ($exists) {
      return $this->errorResponse('Khung giờ này đã tồn tại trong lịch của bạn.', Response::HTTP_CONFLICT);
    }

    $slot = HelperAvailability::create(array_merge($fields, [
      'helper_id' => $profile->id,
      'status'    => $fields['status'] ?? 'available',
    ]));

    return $this->successResponse($slot, 'Thêm lịch rảnh thành công.', Response::HTTP_CREATED);
  }

  public function removeAvailability(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    $slot = HelperAvailability::where('id', $id)->where('helper_id', $profile->id)->first();
    if (!$slot) return $this->notFoundResponse('Không tìm thấy lịch.');

    $slot->delete();
    return $this->successResponse(null, 'Đã xóa lịch rảnh.');
  }

  public function clearAllAvailability(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    // Only delete 'available' slots, preserve 'booked' (active work)
    $deletedCount = HelperAvailability::where('helper_id', $profile->id)
      ->where('status', 'available')
      ->delete();

    return $this->successResponse(['deleted_count' => $deletedCount], 'Đã xóa toàn bộ lịch rảnh.');
  }

  public function bulkAvailability(Request $request, AvailabilityService $availabilityService)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    // Tối ưu 1: Chỉ lấy 'id' giúp query nhẹ và nhanh hơn
    $profile = HelperProfile::select('id')
      ->where('user_id', $request->authUser['id'])
      ->first();

    if (!$profile) {
      return $this->notFoundResponse('Bạn chưa có hồ sơ.');
    }

    $action = $request->input('action');
    $maxDate = now()->addDays(60)->toDateString();

    $dateRule = 'required|date';
    if ($action === 'create') {
      $dateRule .= "|after_or_equal:today|before_or_equal:{$maxDate}";
    }

    // Tối ưu 2: Validate chặt chẽ
    $validated = $request->validate([
      'action'                 => 'required|string|in:create,delete',
      'slots'                  => 'required|array|min:1|max:300',
      'slots.*.available_date' => $dateRule,
      'slots.*.start_time'     => 'required|date_format:H:i',
    ]);

    try {
      $stats = $availabilityService->bulkOperation(
        $profile->id,
        $validated['action'],
        $validated['slots']
      );

      return $this->successResponse(
        $stats,
        'Bulk operation completed'
      );
    } catch (\Exception $e) {
      // Tối ưu 4: Log thêm profile_id để dễ truy vết sự cố
      Log::error("Bulk availability error [Profile ID: {$profile->id}]: " . $e->getMessage(), [
        'exception' => $e
      ]);

      return $this->errorResponse(
        'Operation failed, please try again.',
        Response::HTTP_INTERNAL_SERVER_ERROR
      );
    }
  }

  // =====================================================================
  //  VERIFICATION — Helper nộp hồ sơ xét duyệt (role: helper)
  // =====================================================================

  public function submitVerification(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    // Kiểm tra nếu đang có verification pending
    $pending = HelperVerification::where('helper_id', $profile->id)
      ->where('status', 'pending')
      ->exists();

    if ($pending) {
      return $this->errorResponse('Hồ sơ của bạn đang chờ xét duyệt.', Response::HTTP_CONFLICT);
    }

    $verification = HelperVerification::create([
      'helper_id' => $profile->id,
      'status'    => 'pending',
    ]);

    $profile->update(['status' => 'pending']);

    return $this->successResponse($verification, 'Đã nộp hồ sơ xét duyệt. Vui lòng chờ Admin/Operator xử lý.', Response::HTTP_CREATED);
  }

  public function myVerificationStatus(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
    if (!$profile) return $this->notFoundResponse('Bạn chưa có hồ sơ.');

    $verifications = HelperVerification::where('helper_id', $profile->id)
      ->orderByDesc('created_at')
      ->get();

    return $this->successResponse($verifications);
  }

  public function dashboardStats(Request $request)
  {
    if ($unauthorized = $this->authorizeHelper($request)) {
      return $unauthorized;
    }

    $userId = $request->authUser['id'];
    $profile = HelperProfile::where('user_id', $userId)->first();
    if (!$profile) {
      return $this->notFoundResponse('Bạn chưa có hồ sơ.');
    }

    $token = $request->header('Authorization');

    $orderStats = [
      'booking_ids' => [],
      'job_post_ids' => [],
      'metrics' => [
        'completed_jobs' => 0,
        'in_progress_jobs' => 0,
        'waiting_confirmation_jobs' => 0,
        'acceptance_rate' => 100.0,
        'cancel_rate' => 0.0,
      ],
      'reviews_stats' => [
        'rating_avg' => 0,
        'total_reviews' => 0,
        'recent_reviews' => [],
      ]
    ];

    try {
      $orderResponse = Http::timeout(5)
        ->withHeaders(['Authorization' => $token])
        ->get(env('ORDER_SERVICE_URL', 'http://order-service:8000') . '/api/orders/helper/stats');

      if ($orderResponse->successful()) {
        $res = $orderResponse->json();
        $orderStats = isset($res['data']) ? $res['data'] : $res;
      }
    } catch (\Exception $e) {
      Log::error('Không thể lấy thống kê từ dịch vụ đặt lịch: ' . $e->getMessage());
    }

    $paymentStats = [
      'total_income' => 0.0,
      'booking_income' => 0.0,
      'job_post_income' => 0.0,
      'monthly_income' => [],
    ];

    $bookingIds = $orderStats['booking_ids'] ?? [];
    $jobPostIds = $orderStats['job_post_ids'] ?? [];

    if (!empty($bookingIds) || !empty($jobPostIds)) {
      try {
        $paymentResponse = Http::timeout(5)
          ->withHeaders(['Authorization' => $token])
          ->post(env('PAYMENT_SERVICE_URL', 'http://payment-service:8000') . '/api/payments/helper/earnings-stats', [
            'booking_ids' => $bookingIds,
            'job_post_ids' => $jobPostIds,
          ]);

        if ($paymentResponse->successful()) {
          $paymentStats = $paymentResponse->json();
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thống kê từ dịch vụ thanh toán: ' . $e->getMessage());
      }
    }

    $startOfWeek = now()->startOfWeek()->toDateString();
    $endOfWeek = now()->endOfWeek()->toDateString();
    
    $availabilitiesCount = HelperAvailability::where('helper_id', $profile->id)
      ->whereBetween('available_date', [$startOfWeek, $endOfWeek])
      ->count();

    $workingAreasCount = HelperWorkingArea::where('helper_id', $profile->id)->count();

    $latestVerification = HelperVerification::where('helper_id', $profile->id)
      ->orderByDesc('created_at')
      ->first();
    $verificationStatus = $latestVerification ? $latestVerification->status : 'unsubmitted';

    return response()->json([
      'earnings' => $paymentStats,
      'jobs' => $orderStats['metrics'] ?? [],
      'reviews' => $orderStats['reviews_stats'] ?? [],
      'operations' => [
        'availabilities_this_week' => $availabilitiesCount,
        'active_working_areas' => $workingAreasCount,
        'verification_status' => $verificationStatus,
      ]
    ], Response::HTTP_OK);
  }
}
