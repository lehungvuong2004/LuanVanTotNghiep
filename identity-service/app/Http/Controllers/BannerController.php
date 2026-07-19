<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Banner;
use Symfony\Component\HttpFoundation\Response;
use App\Services\ImageUploadService;

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

    return $this->successResponse($banners);
  }

    // =====================================================================
    //  ADMIN — Quản lý Banners (Chỉ Admin role_id = 1, bảo vệ bởi AdminMiddleware)
    // =====================================================================

  /**
   * Admin lấy toàn bộ danh sách banner (hỗ trợ phân trang, tìm kiếm và lọc status).
   */
  public function adminIndex(Request $request)
  {
    $query = Banner::with('creator:id,full_name,email');

    if ($request->filled('search')) {
      $search = $request->query('search');
      $query->where('title', 'like', "%{$search}%");
    }

    if ($request->filled('status')) {
      $query->where('status', $request->query('status'));
    }

    $limit = $request->integer('limit', 15);
    $banners = $query->orderBy('id', 'desc')->paginate($limit);

    return $this->successResponse($banners);
  }

  /**
   * Admin lấy chi tiết 1 banner.
   */
  public function show($id)
  {
    $banner = Banner::with('creator:id,full_name,email')->find($id);
    if (!$banner) {
      return $this->notFoundResponse('Không tìm thấy banner.');
    }

    return $this->successResponse($banner);
  }

  /**
   * Admin tạo mới 1 banner.
   */
  public function store(Request $request)
  {
    $currentUser = $this->getAuthUser();

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
    ], Response::HTTP_CREATED);
  }

  /**
   * Admin cập nhật 1 banner.
   */
  public function update(Request $request, $id)
  {
    $banner = Banner::find($id);
    if (!$banner) {
      return $this->notFoundResponse('Không tìm thấy banner.');
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
    ], Response::HTTP_OK);
  }

  /**
   * Admin ẩn / hiện banner (thay đổi trạng thái).
   */
  public function toggleStatus(Request $request, $id)
  {
    $banner = Banner::find($id);
    if (!$banner) {
      return $this->notFoundResponse('Không tìm thấy banner.');
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
    ], Response::HTTP_OK);
  }

  /**
   * Admin xóa 1 banner.
   */
  public function destroy($id)
  {
    $banner = Banner::find($id);
    if (!$banner) {
      return $this->notFoundResponse('Không tìm thấy banner.');
    }

    $banner->delete();

    return $this->successResponse(null, 'Xóa banner thành công.');
  }

  /**
   * Tải ảnh banner lên server (public/uploads/banners) và trả về URL ảnh.
   */
  public function uploadImage(Request $request, ImageUploadService $imageUploadService)
  {
    $request->validate([
      'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
    ], [
      'image.required' => 'Vui lòng chọn hình ảnh banner.',
      'image.image'    => 'File tải lên phải là hình ảnh.',
      'image.mimes'    => 'Chấp nhận các định dạng ảnh: jpeg, png, jpg, webp.',
      'image.max'      => 'Kích thước ảnh tối đa là 2MB.',
    ]);

    if ($request->hasFile('image')) {
      $result = $imageUploadService->upload($request->file('image'), 'banners');

      return response()->json([
        'message' => 'Tải ảnh banner lên thành công.',
        'path'    => $result['path'],
        'url'     => $result['url']
      ], Response::HTTP_OK);
    }

    return $this->errorResponse('Không tìm thấy file tải lên.');
  }
}
