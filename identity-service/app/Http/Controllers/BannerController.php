<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\DB;

class BannerController extends Controller
{
    // =====================================================================
    //  PUBLIC — Mọi người đều xem được
    // =====================================================================

    /**
     * Lấy danh sách banner đang hoạt động (status = active).
     */
    public function getActiveBanners()
    {
        $banners = Banner::where('status', 'active')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'data' => $banners
        ], 200);
    }

    // =====================================================================
    //  ADMIN — Quản lý Banners (Chỉ Admin role_id = 1)
    // =====================================================================

    /**
     * Admin lấy toàn bộ danh sách banner (hỗ trợ phân trang, tìm kiếm và lọc status).
     */
    public function adminIndex(Request $request)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== 1) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $query = Banner::with('creator:id,full_name,email');

        // Tìm kiếm theo tiêu đề
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // Lọc theo status (active | inactive)
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $limit = (int) $request->query('limit', 15);
        $banners = $query->orderBy('id', 'desc')->paginate($limit);

        return response()->json([
            'data' => $banners
        ], 200);
    }

    /**
     * Admin lấy chi tiết 1 banner.
     */
    public function show($id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== 1) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $banner = Banner::with('creator:id,full_name,email')->find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }

        return response()->json([
            'data' => $banner
        ], 200);
    }

    /**
     * Admin tạo mới 1 banner.
     */
    public function store(Request $request)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== 1) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $fields = $request->validate([
            'title'  => 'required|string|max:150',
            'image'  => 'required|string|max:255',
            'link'   => 'nullable|string|max:255',
            'status' => 'sometimes|string|in:active,inactive',
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề banner.',
            'image.required' => 'Vui lòng nhập đường dẫn hình ảnh banner.',
        ]);

        $banner = Banner::create([
            'title'      => $fields['title'],
            'image'      => $fields['image'],
            'link'       => $fields['link'] ?? null,
            'status'     => $fields['status'] ?? 'active',
            'created_by' => $currentUser->id,
        ]);

        $banner->load('creator:id,full_name,email');

        return response()->json([
            'message' => 'Tạo banner thành công.',
            'data'    => $banner
        ], 201);
    }

    /**
     * Admin cập nhật 1 banner.
     */
    public function update(Request $request, $id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== 1) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }

        $fields = $request->validate([
            'title'  => 'sometimes|required|string|max:150',
            'image'  => 'sometimes|required|string|max:255',
            'link'   => 'nullable|string|max:255',
            'status' => 'sometimes|required|string|in:active,inactive',
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề banner.',
            'image.required' => 'Vui lòng nhập đường dẫn hình ảnh banner.',
        ]);

        $banner->update($fields);
        $banner->load('creator:id,full_name,email');

        return response()->json([
            'message' => 'Cập nhật banner thành công.',
            'data'    => $banner
        ], 200);
    }

    /**
     * Admin ẩn / hiện banner (thay đổi trạng thái).
     */
    public function toggleStatus(Request $request, $id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== 1) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }

        $request->validate([
            'status' => 'required|string|in:active,inactive',
        ]);

        $banner->update([
            'status' => $request->input('status')
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái banner thành công.',
            'data'    => $banner
        ], 200);
    }

    /**
     * Admin xóa 1 banner.
     */
    public function destroy($id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser || $currentUser->role_id !== 1) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }

        $banner->delete();

        return response()->json([
            'message' => 'Xóa banner thành công.'
        ], 200);
    }
}
