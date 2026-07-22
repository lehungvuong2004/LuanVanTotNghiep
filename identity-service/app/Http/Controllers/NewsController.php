<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\News;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;
use App\Services\ImageUploadService;

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

        $limit = $request->integer('limit', 9);
        $news  = $query->paginate($limit);

        return $this->successResponse($news);
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
            return $this->notFoundResponse('Bài viết không tồn tại hoặc chưa được xuất bản.');
        }

        return $this->successResponse($article);
    }

    // =====================================================================
    //  ADMIN — Quản lý News (bảo vệ bởi AdminMiddleware)
    // =====================================================================

    /**
     * Admin lấy toàn bộ danh sách (có lọc status, search, phân trang).
     */
    public function adminIndex(Request $request)
    {
        $query = News::with('creator:id,full_name,avatar');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit = $request->integer('limit', 15);
        $news  = $query->orderBy('created_at', 'desc')->paginate($limit);

        return $this->successResponse($news);
    }

    /**
     * Admin tạo mới bài viết.
     */
    public function store(Request $request)
    {
        $currentUser = $this->getAuthUser();

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

        $slug = $fields['slug'] ?? Str::slug($fields['title']);
        $originalSlug = $slug;
        while (News::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-" . substr(uniqid(), -4);
        }

        $article = News::create([
            'title'      => $fields['title'],
            'slug'       => $slug,
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
        $article = News::find($id);
        if (!$article) {
            return $this->notFoundResponse('Không tìm thấy bài viết.');
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
        $article = News::find($id);
        if (!$article) {
            return $this->notFoundResponse('Không tìm thấy bài viết.');
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
        $article = News::find($id);
        if (!$article) {
            return $this->notFoundResponse('Không tìm thấy bài viết.');
        }

        $article->delete();

        return $this->successResponse(null, 'Xóa bài viết thành công.');
    }

    /**
     * Upload hình ảnh bài viết lên server.
     */
    public function uploadImage(Request $request, ImageUploadService $imageUploadService)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'image.required' => 'Vui lòng chọn hình ảnh bài viết.',
            'image.image'    => 'File tải lên phải là hình ảnh.',
            'image.mimes'    => 'Chấp nhận các định dạng ảnh: jpeg, png, jpg, webp.',
            'image.max'      => 'Kích thước ảnh tối đa là 2MB.',
        ]);

        if ($request->hasFile('image')) {
            $result = $imageUploadService->upload($request->file('image'), 'news');

            return response()->json([
                'message' => 'Tải lên hình ảnh thành công.',
                'path'    => $result['path'],
                'url'     => $result['url']
            ], Response::HTTP_OK);
        }

        return $this->errorResponse('Không tìm thấy file hình ảnh.');
    }
}
