<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
    $user = $this->getAuthUser();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    $query = Notification::where('user_id', $user->id)
      ->orderByDesc('created_at');

    if ($request->filled('is_read')) {
      $query->where('is_read', (int) $request->query('is_read'));
    }

    $limit         = $request->integer('limit', 20);
    $notifications = $query->paginate($limit);
    $unreadCount   = Notification::where('user_id', $user->id)->where('is_read', 0)->count();

    return response()->json([
      'unread_count' => $unreadCount,
      'data'         => $notifications,
    ], Response::HTTP_OK);
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc.
   */
  public function markRead($id)
  {
    $user = $this->getAuthUser();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    $notification = Notification::where('id', $id)
      ->where('user_id', $user->id)
      ->first();

    if (!$notification) {
      return $this->notFoundResponse('Không tìm thấy thông báo.');
    }

    $notification->update(['is_read' => 1]);

    return response()->json(['message' => 'Đã đánh dấu đọc.'], Response::HTTP_OK);
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc.
   */
  public function markAllRead()
  {
    $user = $this->getAuthUser();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    Notification::where('user_id', $user->id)
      ->where('is_read', 0)
      ->update(['is_read' => 1]);
    return response()->json(['message' => 'Đã đánh dấu tất cả thông báo là đã đọc.'], Response::HTTP_OK);
  }

  /**
   * Xóa 1 thông báo (chỉ xoá của chính mình).
   */
  public function destroy($id)
  {
    $user = $this->getAuthUser();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    $notification = Notification::where('id', $id)
      ->where('user_id', $user->id)
      ->first();

    if (!$notification) {
      return $this->notFoundResponse('Không tìm thấy thông báo.');
    }

    $notification->delete();

    return response()->json(['message' => 'Xóa thông báo thành công.'], Response::HTTP_OK);
  }

    // =====================================================================
    //  ADMIN — Gửi thông báo đến user(s) (bảo vệ bởi AdminMiddleware)
    // =====================================================================

  /**
   * Admin xem toàn bộ thông báo trong hệ thống (filter theo user_id, is_read).
   */
  public function adminIndex(Request $request)
  {
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

    $limit         = $request->integer('limit', 20);
    $notifications = $query->paginate($limit);

    return $this->successResponse($notifications);
  }

  /**
   * Admin gửi thông báo đến một hoặc nhiều user cụ thể.
   * Body: { "user_ids": [1,2,3], "title": "...", "message": "...", "type": "system" }
   */
  public function send(Request $request)
  {
    $fields = $request->validate([
      'user_ids'   => 'required|array|min:1',
      'user_ids.*' => 'integer|exists:users,id',
      'title'      => 'required|string|max:150',
      'message'    => 'required|string|max:1000',
      'type'       => 'sometimes|string|in:system,booking,payment,promotion,report,recruitment',
    ]);

    $this->createAndPushBatchNotifications(
      $fields['user_ids'],
      $fields['title'],
      $fields['message'],
      $fields['type'] ?? 'system'
    );

    return response()->json([
      'message' => 'Gửi thông báo thành công đến ' . count($fields['user_ids']) . ' người dùng.',
    ], Response::HTTP_CREATED);
  }

  /**
   * Admin broadcast thông báo đến tất cả user thuộc 1 role.
   * Body: { "role": "customer" | "helper" | "operator", "title": "...", "message": "...", "type": "..." }
   */
  public function broadcast(Request $request)
  {
    $fields = $request->validate([
      'role'    => 'required|string|in:customer,helper,operator,admin,all',
      'title'   => 'required|string|max:150',
      'message' => 'required|string|max:1000',
      'type'    => 'sometimes|string|in:system,booking,payment,promotion,report',
    ]);

    if ($fields['role'] === 'all') {
      $userIds = User::where('status', 'active')->pluck('id');
    } else {
      $roleMap = ['admin' => Role::ADMIN, 'customer' => Role::CUSTOMER, 'helper' => Role::HELPER, 'operator' => Role::OPERATOR];
      $roleId  = $roleMap[$fields['role']];
      $userIds = User::where('role_id', $roleId)
        ->where('status', 'active')
        ->pluck('id');
    }

    if ($userIds->isEmpty()) {
      return $this->notFoundResponse('Không có user nào thuộc đối tượng này.');
    }

    $this->createAndPushBatchNotifications(
      $userIds,
      $fields['title'],
      $fields['message'],
      $fields['type'] ?? 'system'
    );

    return response()->json([
      'message' => "Broadcast thành công đến {$userIds->count()} người dùng.",
    ], Response::HTTP_CREATED);
  }

  /**
   * Endpoint nội bộ dành cho các microservice khác tạo thông báo.
   * POST /api/internal/notifications
   */
  public function createInternal(Request $request)
  {
    $fields = $request->validate([
      'user_id' => 'sometimes|required|integer',
      'role'    => 'sometimes|required|string|in:customer,helper,operator,admin',
      'title'   => 'required|string|max:150',
      'message' => 'required|string|max:1000',
      'type'    => 'sometimes|string|in:system,booking,payment,promotion,report,recruitment',
    ]);

    if (isset($fields['role'])) {
      $roleMap = ['admin' => Role::ADMIN, 'customer' => Role::CUSTOMER, 'helper' => Role::HELPER, 'operator' => Role::OPERATOR];
      $roleId  = $roleMap[$fields['role']];

      $userIds = User::where('role_id', $roleId)
        ->where('status', 'active')
        ->pluck('id');

      $insertedNotifications = [];
      if (!$userIds->isEmpty()) {
        $insertedNotifications = $this->createAndPushBatchNotifications(
          $userIds,
          $fields['title'],
          $fields['message'],
          $fields['type'] ?? 'system'
        );
      }

      return response()->json([
        'message' => 'Tạo thông báo nội bộ cho nhóm role thành công.',
        'data'    => $insertedNotifications
      ], Response::HTTP_CREATED);
    }

    $notification = Notification::create([
      'user_id' => $fields['user_id'],
      'title'   => $fields['title'],
      'message' => $fields['message'],
      'type'    => $fields['type'] ?? 'system',
      'is_read' => 0,
      'created_at' => now()->toDateTimeString(),
    ]);

    $this->pushToSocket([
      'user_id'      => $notification->user_id,
      'notification' => $notification
    ]);

    return response()->json([
      'message' => 'Tạo thông báo nội bộ thành công.',
      'data'    => $notification
    ], Response::HTTP_CREATED);
  }

  /**
   * Helper method to batch insert notifications and push to socket service.
   */
  private function createAndPushBatchNotifications($userIds, string $title, string $message, string $type): array
  {
    $insertedNotifications = [];
    foreach ($userIds as $userId) {
      $insertedNotifications[] = Notification::create([
        'user_id'    => $userId,
        'title'      => $title,
        'message'    => $message,
        'type'       => $type,
        'is_read'    => 0,
        'created_at' => now()->toDateTimeString(),
      ]);
    }

    $socketPayload = [];
    foreach ($insertedNotifications as $notif) {
      $socketPayload[] = [
        'user_id'      => $notif->user_id,
        'notification' => $notif
      ];
    }

    $this->pushToSocket(['notifications' => $socketPayload]);

    return $insertedNotifications;
  }

  /**
   * Gửi thông báo real-time qua Socket.IO service.
   */
  private function pushToSocket($payload)
  {
    try {
      $url = env('SOCKET_SERVICE_URL', 'http://socket-service:3000') . '/publish';
      Http::timeout(2)->post($url, $payload);
    } catch (\Exception $e) {
      Log::error('Lỗi đẩy thông báo tới Socket.IO: ' . $e->getMessage());
    }
  }
}
