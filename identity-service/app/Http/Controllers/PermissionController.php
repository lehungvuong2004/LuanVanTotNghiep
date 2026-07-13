<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use App\Constants\Role as RoleConst;
use Symfony\Component\HttpFoundation\Response;

class PermissionController extends Controller
{
  /**
   * Display a listing of the permissions.
   */
  public function index(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $permissions = Permission::all();
    return response()->json($permissions, Response::HTTP_OK);
  }

  /**
   * Store a newly created permission.
   */
  public function store(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $fields = $request->validate([
      'name'        => 'required|string|max:100|unique:permissions,name',
      'module'      => 'required|string|max:50',
      'description' => 'nullable|string|max:191',
    ]);

    $permission = Permission::create($fields);

    return response()->json($permission, Response::HTTP_CREATED);
  }

  /**
   * Display the specified permission.
   */
  public function show(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $permission = Permission::find($id);
    if (!$permission) {
      return response()->json(['message' => 'Không tìm thấy quyền'], Response::HTTP_NOT_FOUND);
    }

    return response()->json($permission, Response::HTTP_OK);
  }

  /**
   * Update the specified permission.
   */
  public function update(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $permission = Permission::find($id);
    if (!$permission) {
      return response()->json(['message' => 'Không tìm thấy quyền'], Response::HTTP_NOT_FOUND);
    }

    $fields = $request->validate([
      'name'        => 'required|string|max:100|unique:permissions,name,' . $id,
      'module'      => 'required|string|max:50',
      'description' => 'nullable|string|max:191',
    ]);

    $permission->update($fields);

    return response()->json($permission, Response::HTTP_OK);
  }

  /**
   * Remove the specified permission.
   */
  public function destroy(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $permission = Permission::find($id);
    if (!$permission) {
      return response()->json(['message' => 'Không tìm thấy quyền'], Response::HTTP_NOT_FOUND);
    }

    $permission->delete();

    return response()->json(['message' => 'Xóa quyền thành công'], Response::HTTP_OK);
  }
}
