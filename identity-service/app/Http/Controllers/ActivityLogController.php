<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Constants\Role as RoleConst;
use Symfony\Component\HttpFoundation\Response;

class ActivityLogController extends Controller
{
  /**
   * Display a listing of the activity logs.
   */
  public function index(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $query = ActivityLog::with('user:id,full_name,email,role_id');

    // Filter by user search or description/action
    if ($request->has('search') && !empty($request->search)) {
      $search = $request->search;
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
    if ($request->has('user_id') && !empty($request->user_id)) {
      $query->where('user_id', $request->user_id);
    }

    $limit = $request->input('limit', 15);
    $logs = $query->orderBy('id', 'desc')->paginate($limit);

    return response()->json($logs, Response::HTTP_OK);
  }

  /**
   * Store a new activity log (typically internal or created on actions).
   */
  public function store(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser) {
      return response()->json(['message' => 'Chưa xác thực'], Response::HTTP_UNAUTHORIZED);
    }

    $fields = $request->validate([
      'action'      => 'required|string|max:100',
      'description' => 'required|string|max:1000',
    ]);

    $log = ActivityLog::create([
      'user_id'     => $currentUser->id,
      'action'      => $fields['action'],
      'description' => $fields['description']
    ]);

    return response()->json($log, Response::HTTP_CREATED);
  }

  /**
   * Remove the specified activity log.
   */
  public function destroy(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $log = ActivityLog::find($id);
    if (!$log) {
      return response()->json(['message' => 'Không tìm thấy nhật ký hoạt động'], Response::HTTP_NOT_FOUND);
    }

    $log->delete();

    return response()->json(['message' => 'Xóa nhật ký thành công'], Response::HTTP_OK);
  }

  /**
   * Clear all activity logs.
   */
  public function clear(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    ActivityLog::truncate();

    return response()->json(['message' => 'Xóa toàn bộ nhật ký thành công'], Response::HTTP_OK);
  }
}
