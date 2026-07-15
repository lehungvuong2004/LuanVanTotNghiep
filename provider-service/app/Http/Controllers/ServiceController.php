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

    return response()->json(['data' => $categories], Response::HTTP_OK);
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
      return response()->json(['message' => 'Không tìm thấy danh mục.'], Response::HTTP_NOT_FOUND);
    }

    return response()->json(['data' => $category], Response::HTTP_OK);
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

    $limit    = (int) $request->query('limit', 50);
    $services = $query->orderBy('name')->paginate($limit);

    return response()->json(['data' => $services], Response::HTTP_OK);
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
      return response()->json(['message' => 'Không tìm thấy dịch vụ.'], Response::HTTP_NOT_FOUND);
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
        Log::error('Failed to fetch user info for service helpers: ' . $e->getMessage());
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
      Log::error('Failed to fetch review stats for service: ' . $e->getMessage());
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
      return response()->json(['message' => 'Không tìm thấy dịch vụ.'], Response::HTTP_NOT_FOUND);
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

    $limit = (int) $request->query('limit', 12);
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
        Log::error('Failed to fetch user info for service helpers list: ' . $e->getMessage());
      }
    }

    return response()->json(['data' => $helpers], Response::HTTP_OK);
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

    $limit = (int) $request->query('limit', 50);
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
        Log::error('Failed to fetch bulk review stats: ' . $e->getMessage());
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

    return response()->json(['data' => $services], Response::HTTP_OK);
  }

  // =====================================================================
  //  ADMIN — Quản lý danh mục & dịch vụ (role_id = 1)
  // =====================================================================

  // -- CATEGORIES --

  public function adminListCategories(Request $request)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $query = ServiceCategory::withCount('services');

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    return response()->json(['data' => $query->orderBy('name')->get()], Response::HTTP_OK);
  }

  public function createCategory(Request $request)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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

    return response()->json([
      'message' => 'Tạo danh mục thành công.',
      'data'    => $category,
    ], Response::HTTP_CREATED);
  }

  public function updateCategory(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $category = ServiceCategory::find($id);
    if (!$category) return response()->json(['message' => 'Không tìm thấy danh mục.'], Response::HTTP_NOT_FOUND);

    $fields = $request->validate([
      'name'        => 'sometimes|required|string|max:100|unique:service_categories,name,' . $id,
      'description' => 'sometimes|nullable|string|max:500',
      'icon'        => 'sometimes|nullable|string|max:255',
      'type'        => 'sometimes|string|in:booking,job,both',
      'status'      => 'sometimes|string|in:active,inactive',
    ]);

    $category->update($fields);

    return response()->json([
      'message' => 'Cập nhật danh mục thành công.',
      'data'    => $category,
    ], Response::HTTP_OK);
  }

  public function deleteCategory(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $category = ServiceCategory::find($id);
    if (!$category) return response()->json(['message' => 'Không tìm thấy danh mục.'], Response::HTTP_NOT_FOUND);

    // Kiểm tra còn service đang dùng danh mục này không
    if ($category->services()->exists()) {
      return response()->json(['message' => 'Không thể xóa danh mục đang có dịch vụ.'], Response::HTTP_CONFLICT);
    }

    $category->delete();
    return response()->json(['message' => 'Xóa danh mục thành công.'], Response::HTTP_OK);
  }

  // -- SERVICES --

  public function adminListServices(Request $request)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $query = Service::with('category');

    if ($request->filled('category_id')) {
      $query->where('category_id', $request->query('category_id'));
    }

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    $limit    = (int) $request->query('limit', 20);
    $services = $query->orderBy('name')->paginate($limit);

    return response()->json(['data' => $services], Response::HTTP_OK);
  }

  public function createService(Request $request)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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

    return response()->json([
      'message' => 'Tạo dịch vụ thành công.',
      'data'    => $service->load('category'),
    ], Response::HTTP_CREATED);
  }

  public function updateService(Request $request, $id)
  {
    $isAdmin = ($request->authUser['role_id'] === Role::ADMIN);
    $isOperator = ($request->authUser['role_id'] === Role::OPERATOR);

    if (!$isAdmin && !$isOperator) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    if ($isOperator) {
      $keys = array_keys($request->all());
      if (count($keys) > 1 || !in_array('status', $keys)) {
        return response()->json(['message' => 'Bạn không có quyền sửa các trường khác ngoài trạng thái.'], Response::HTTP_FORBIDDEN);
      }
    }

    $service = Service::find($id);
    if (!$service) return response()->json(['message' => 'Không tìm thấy dịch vụ.'], Response::HTTP_NOT_FOUND);

    $fields = $request->validate([
      'category_id' => 'sometimes|integer|exists:service_categories,id',
      'name'        => 'sometimes|required|string|max:100',
      'description' => 'sometimes|nullable|string',
      'base_price'  => 'sometimes|required|numeric|min:0',
      'price_type'  => 'sometimes|string|in:hourly,fixed,daily',
      'status'      => 'sometimes|string|in:active,inactive',
    ]);

    $service->update($fields);

    return response()->json([
      'message' => 'Cập nhật dịch vụ thành công.',
      'data'    => $service->load('category'),
    ], Response::HTTP_OK);
  }

  public function deleteService(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::ADMIN) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $service = Service::find($id);
    if (!$service) return response()->json(['message' => 'Không tìm thấy dịch vụ.'], Response::HTTP_NOT_FOUND);

    $service->delete(); // Thực hiện xóa cứng khỏi database
    return response()->json(['message' => 'Xóa dịch vụ thành công.'], Response::HTTP_OK);
  }
}
