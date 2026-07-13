<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role as RoleModel;
use App\Constants\Role as RoleConst;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller
{
  /**
   * Display a listing of the roles.
   */
  public function index(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $roles = RoleModel::with('permissions')->get();
    return response()->json($roles, Response::HTTP_OK);
  }

  /**
   * Store a newly created role.
   */
  public function store(Request $request)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $fields = $request->validate([
      'name'        => 'required|string|max:50|unique:roles,name',
      'description' => 'nullable|string|max:191',
      'permissions' => 'nullable|array',
      'permissions.*' => 'integer|exists:permissions,id',
    ]);

    $role = RoleModel::create([
      'name'        => $fields['name'],
      'description' => $fields['description'] ?? null,
    ]);

    if ($request->has('permissions')) {
      $role->permissions()->sync($request->input('permissions'));
    }

    return response()->json($role->load('permissions'), Response::HTTP_CREATED);
  }

  /**
   * Display the specified role.
   */
  public function show(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $role = RoleModel::with('permissions')->find($id);
    if (!$role) {
      return response()->json(['message' => 'Không tìm thấy vai trò'], Response::HTTP_NOT_FOUND);
    }

    return response()->json($role, Response::HTTP_OK);
  }

  /**
   * Update the specified role.
   */
  public function update(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    $role = RoleModel::find($id);
    if (!$role) {
      return response()->json(['message' => 'Không tìm thấy vai trò'], Response::HTTP_NOT_FOUND);
    }

    // Prevent modifying core system roles names
    if (in_array((int)$id, [RoleConst::ADMIN, RoleConst::OPERATOR, RoleConst::HELPER, RoleConst::CUSTOMER])) {
      $fields = $request->validate([
        'description' => 'nullable|string|max:191',
        'permissions' => 'nullable|array',
        'permissions.*' => 'integer|exists:permissions,id',
      ]);
    } else {
      $fields = $request->validate([
        'name'        => 'required|string|max:50|unique:roles,name,' . $id,
        'description' => 'nullable|string|max:191',
        'permissions' => 'nullable|array',
        'permissions.*' => 'integer|exists:permissions,id',
      ]);
    }

    $role->update([
      'name'        => $fields['name'] ?? $role->name,
      'description' => $fields['description'] ?? $role->description,
    ]);

    if ($request->has('permissions')) {
      $role->permissions()->sync($request->input('permissions'));
    }

    return response()->json($role->load('permissions'), Response::HTTP_OK);
  }

  /**
   * Remove the specified role.
   */
  public function destroy(Request $request, $id)
  {
    $currentUser = $request->user();
    if (!$currentUser || $currentUser->role_id !== RoleConst::ADMIN) {
      return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này'], Response::HTTP_FORBIDDEN);
    }

    // Core system roles cannot be deleted
    if (in_array((int)$id, [RoleConst::ADMIN, RoleConst::OPERATOR, RoleConst::HELPER, RoleConst::CUSTOMER])) {
      return response()->json(['message' => 'Không thể xóa vai trò mặc định của hệ thống'], Response::HTTP_BAD_REQUEST);
    }

    $role = RoleModel::find($id);
    if (!$role) {
      return response()->json(['message' => 'Không tìm thấy vai trò'], Response::HTTP_NOT_FOUND);
    }

    // Check if any users belong to this role
    if ($role->users()->exists()) {
      return response()->json(['message' => 'Không thể xóa vai trò này vì đang có người dùng thuộc vai trò này'], Response::HTTP_BAD_REQUEST);
    }

    $role->delete();

    return response()->json(['message' => 'Xóa vai trò thành công'], Response::HTTP_OK);
  }
}
