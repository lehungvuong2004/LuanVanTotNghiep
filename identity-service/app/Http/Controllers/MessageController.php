<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Gửi tin nhắn 1-1.
     * POST /api/messages
     */
    public function send(Request $request)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $fields = $request->validate([
            'receiver_id'  => 'required|integer|exists:users,id',
            'message'      => 'required|string',
            'message_type' => 'sometimes|string|max:30',
            'attachment'   => 'sometimes|nullable|string|max:255',
        ]);

        $message = Message::create([
            'sender_id'        => $currentUser->id,
            'receiver_id'      => $fields['receiver_id'],
            'message'          => $fields['message'],
            'message_type'     => $fields['message_type'] ?? 'text',
            'attachment'       => $fields['attachment'] ?? null,
            'is_read'          => 0,
            'sender_deleted'   => 0,
            'receiver_deleted' => 0,
            'created_at'       => now()->toDateTimeString(),
        ]);

        return response()->json([
            'message' => 'Gửi tin nhắn thành công.',
            'data'    => $message
        ], Response::HTTP_CREATED);
    }

    /**
     * Lấy toàn bộ lịch sử chat giữa user hiện tại và userId.
     * GET /api/messages/{userId}
     */
    public function getHistory($userId)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $partner = User::find($userId);
        if (!$partner) {
            return response()->json(['message' => 'Người nhận không tồn tại.'], Response::HTTP_NOT_FOUND);
        }

        $messages = Message::where(function ($query) use ($currentUser, $userId) {
            $query->where('sender_id', $currentUser->id)
                  ->where('receiver_id', $userId)
                  ->where('sender_deleted', 0);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('sender_id', $userId)
                  ->where('receiver_id', $currentUser->id)
                  ->where('receiver_deleted', 0);
        })
        ->orderBy('created_at', 'asc')
        ->orderBy('id', 'asc')
        ->get();

        return response()->json(['data' => $messages], Response::HTTP_OK);
    }

    /**
     * Lấy danh sách các cuộc hội thoại của user hiện tại.
     * GET /api/messages/conversations
     */
    public function getConversations()
    {
        $currentUser = auth('api')->user();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $userId = $currentUser->id;

        // Tìm tất cả ID người chat cùng mà chưa xóa cuộc trò chuyện tương ứng
        $senderIds = Message::where('receiver_id', $userId)
            ->where('receiver_deleted', 0)
            ->pluck('sender_id')
            ->toArray();

        $receiverIds = Message::where('sender_id', $userId)
            ->where('sender_deleted', 0)
            ->pluck('receiver_id')
            ->toArray();

        $partnerIds = array_unique(array_merge($senderIds, $receiverIds));

        $conversations = [];
        foreach ($partnerIds as $partnerId) {
            $partner = User::with('role')->find($partnerId);
            if (!$partner) {
                continue;
            }

            // Lấy tin nhắn cuối cùng giữa hai người
            $lastMessage = Message::where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)
                  ->where('receiver_id', $partnerId)
                  ->where('sender_deleted', 0);
            })->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)
                  ->where('receiver_id', $userId)
                  ->where('receiver_deleted', 0);
            })
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

            if (!$lastMessage) {
                continue;
            }

            // Đếm số tin nhắn chưa đọc đối tác gửi cho mình
            $unreadCount = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $userId)
                ->where('is_read', 0)
                ->where('receiver_deleted', 0)
                ->count();

            $conversations[] = [
                'partner'      => [
                    'id'        => $partner->id,
                    'full_name' => $partner->full_name,
                    'email'     => $partner->email,
                    'avatar'    => $partner->avatar,
                    'role'      => $partner->role,
                ],
                'last_message' => $lastMessage,
                'unread_count' => $unreadCount,
            ];
        }

        // Sắp xếp các hội thoại theo thời gian tin nhắn mới nhất
        usort($conversations, function ($a, $b) {
            return strcmp($b['last_message']->created_at, $a['last_message']->created_at);
        });

        return response()->json(['data' => $conversations], Response::HTTP_OK);
    }

    /**
     * Đánh dấu toàn bộ tin nhắn từ userId là đã đọc.
     * PUT /api/messages/read/{userId}
     */
    public function markRead($userId)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        Message::where('sender_id', $userId)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        return response()->json(['message' => 'Đã đánh dấu đọc toàn bộ tin nhắn.'], Response::HTTP_OK);
    }

    /**
     * Xóa tin nhắn cá nhân (không xóa trong DB, chỉ ẩn ở một phía).
     * DELETE /api/messages/{id}
     */
    public function destroy($id)
    {
        $currentUser = auth('api')->user();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $message = Message::find($id);
        if (!$message) {
            return response()->json(['message' => 'Tin nhắn không tồn tại.'], Response::HTTP_NOT_FOUND);
        }

        if ($message->sender_id !== $currentUser->id && $message->receiver_id !== $currentUser->id) {
            return response()->json(['message' => 'Bạn không có quyền xóa tin nhắn này.'], Response::HTTP_FORBIDDEN);
        }

        if ($message->sender_id === $currentUser->id) {
            $message->sender_deleted = 1;
        }

        if ($message->receiver_id === $currentUser->id) {
            $message->receiver_deleted = 1;
        }

        $message->save();

        return response()->json(['message' => 'Đã xóa tin nhắn cá nhân.'], Response::HTTP_OK);
    }

    /**
     * Admin: Lấy danh sách toàn bộ tin nhắn trong hệ thống.
     * GET /api/admin/messages
     */
    public function adminIndex(Request $request)
    {
        $query = Message::with(['sender.role', 'receiver.role']);

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhereHas('sender', function ($sq) use ($search) {
                      $sq->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('receiver', function ($rq) use ($search) {
                      $rq->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $messages = $query->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($messages, Response::HTTP_OK);
    }

    /**
     * Admin: Xóa vĩnh viễn tin nhắn (kiểm duyệt).
     * DELETE /api/admin/messages/{id}
     */
    public function adminDestroy($id)
    {
        $message = Message::find($id);
        if (!$message) {
            return response()->json(['message' => 'Tin nhắn không tồn tại.'], Response::HTTP_NOT_FOUND);
        }

        $message->delete();

        return response()->json(['message' => 'Đã xóa tin nhắn khỏi hệ thống.'], Response::HTTP_OK);
    }
}
