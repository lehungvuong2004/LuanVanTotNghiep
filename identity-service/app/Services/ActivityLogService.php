<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;

class ActivityLogService
{
    /**
     * Log user activity into database safely.
     *
     * @param int|string $userId
     * @param string $action
     * @param string $description
     * @return ActivityLog|null
     */
    public static function log($userId, string $action, string $description): ?ActivityLog
    {
        try {
            return ActivityLog::create([
                'user_id'     => $userId,
                'action'      => $action,
                'description' => $description,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to write activity log: " . $e->getMessage());
            return null;
        }
    }
}
