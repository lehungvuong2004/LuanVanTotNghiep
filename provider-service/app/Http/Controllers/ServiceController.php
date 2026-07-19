<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use App\Models\HelperProfile;
use App\Models\HelperSkill;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
  /**
   * Danh sách danh mục dịch vụ đang hoạt động (public).
   */
  public function listCategories(Request $request)
  {
    $query = ServiceCategory::with([
      'services' => fn($q) => $q->where('status', 'active')
    ])->withCount('services');

    if ($request->filled('type')) {
      $query->where('type', $request->query('type'));
    }

    $categories = $query->where('status', 'active')
      ->orderBy('name')
      ->get();

    return $this->successResponse($categories);
  }

  /**
   * Chi tiết 1 danh mục (kèm danh sách dịch vụ active).
   */
  public function showCategory($id)
  {
    $category = ServiceCategory::with(['services' => fn($q) => $q->where('status', 'active')])
      ->where('status', 'active')
      ->find($id);

    if (!$category) {
      return $this->notFoundResponse('Không tìm thấy danh mục.');
    }

    return $this->successResponse($category);
  }

  /**
   * Danh sách dịch vụ đang hoạt động (public).
   * Filter: category_id, price_type, min_price, max_price
   */
  public function listServices(Request $request)
  {
    $query = Service::with('category')->where('status', 'active');

    if ($request->filled('category_id')) {
      $query->where('category_id', $request->query('category_id'));
    }

    if ($request->filled('price_type')) {
      $query->where('price_type', $request->query('price_type'));
    }

    if ($request->filled('min_price')) {
      $query->where('base_price', '>=', (float) $request->query('min_price'));
    }

    if ($request->filled('max_price')) {
      $query->where('base_price', '<=', (float) $request->query('max_price'));
    }

    if ($request->filled('city')) {
      $city = $request->query('city');
      $query->whereHas('helperSkills.helperProfile', function ($q) use ($city) {
        $q->where('status', 'active')
          ->whereHas('workingAreas', fn($w) => $w->where('city', $city));
      });
    }

    if ($request->filled('district')) {
      $district = $request->query('district');
      $query->whereHas('helperSkills.helperProfile', function ($q) use ($district) {
        $q->where('status', 'active')
          ->whereHas('workingAreas', fn($w) => $w->where('district', $district));
      });
    }

    $limit    = $request->integer('limit', 50);
    $services = $query->orderBy('name')->paginate($limit);

    return $this->successResponse($services);
  }

  /**
   * Chi tiết 1 dịch vụ kèm thống kê helpers, rating (public).
   */
  public function showService($id)
  {
    $service = Service::with('category')
      ->where('status', 'active')
      ->find($id);

    if (!$service) {
      return $this->notFoundResponse('Không tìm thấy dịch vụ.');
    }

    // Đếm số helpers active có kỹ năng dịch vụ này
    $helpersCount = HelperProfile::where('status', 'active')
      ->whereHas('skills', fn($q) => $q->where('service_id', $id))
      ->count();

    // Lấy danh sách helpers có kỹ năng dịch vụ này (top 8, sắp xếp theo rating)
    $helpers = HelperProfile::with(['skills.service', 'workingAreas'])
      ->where('status', 'active')
      ->whereHas('skills', fn($q) => $q->where('service_id', $id))
      ->orderByDesc('rating_avg')
      ->orderByDesc('total_reviews')
      ->limit(8)
      ->get();

    // Fetch user info for helpers from identity-service
    $userIds = $helpers->pluck('user_id')->filter()->unique()->toArray();
    if (!empty($userIds)) {
      try {
        $userResponse = Http::timeout(3)
          ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $userIds]);
        if ($userResponse->successful()) {
          $userMap = collect($userResponse->json('data') ?? [])->keyBy('id');
          foreach ($helpers as $h) {
            $h->user = $userMap->get($h->user_id);
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin người dùng cho người giúp việc thuộc dịch vụ: ' . $e->getMessage());
      }
    }

    // Lấy rating stats từ order-service (cross-service)
    $ratingStats = null;
    try {
      // Lấy tất cả helper_ids có kỹ năng dịch vụ này
      $helperIds = HelperProfile::where('status', 'active')
        ->whereHas('skills', fn($q) => $q->where('service_id', $id))
        ->pluck('id')
        ->toArray();

      if (!empty($helperIds)) {
        $reviewResponse = Http::timeout(3)
          ->post(env('ORDER_SERVICE_URL', 'http://order-service:8000') . '/api/orders/internal/service-review-stats', [
            'helper_ids' => $helperIds
          ]);
        if ($reviewResponse->successful()) {
          $ratingStats = $reviewResponse->json('data');
        }
      }
    } catch (\Exception $e) {
      Log::error('Không thể lấy thống kê đánh giá cho dịch vụ: ' . $e->getMessage());
    }

    return response()->json([
      'data' => $service,
      'helpers_count' => $helpersCount,
      'helpers' => $helpers,
      'rating_stats' => $ratingStats,
    ], Response::HTTP_OK);
  }

  /**
   * Danh sách helpers của 1 dịch vụ (public, có phân trang).
   */
  public function serviceHelpers(Request $request, $id)
  {
    $service = Service::where('status', 'active')->find($id);
    if (!$service) {
      return $this->notFoundResponse('Không tìm thấy dịch vụ.');
    }

    $query = HelperProfile::with(['skills.service', 'workingAreas'])
      ->where('status', 'active')
      ->whereHas('skills', fn($q) => $q->where('service_id', $id));

    if ($request->filled('city')) {
      $query->whereHas('workingAreas', fn($q) => $q->where('city', $request->query('city')));
    }

    if ($request->filled('district')) {
      $query->whereHas('workingAreas', fn($q) => $q->where('district', $request->query('district')));
    }

    if ($request->filled('rating_min')) {
      $query->where('rating_avg', '>=', (float) $request->query('rating_min'));
    }

    $limit = $request->integer('limit', 12);
    $helpers = $query->orderByDesc('rating_avg')
      ->orderByDesc('total_reviews')
      ->paginate($limit);

    // Fetch user info
    $userIds = $helpers->pluck('user_id')->filter()->unique()->toArray();
    if (!empty($userIds)) {
      try {
        $userResponse = Http::timeout(3)
          ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $userIds]);
        if ($userResponse->successful()) {
          $userMap = collect($userResponse->json('data') ?? [])->keyBy('id');
          foreach ($helpers->items() as $h) {
            $h->user = $userMap->get($h->user_id);
          }
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin chi tiết danh sách người giúp việc theo dịch vụ: ' . $e->getMessage());
      }
    }

    return $this->successResponse($helpers);
  }

  /**
   * Danh sách dịch vụ kèm thống kê helpers_count & rating (public enriched).
   */
  public function listServicesEnriched(Request $request)
  {
    $query = Service::with('category')->where('status', 'active');

    if ($request->filled('category_id')) {
      $query->where('category_id', $request->query('category_id'));
    }
    if ($request->filled('price_type')) {
      $query->where('price_type', $request->query('price_type'));
    }
    if ($request->filled('min_price')) {
      $query->where('base_price', '>=', (float) $request->query('min_price'));
    }
    if ($request->filled('max_price')) {
      $query->where('base_price', '<=', (float) $request->query('max_price'));
    }

    $limit = $request->integer('limit', 50);
    $services = $query->orderBy('name')->paginate($limit);

    // Enrich each service with helpers_count
    foreach ($services->items() as $service) {
      $service->helpers_count = HelperProfile::where('status', 'active')
        ->whereHas('skills', fn($q) => $q->where('service_id', $service->id))
        ->count();
    }

    // Fetch review stats from order-service for all services at once
    $allHelperIds = HelperProfile::where('status', 'active')->pluck('id')->toArray();
    $reviewStatsMap = [];
    if (!empty($allHelperIds)) {
      try {
        $reviewResponse = Http::timeout(5)
          ->post(env('ORDER_SERVICE_URL', 'http://order-service:8000') . '/api/orders/internal/reviews-by-helpers', [
            'helper_ids' => $allHelperIds
          ]);
        if ($reviewResponse->successful()) {
          $reviewStatsMap = $reviewResponse->json('data') ?? [];
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thống kê đánh giá hàng loạt: ' . $e->getMessage());
      }
    }

    // Map reviews to services
    foreach ($services->items() as $service) {
      $serviceHelperIds = HelperSkill::where('service_id', $service->id)
        ->pluck('helper_id')
        ->toArray();

      $totalReviews = 0;
      $totalRating = 0;
      foreach ($serviceHelperIds as $hid) {
        if (isset($reviewStatsMap[$hid])) {
          $totalReviews += $reviewStatsMap[$hid]['total_reviews'] ?? 0;
          $totalRating += ($reviewStatsMap[$hid]['avg_rating'] ?? 0) * ($reviewStatsMap[$hid]['total_reviews'] ?? 0);
        }
      }
      $service->total_reviews = $totalReviews;
      $service->avg_rating = $totalReviews > 0 ? round($totalRating / $totalReviews, 1) : 0;
    }

    return $this->successResponse($services);
  }

  // =====================================================================
  //  ADMIN — Quản lý danh mục & dịch vụ (role_id = 1)
  // =====================================================================

  // -- CATEGORIES --

  public function adminListCategories(Request $request)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $query = ServiceCategory::withCount('services');

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    return $this->successResponse($query->orderBy('name')->get());
  }

  public function createCategory(Request $request)
  {
    if ($unauthorized = $this->authorizeRoles($request, [Role::ADMIN])) {
      return $unauthorized;
    }

    $fields = $request->validate([
      'name'        => 'required|string|max:100|unique:service_categories,name',
      'description' => 'nullable|string|max:500',
      'icon'        => 'nullable|string|max:255',
      'type'        => 'sometimes|string|in:booking,job,both',
      'status'      => 'sometimes|string|in:active,inactive',
    ], [
      'name.unique' => 'Tên danh mục đã tồn tại.',
    ]);

    $category = ServiceCategory::create($fields);

    return $this->successResponse($category, 'Tạo danh mục thành công.', Response::HTTP_CREATED);
  }

  public function updateCategory(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeRoles($request, [Role::ADMIN])) {
      return $unauthorized;
    }

    $category = ServiceCategory::find($id);
    if (!$category) return $this->notFoundResponse('Không tìm thấy danh mục.');

    $fields = $request->validate([
      'name'        => 'sometimes|required|string|max:100|unique:service_categories,name,' . $id,
      'description' => 'sometimes|nullable|string|max:500',
      'icon'        => 'sometimes|nullable|string|max:255',
      'type'        => 'sometimes|string|in:booking,job,both',
      'status'      => 'sometimes|string|in:active,inactive',
    ]);

    $category->update($fields);

    return $this->successResponse($category, 'Cập nhật danh mục thành công.');
  }

  public function deleteCategory(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeRoles($request, [Role::ADMIN])) {
      return $unauthorized;
    }

    $category = ServiceCategory::find($id);
    if (!$category) return $this->notFoundResponse('Không tìm thấy danh mục.');

    // Kiểm tra còn service đang dùng danh mục này không
    if ($category->services()->exists()) {
      return $this->errorResponse('Không thể xóa danh mục đang có dịch vụ.', Response::HTTP_CONFLICT);
    }

    $category->delete();
    return $this->successResponse(null, 'Xóa danh mục thành công.');
  }

  // -- SERVICES --

  public function adminListServices(Request $request)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $query = Service::with('category');

    if ($request->filled('category_id')) {
      $query->where('category_id', $request->query('category_id'));
    }

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    $limit    = $request->integer('limit', 20);
    $services = $query->orderBy('name')->paginate($limit);

    return $this->successResponse($services);
  }

  public function createService(Request $request)
  {
    if ($unauthorized = $this->authorizeRoles($request, [Role::ADMIN])) {
      return $unauthorized;
    }

    $fields = $request->validate([
      'category_id' => 'required|integer|exists:service_categories,id',
      'name'        => 'required|string|max:100',
      'description' => 'nullable|string',
      'base_price'  => 'required|numeric|min:0',
      'price_type'  => 'required|string|in:hourly,fixed,daily',
      'status'      => 'sometimes|string|in:active,inactive',
    ]);

    $service = Service::create($fields);

    return $this->successResponse($service->load('category'), 'Tạo dịch vụ thành công.', Response::HTTP_CREATED);
  }

  public function updateService(Request $request, $id)
  {
    $isAdmin = ($request->authUser['role_id'] === Role::ADMIN);
    $isOperator = ($request->authUser['role_id'] === Role::OPERATOR);

    if (!$isAdmin && !$isOperator) {
      return $this->forbiddenResponse();
    }

    if ($isOperator) {
      $keys = array_keys($request->all());
      if (count($keys) > 1 || !in_array('status', $keys)) {
        return $this->forbiddenResponse('Bạn không có quyền sửa các trường khác ngoài trạng thái.');
      }
    }

    $service = Service::find($id);
    if (!$service) return $this->notFoundResponse('Không tìm thấy dịch vụ.');

    $fields = $request->validate([
      'category_id' => 'sometimes|integer|exists:service_categories,id',
      'name'        => 'sometimes|required|string|max:100',
      'description' => 'sometimes|nullable|string',
      'base_price'  => 'sometimes|required|numeric|min:0',
      'price_type'  => 'sometimes|string|in:hourly,fixed,daily',
      'status'      => 'sometimes|string|in:active,inactive',
    ]);

    $service->update($fields);

    return $this->successResponse($service->load('category'), 'Cập nhật dịch vụ thành công.');
  }

  public function deleteService(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeRoles($request, [Role::ADMIN])) {
      return $unauthorized;
    }

    $service = Service::find($id);
    if (!$service) return $this->notFoundResponse('Không tìm thấy dịch vụ.');

    $service->delete();
    return $this->successResponse(null, 'Xóa dịch vụ thành công.');
  }
}
