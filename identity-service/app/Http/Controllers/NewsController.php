<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\News;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    // =====================================================================
    //  PUBLIC — Không cần token
    // =====================================================================

    /**
     * Danh sách tin tức public (chỉ status = published).
     */
    public function index(Request $request)
    {
        $query = News::with('creator:id,full_name,avatar')
            ->where('status', 'published')
            ->orderBy('created_at', 'desc');

        $limit = (int) $request->query('limit', 9);
        $news  = $query->paginate($limit);

        return response()->json(['data' => $news], Response::HTTP_OK);
    }

    /**
     * Chi tiết 1 bài viết theo slug (public).
     */
    public function show($slug)
    {
        $article = News::with('creator:id,full_name,avatar')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (!$article) {
            return response()->json(['message' => 'Bài viết không tồn tại hoặc chưa được xuất bản.'], Response::HTTP_NOT_FOUND);
        }

        return response()->json(['data' => $article], Response::HTTP_OK);
    }

    // =====================================================================
    //  ADMIN — Quản lý News (role_id = 1)
    // =====================================================================

    /**
     * Admin lấy toàn bộ danh sách (có lọc status, search, phân trang).
     */
    public function adminIndex(Request $request)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $query = News::with('creator:id,full_name,avatar');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit = (int) $request->query('limit', 15);
        $news  = $query->orderBy('created_at', 'desc')->paginate($limit);

        return response()->json(['data' => $news], Response::HTTP_OK);
    }

    /**
     * Admin tạo mới bài viết.
     */
    public function store(Request $request)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $fields = $request->validate([
            'title'     => 'required|string|max:150',
            'slug'      => 'nullable|string|max:191|unique:news,slug',
            'thumbnail' => 'nullable|string|max:255',
            'summary'   => 'nullable|string|max:500',
            'content'   => 'required|string',
            'status'    => 'sometimes|string|in:draft,published',
        ], [
            'title.required'   => 'Vui lòng nhập tiêu đề bài viết.',
            'content.required' => 'Vui lòng nhập nội dung bài viết.',
        ]);

        $article = News::create([
            'title'      => $fields['title'],
            'slug'       => $fields['slug'] ?? Str::slug($fields['title']),
            'thumbnail'  => $fields['thumbnail'] ?? null,
            'summary'    => $fields['summary']   ?? null,
            'content'    => $fields['content'],
            'status'     => $fields['status']    ?? 'draft',
            'created_by' => $currentUser->id,
        ]);

        $article->load('creator:id,full_name,avatar');

        return response()->json([
            'message' => 'Tạo bài viết thành công.',
            'data'    => $article,
        ], Response::HTTP_CREATED);
    }

    /**
     * Admin cập nhật bài viết.
     */
    public function update(Request $request, $id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $article = News::find($id);
        if (!$article) {
            return response()->json(['message' => 'Không tìm thấy bài viết.'], Response::HTTP_NOT_FOUND);
        }

        $fields = $request->validate([
            'title'     => 'sometimes|required|string|max:150',
            'slug'      => 'sometimes|nullable|string|max:191|unique:news,slug,' . $id,
            'thumbnail' => 'nullable|string|max:255',
            'summary'   => 'nullable|string|max:500',
            'content'   => 'sometimes|required|string',
            'status'    => 'sometimes|required|string|in:draft,published',
        ]);

        $article->update($fields);
        $article->load('creator:id,full_name,avatar');

        return response()->json([
            'message' => 'Cập nhật bài viết thành công.',
            'data'    => $article,
        ], Response::HTTP_OK);
    }

    /**
     * Admin toggle status (draft <-> published).
     */
    public function toggleStatus(Request $request, $id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $article = News::find($id);
        if (!$article) {
            return response()->json(['message' => 'Không tìm thấy bài viết.'], Response::HTTP_NOT_FOUND);
        }

        $request->validate([
            'status' => 'required|string|in:draft,published',
        ]);

        $article->update(['status' => $request->input('status')]);

        return response()->json([
            'message' => 'Cập nhật trạng thái bài viết thành công.',
            'data'    => $article,
        ], Response::HTTP_OK);
    }

    /**
     * Admin xóa bài viết.
     */
    public function destroy($id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $article = News::find($id);
        if (!$article) {
            return response()->json(['message' => 'Không tìm thấy bài viết.'], Response::HTTP_NOT_FOUND);
        }

        $article->delete();

        return response()->json(['message' => 'Xóa bài viết thành công.'], Response::HTTP_OK);
    }
}
