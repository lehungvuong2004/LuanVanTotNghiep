<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    // =====================================================================
    //  CUSTOMER & HELPER — Thông báo của chính mình
    // =====================================================================

  /**
   * Danh sách thông báo của user đang đăng nhập (phân trang).
   * Query param: ?is_read=0|1&limit=20
   */
  public function index(Request $request)
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    $query = Notification::where('user_id', $user->id)
      ->orderByDesc('created_at');

    if ($request->filled('is_read')) {
      $query->where('is_read', (int) $request->query('is_read'));
    }

    $limit         = (int) $request->query('limit', 20);
    $notifications = $query->paginate($limit);
    $unreadCount   = Notification::where('user_id', $user->id)->where('is_read', 0)->count();

    return response()->json([
      'unread_count' => $unreadCount,
      'data'         => $notifications,
    ], 200);
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc.
   */
  public function markRead($id)
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    $notification = Notification::where('id', $id)
      ->where('user_id', $user->id)
      ->first();

    if (!$notification) {
      return response()->json(['message' => 'Không tìm thấy thông báo.'], 404);
    }

    $notification->update(['is_read' => 1]);

    return response()->json(['message' => 'Đã đánh dấu đọc.'], 200);
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc.
   */
  public function markAllRead()
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    Notification::where('user_id', $user->id)
      ->where('is_read', 0)
      ->update(['is_read' => 1]);
    return response()->json(['message' => 'Đã đánh dấu tất cả thông báo là đã đọc.'], 200);
  }

  /**
   * Xóa 1 thông báo (chỉ xoá của chính mình).
   */
  public function destroy($id)
  {
    $user = auth('api')->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    $notification = Notification::where('id', $id)
      ->where('user_id', $user->id)
      ->first();

    if (!$notification) {
      return response()->json(['message' => 'Không tìm thấy thông báo.'], 404);
    }

    $notification->delete();

    return response()->json(['message' => 'Xóa thông báo thành công.'], 200);
  }

    // =====================================================================
    //  ADMIN — Gửi thông báo đến user(s)
    // =====================================================================

  /**
   * Admin xem toàn bộ thông báo trong hệ thống (filter theo user_id, is_read).
   * CHỈ ADMIN (role_id = 1).
   */
  public function adminIndex(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    $query = Notification::orderByDesc('created_at');

    if ($request->filled('user_id')) {
      $query->where('user_id', $request->query('user_id'));
    }

    if ($request->filled('is_read')) {
      $query->where('is_read', (int) $request->query('is_read'));
    }

    if ($request->filled('type')) {
      $query->where('type', $request->query('type'));
    }

    $limit         = (int) $request->query('limit', 20);
    $notifications = $query->paginate($limit);

    return response()->json(['data' => $notifications], 200);
  }

  /**
   * Admin gửi thông báo đến một hoặc nhiều user cụ thể.
   * Body: { "user_ids": [1,2,3], "title": "...", "message": "...", "type": "system" }
   * CHỈ ADMIN (role_id = 1).
   */
  public function send(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    $fields = $request->validate([
      'user_ids'   => 'required|array|min:1',
      'user_ids.*' => 'integer|exists:users,id',
      'title'      => 'required|string|max:150',
      'message'    => 'required|string|max:1000',
      'type'       => 'sometimes|string|in:system,booking,payment,promotion,report',
    ]);

    $now           = now();
    $notifications = [];

    foreach ($fields['user_ids'] as $userId) {
      $notifications[] = [
        'user_id'    => $userId,
        'title'      => $fields['title'],
        'message'    => $fields['message'],
        'type'       => $fields['type'] ?? 'system',
        'is_read'    => 0,
        'created_at' => $now,
      ];
    }

    DB::table('notifications')->insert($notifications);

    return response()->json([
      'message' => 'Gửi thông báo thành công đến ' . count($fields['user_ids']) . ' người dùng.',
    ], 201);
  }

  /**
   * Admin broadcast thông báo đến tất cả user thuộc 1 role.
   * Body: { "role": "customer" | "helper" | "operator", "title": "...", "message": "...", "type": "..." }
   * CHỈ ADMIN (role_id = 1).
   */
  public function broadcast(Request $request)
  {
    $currentUser = auth('api')->user();
    if (!$currentUser || $currentUser->role_id !== 1) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }

    $fields = $request->validate([
      'role'    => 'required|string|in:customer,helper,operator,admin',
      'title'   => 'required|string|max:150',
      'message' => 'required|string|max:1000',
      'type'    => 'sometimes|string|in:system,booking,payment,promotion,report',
    ]);

    // Map role name → role_id
    $roleMap = ['admin' => 1, 'customer' => 4, 'helper' => 3, 'operator' => 2];
    $roleId  = $roleMap[$fields['role']];

    $userIds = User::where('role_id', $roleId)
      ->where('status', 'active')
      ->pluck('id');

    if ($userIds->isEmpty()) {
      return response()->json(['message' => 'Không có user nào thuộc role này.'], 404);
    }

    $now           = now();
    $notifications = [];

    foreach ($userIds as $userId) {
      $notifications[] = [
        'user_id'    => $userId,
        'title'      => $fields['title'],
        'message'    => $fields['message'],
        'type'       => $fields['type'] ?? 'system',
        'is_read'    => 0,
        'created_at' => $now,
      ];
    }

    DB::table('notifications')->insert($notifications);

    return response()->json([
      'message' => "Broadcast thành công đến {$userIds->count()} người dùng role [{$fields['role']}].",
    ], 201);
  }
}
