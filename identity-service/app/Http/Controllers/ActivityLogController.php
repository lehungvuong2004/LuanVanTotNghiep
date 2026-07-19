<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Symfony\Component\HttpFoundation\Response;

class ActivityLogController extends Controller
{
  /**
   * Display a listing of the activity logs (bảo vệ bởi AdminMiddleware).
   */
  public function index(Request $request)
  {
    $query = ActivityLog::with('user:id,full_name,email,role_id');

    // Filter by user search or description/action
    if ($request->filled('search')) {
      $search = $request->query('search');
      $query->where(function ($q) use ($search) {
        $q->where('action', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%")
          ->orWhereHas('user', function ($uq) use ($search) {
            $uq->where('full_name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
          });
      });
    }

    // Filter by user_id
    if ($request->filled('user_id')) {
      $query->where('user_id', $request->query('user_id'));
    }

    $limit = $request->integer('limit', 15);
    $logs = $query->orderBy('id', 'desc')->paginate($limit);

    return response()->json($logs, Response::HTTP_OK);
  }

  /**
   * Store a new activity log (typically internal or created on actions).
   */
  public function store(Request $request)
  {
    $currentUser = $this->getAuthUser();
    if (!$currentUser) {
      return $this->unauthorizedResponse('Chưa xác thực');
    }

    $fields = $request->validate([
      'action'      => 'required|string|max:100',
      'description' => 'required|string|max:1000',
    ]);

    $log = ActivityLogService::log(
      $currentUser->id,
      $fields['action'],
      $fields['description']
    );

    return response()->json($log, Response::HTTP_CREATED);
  }

  /**
   * Remove the specified activity log.
   */
  public function destroy(Request $request, $id)
  {
    $log = ActivityLog::find($id);
    if (!$log) {
      return $this->notFoundResponse('Không tìm thấy nhật ký hoạt động');
    }

    $log->delete();

    return response()->json(['message' => 'Xóa nhật ký thành công'], Response::HTTP_OK);
  }

  /**
   * Clear all activity logs.
   */
  public function clear(Request $request)
  {
    ActivityLog::truncate();

    return response()->json(['message' => 'Xóa toàn bộ nhật ký thành công'], Response::HTTP_OK);
  }
}
