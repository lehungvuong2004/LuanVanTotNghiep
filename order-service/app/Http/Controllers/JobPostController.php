<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobPost;
use App\Models\JobPostService;
use App\Models\JobApplication;
use App\Models\Review;

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

    /**
     * Customer creates a new job post.
     *
     * Body:
     * {
     *   "title": "...", "description": "...", "category_id": 1,
     *   "salary": 5000000, "address": "...", "district": "...", "city": "...",
     *   "working_time": "Mon-Fri 8:00-17:00", "expired_at": "2024-09-01",
     *   "service_ids": [1, 2]
     * }
     */
    public function store(Request $request)
    {
        if ($request->authUser['role_id'] !== 4) {
            return response()->json(['message' => 'Only customers can post jobs.'], 403);
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

        // Accept the selected application; reject the rest
        $application->update(['status' => 'accepted']);
        JobApplication::where('job_post_id', $id)
                      ->where('helper_id', '!=', $helperId)
                      ->where('status', 'pending')
                      ->update(['status' => 'rejected']);

        $post->update([
            'selected_helper_id' => $helperId,
            'status'             => 'closed',
        ]);

        return response()->json([
            'message' => 'Helper selected. Job post closed.',
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
