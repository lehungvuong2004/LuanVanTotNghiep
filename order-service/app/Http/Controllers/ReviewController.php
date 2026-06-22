<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
    // =====================================================================
    //  PUBLIC — Browse reviews
    // =====================================================================

    /**
     * List reviews for a specific helper (public).
     * Filter: rating, helper_id
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

        return response()->json([
            'helper_id'     => (int) $helperId,
            'rating_avg'    => $avg ? round($avg, 2) : null,
            'total_reviews' => Review::where('helper_id', $helperId)->count(),
            'data'          => $reviews,
        ], 200);
    }

    // =====================================================================
    //  ADMIN — Review management
    // =====================================================================

    /**
     * Admin lists all reviews with filters.
     * Role: admin (1) or operator (4)
     */
    public function adminIndex(Request $request)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = Review::orderByDesc('created_at');

        if ($request->filled('helper_id'))   $query->where('helper_id', $request->query('helper_id'));
        if ($request->filled('customer_id')) $query->where('customer_id', $request->query('customer_id'));
        if ($request->filled('rating'))      $query->where('rating', (int) $request->query('rating'));
        if ($request->filled('booking_id'))  $query->where('booking_id', $request->query('booking_id'));

        $limit   = (int) $request->query('limit', 20);
        $reviews = $query->paginate($limit);

        return response()->json(['data' => $reviews], 200);
    }

    /**
     * Admin/Operator deletes a review that violates guidelines.
     * Role: admin (1) or operator (2)
     */
    public function adminDestroy(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $review = Review::find($id);
        if (!$review) return response()->json(['message' => 'Review not found.'], 404);

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.'], 200);
    }

    /**
     * Admin/Operator updates a review.
     * Role: admin (1) or operator (2)
     */
    public function adminUpdate(Request $request, $id)
    {
        if (!in_array($request->authUser['role_id'], [1, 2])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $review = Review::find($id);
        if (!$review) return response()->json(['message' => 'Review not found.'], 404);

        $fields = $request->validate([
            'rating'  => 'sometimes|integer|between:1,5',
            'comment' => 'sometimes|string|max:1000|nullable',
        ]);

        $review->update($fields);

        return response()->json([
            'message' => 'Review updated successfully.',
            'data'    => $review->fresh(),
        ], 200);
    }
}
