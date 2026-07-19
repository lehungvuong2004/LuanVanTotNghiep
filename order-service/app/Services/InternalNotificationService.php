<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InternalNotificationService
{
    /**
     * Send notification to a single user via identity-service.
     */
    public static function sendToUser(int $userId, string $title, string $message, string $type = 'system'): void
    {
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'user_id' => $userId,
                'title'   => $title,
                'message' => $message,
                'type'    => $type,
            ]);
        } catch (\Exception $e) {
            Log::error("Error sending internal notification to user {$userId}: " . $e->getMessage());
        }
    }

    /**
     * Send notification to all users of a specific role via identity-service.
     */
    public static function sendToRole(string $role, string $title, string $message, string $type = 'system'): void
    {
        try {
            Http::post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/notifications', [
                'role'    => $role,
                'title'   => $title,
                'message' => $message,
                'type'    => $type,
            ]);
        } catch (\Exception $e) {
            Log::error("Error sending internal notification to role {$role}: " . $e->getMessage());
        }
    }

    /**
     * Publish real-time event directly to socket service.
     */
    public static function publishSocket(array $payload): void
    {
        try {
            Http::post(env('SOCKET_SERVICE_URL', 'http://socket-service:3000') . '/publish', $payload);
        } catch (\Exception $e) {
            Log::error("Error publishing to socket service: " . $e->getMessage());
        }
    }
}
