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

    $limit   = (int) $request->query('limit', 20);
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
        Log::error('Failed to fetch customer info for reviews: ' . $e->getMessage());
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
      return response()->json(['data' => null], Response::HTTP_OK);
    }

    $totalReviews = Review::whereIn('helper_id', $helperIds)->count();
    $avgRating = Review::whereIn('helper_id', $helperIds)->avg('rating');

    $ratingDist = [];
    for ($i = 1; $i <= 5; $i++) {
      $ratingDist[$i] = Review::whereIn('helper_id', $helperIds)->where('rating', $i)->count();
    }

    return response()->json([
      'data' => [
        'total_reviews'      => $totalReviews,
        'avg_rating'         => $avgRating ? round($avgRating, 2) : 0,
        'rating_distribution' => $ratingDist,
      ]
    ], Response::HTTP_OK);
  }

  /**
   * Thống kê review theo từng helper (gọi nội bộ từ provider-service).
   */
  public function reviewsByHelpers(Request $request)
  {
    $helperIds = $request->input('helper_ids', []);
    if (empty($helperIds)) {
      return response()->json(['data' => []], Response::HTTP_OK);
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

    return response()->json(['data' => $result], Response::HTTP_OK);
  }

    // =====================================================================
    //  CUSTOMER — Viết review sau khi hoàn thành dịch vụ
    // =====================================================================

  /**
   * Customer tạo review (role = 4).
   */
  public function customerCreate(Request $request)
  {
    if ($request->authUser['role_id'] !== Role::CUSTOMER) {
      return response()->json(['message' => 'Chỉ khách hàng mới được viết đánh giá.'], Response::HTTP_FORBIDDEN);
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
      Log::error('Failed to update helper rating: ' . $e->getMessage());
    }

    return response()->json([
      'message' => 'Cảm ơn bạn đã đánh giá!',
      'data'    => $review,
    ], Response::HTTP_CREATED);
  }

    // =====================================================================
    //  ADMIN — Review management
    // =====================================================================

  /**
   * Admin lists all reviews with filters.
   */
  public function adminIndex(Request $request)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $query = Review::orderByDesc('created_at');

    if ($request->filled('helper_id'))   $query->where('helper_id', $request->query('helper_id'));
    if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));
    if ($request->filled('rating'))      $query->where('rating', (int) $request->query('rating'));
    if ($request->filled('booking_id'))  $query->where('booking_id', $request->query('booking_id'));

    $limit   = (int) $request->query('limit', 20);
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
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $review = Review::find($id);
    if (!$review) return response()->json(['message' => 'Review not found.'], Response::HTTP_NOT_FOUND);

    $review->delete();
    return response()->json(['message' => 'Review deleted successfully.'], Response::HTTP_OK);
  }

  public function adminUpdate(Request $request, $id)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
    }

    $review = Review::find($id);
    if (!$review) return response()->json(['message' => 'Review not found.'], Response::HTTP_NOT_FOUND);

    $fields = $request->validate([
      'rating'  => 'sometimes|integer|between:1,5',
      'comment' => 'sometimes|string|max:1000|nullable',
    ]);

    $review->update($fields);

    return response()->json([
      'message' => 'Review updated successfully.',
      'data'    => $review->fresh(),
    ], Response::HTTP_OK);
  }

  public function adminCreate(Request $request)
  {
    if (!in_array($request->authUser['role_id'], [Role::ADMIN, Role::OPERATOR])) {
      return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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

    return response()->json([
      'message' => 'Review created successfully.',
      'data'    => $review,
    ], Response::HTTP_CREATED);
  }

  /**
   * Customer cập nhật review của chính mình.
   */
  public function customerUpdate(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::CUSTOMER) {
      return response()->json(['message' => 'Chỉ khách hàng mới có quyền sửa đánh giá.'], Response::HTTP_FORBIDDEN);
    }

    $review = Review::find($id);
    if (!$review) {
      return response()->json(['message' => 'Không tìm thấy đánh giá.'], Response::HTTP_NOT_FOUND);
    }

    if ((int) $review->customer_id !== (int) $request->authUser['id']) {
      return response()->json(['message' => 'Bạn chỉ được sửa đánh giá của chính mình.'], Response::HTTP_FORBIDDEN);
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
      Log::error('Failed to update helper rating on update: ' . $e->getMessage());
    }

    return response()->json([
      'message' => 'Cập nhật đánh giá thành công!',
      'data'    => $review->fresh(),
    ], Response::HTTP_OK);
  }

  /**
   * Customer xóa review của chính mình.
   */
  public function customerDestroy(Request $request, $id)
  {
    if ($request->authUser['role_id'] !== Role::CUSTOMER) {
      return response()->json(['message' => 'Chỉ khách hàng mới có quyền xóa đánh giá.'], Response::HTTP_FORBIDDEN);
    }

    $review = Review::find($id);
    if (!$review) {
      return response()->json(['message' => 'Không tìm thấy đánh giá.'], Response::HTTP_NOT_FOUND);
    }

    if ((int) $review->customer_id !== (int) $request->authUser['id']) {
      return response()->json(['message' => 'Bạn chỉ được xóa đánh giá của chính mình.'], Response::HTTP_FORBIDDEN);
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
      Log::error('Failed to update helper rating on delete: ' . $e->getMessage());
    }

    return response()->json([
      'message' => 'Xóa đánh giá thành công!',
    ], Response::HTTP_OK);
  }
}
