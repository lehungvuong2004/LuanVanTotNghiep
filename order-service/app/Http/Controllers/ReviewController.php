<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    // =====================================================================
    //  PUBLIC — Browse reviews
    // =====================================================================

  /**
   * List reviews for a specific helper (public).
   * Enriched with customer info from identity-service.
   */
  public function helperReviews(Request $request, $helperId)
  {
    $query = Review::where('helper_id', $helperId)
      ->orderByDesc('created_at');

    if ($request->filled('rating')) {
      $query->where('rating', (int) $request->query('rating'));
    }

    $limit   = $request->integer('limit', 20);
    $reviews = $query->paginate($limit);

    // Calculate average rating
    $avg = Review::where('helper_id', $helperId)->avg('rating');
    $totalReviews = Review::where('helper_id', $helperId)->count();

    // Rating distribution
    $ratingDist = [];
    for ($i = 1; $i <= 5; $i++) {
      $ratingDist[$i] = Review::where('helper_id', $helperId)->where('rating', $i)->count();
    }

    // Fetch customer info from identity-service
    $customerIds = collect($reviews->items())->pluck('customer_id')->filter()->unique()->toArray();
    $customerMap = [];
    if (!empty($customerIds)) {
      try {
        $userResponse = Http::timeout(3)
          ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $customerIds]);
        if ($userResponse->successful()) {
          $customerMap = collect($userResponse->json('data') ?? [])->keyBy('id')->toArray();
        }
      } catch (\Exception $e) {
        Log::error('Không thể lấy thông tin khách hàng cho đánh giá: ' . $e->getMessage());
      }
    }

    // Enrich reviews with customer info
    $enrichedReviews = collect($reviews->items())->map(function ($review) use ($customerMap) {
      $reviewArr = $review->toArray();
      $reviewArr['customer'] = $customerMap[$review->customer_id] ?? null;
      return $reviewArr;
    });

    return response()->json([
      'helper_id'      => (int) $helperId,
      'rating_avg'     => $avg ? round($avg, 2) : null,
      'total_reviews'  => $totalReviews,
      'rating_distribution' => $ratingDist,
      'data' => [
        'current_page' => $reviews->currentPage(),
        'data'         => $enrichedReviews->values(),
        'last_page'    => $reviews->lastPage(),
        'total'        => $reviews->total(),
        'per_page'     => $reviews->perPage(),
      ],
    ], Response::HTTP_OK);
  }

    // =====================================================================
    //  INTERNAL — Cross-service APIs (không cần auth)
    // =====================================================================

  /**
   * Thống kê review cho nhóm helpers (gọi từ provider-service).
   */
  public function serviceReviewStats(Request $request)
  {
    $helperIds = $request->input('helper_ids', []);
    if (empty($helperIds)) {
      return $this->successResponse(null);
    }

    $totalReviews = Review::whereIn('helper_id', $helperIds)->count();
    $avgRating = Review::whereIn('helper_id', $helperIds)->avg('rating');

    $ratingDist = [];
    for ($i = 1; $i <= 5; $i++) {
      $ratingDist[$i] = Review::whereIn('helper_id', $helperIds)->where('rating', $i)->count();
    }

    return $this->successResponse([
      'total_reviews'       => $totalReviews,
      'avg_rating'          => $avgRating ? round($avgRating, 2) : 0,
      'rating_distribution' => $ratingDist,
    ]);
  }

  /**
   * Thống kê review theo từng helper (gọi nội bộ từ provider-service).
   */
  public function reviewsByHelpers(Request $request)
  {
    $helperIds = $request->input('helper_ids', []);
    if (empty($helperIds)) {
      return $this->successResponse([]);
    }

    $result = [];
    foreach ($helperIds as $hid) {
      $count = Review::where('helper_id', $hid)->count();
      $avg   = Review::where('helper_id', $hid)->avg('rating');
      $result[$hid] = [
        'total_reviews' => $count,
        'avg_rating'    => $avg ? round($avg, 2) : 0,
      ];
    }

    return $this->successResponse($result);
  }

    // =====================================================================
    //  CUSTOMER — Viết review sau khi hoàn thành dịch vụ
    // =====================================================================

  /**
   * Customer tạo review (role = 4).
   */
  public function customerCreate(Request $request)
  {
    if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới được viết đánh giá.')) {
      return $unauthorized;
    }

    $fields = $request->validate([
      'helper_id'   => 'required|integer',
      'rating'      => 'required|integer|between:1,5',
      'comment'     => 'nullable|string|max:1000',
      'booking_id'  => 'nullable|integer',
      'job_post_id' => 'nullable|integer',
    ]);

    $fields['customer_id'] = $request->authUser['id'];

    $review = Review::create($fields);

    // Update helper rating_avg in provider-service
    try {
      $allReviews = Review::where('helper_id', $fields['helper_id']);
      $newAvg = $allReviews->avg('rating');
      $newCount = $allReviews->count();

      Http::timeout(3)->post(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/internal/update-helper-rating', [
        'helper_id'     => $fields['helper_id'],
        'rating_avg'    => round($newAvg, 2),
        'total_reviews' => $newCount,
      ]);
    } catch (\Exception $e) {
      Log::error('Không thể cập nhật điểm đánh giá trung bình của người giúp việc: ' . $e->getMessage());
    }

    return $this->successResponse($review, 'Cảm ơn bạn đã đánh giá!', Response::HTTP_CREATED);
  }

    // =====================================================================
    //  ADMIN — Review management
    // =====================================================================

  /**
   * Admin lists all reviews with filters.
   */
  public function adminIndex(Request $request)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $query = Review::orderByDesc('created_at');

    if ($request->filled('helper_id'))   $query->where('helper_id', $request->query('helper_id'));
    if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));
    if ($request->filled('rating'))      $query->where('rating', (int) $request->query('rating'));
    if ($request->filled('booking_id'))  $query->where('booking_id', $request->query('booking_id'));

    $limit   = $request->integer('limit', 20);
    $reviews = $query->paginate($limit);

    $stats = [
      1 => Review::where('rating', 1)->count(),
      2 => Review::where('rating', 2)->count(),
      3 => Review::where('rating', 3)->count(),
      4 => Review::where('rating', 4)->count(),
      5 => Review::where('rating', 5)->count(),
    ];

    return response()->json([
      'data' => $reviews,
      'rating_stats' => $stats
    ], Response::HTTP_OK);
  }

  public function adminDestroy(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $review = Review::find($id);
    if (!$review) return $this->notFoundResponse('Không tìm thấy đánh giá.');

    $review->delete();
    return $this->successResponse(null, 'Đã xóa đánh giá thành công.');
  }

  public function adminUpdate(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $review = Review::find($id);
    if (!$review) return $this->notFoundResponse('Không tìm thấy đánh giá.');

    $fields = $request->validate([
      'rating'  => 'sometimes|integer|between:1,5',
      'comment' => 'sometimes|string|max:1000|nullable',
    ]);

    $review->update($fields);

    return $this->successResponse($review->fresh(), 'Cập nhật đánh giá thành công.');
  }

  public function adminCreate(Request $request)
  {
    if ($unauthorized = $this->authorizeAdminOrOperator($request)) {
      return $unauthorized;
    }

    $fields = $request->validate([
      'customer_id' => 'required|integer',
      'helper_id'   => 'required|integer',
      'rating'      => 'required|integer|between:1,5',
      'comment'     => 'nullable|string|max:1000',
      'booking_id'  => 'nullable|integer',
      'job_post_id' => 'nullable|integer',
    ]);

    $review = Review::create($fields);

    return $this->successResponse($review, 'Tạo đánh giá thành công.', Response::HTTP_CREATED);
  }

  /**
   * Customer cập nhật review của chính mình.
   */
  public function customerUpdate(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có quyền sửa đánh giá.')) {
      return $unauthorized;
    }

    $review = Review::find($id);
    if (!$review) {
      return $this->notFoundResponse('Không tìm thấy đánh giá.');
    }

    if ((int) $review->customer_id !== (int) $request->authUser['id']) {
      return $this->forbiddenResponse('Bạn chỉ được sửa đánh giá của chính mình.');
    }

    $fields = $request->validate([
      'rating'  => 'sometimes|integer|between:1,5',
      'comment' => 'sometimes|string|max:1000|nullable',
    ]);

    $review->update($fields);

    // Update helper rating_avg in provider-service
    try {
      $allReviews = Review::where('helper_id', $review->helper_id);
      $newAvg = $allReviews->avg('rating');
      $newCount = $allReviews->count();

      Http::timeout(3)->post(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/internal/update-helper-rating', [
        'helper_id'     => $review->helper_id,
        'rating_avg'    => $newAvg ? round($newAvg, 2) : 0.00,
        'total_reviews' => $newCount,
      ]);
    } catch (\Exception $e) {
      Log::error('Không thể cập nhật điểm đánh giá của người giúp việc khi sửa đánh giá: ' . $e->getMessage());
    }

    return $this->successResponse($review->fresh(), 'Cập nhật đánh giá thành công!');
  }

  /**
   * Customer xóa review của chính mình.
   */
  public function customerDestroy(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeCustomer($request, 'Chỉ khách hàng mới có quyền xóa đánh giá.')) {
      return $unauthorized;
    }

    $review = Review::find($id);
    if (!$review) {
      return $this->notFoundResponse('Không tìm thấy đánh giá.');
    }

    if ((int) $review->customer_id !== (int) $request->authUser['id']) {
      return $this->forbiddenResponse('Bạn chỉ được sửa đánh giá của chính mình.');
    }

    $helperId = $review->helper_id;
    $review->delete();

    // Update helper rating_avg in provider-service
    try {
      $allReviews = Review::where('helper_id', $helperId);
      $newAvg = $allReviews->avg('rating');
      $newCount = $allReviews->count();

      Http::timeout(3)->post(env('PROVIDER_SERVICE_URL', 'http://provider-service:8000') . '/api/providers/internal/update-helper-rating', [
        'helper_id'     => $helperId,
        'rating_avg'    => $newAvg ? round($newAvg, 2) : 0.00,
        'total_reviews' => $newCount,
      ]);
    } catch (\Exception $e) {
      Log::error('Không thể cập nhật điểm đánh giá của người giúp việc khi xóa đánh giá: ' . $e->getMessage());
    }

    return $this->successResponse(null, 'Xóa đánh giá thành công!');
  }
}
