<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use Symfony\Component\HttpFoundation\Response;

class PermissionController extends Controller
{
  /**
   * Display a listing of the permissions (bảo vệ bởi AdminMiddleware).
   */
  public function index(Request $request)
  {
    $permissions = Permission::all();
    return response()->json($permissions, Response::HTTP_OK);
  }

  /**
   * Store a newly created permission.
   */
  public function store(Request $request)
  {
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
    $permission = Permission::find($id);
    if (!$permission) {
      return $this->notFoundResponse('Không tìm thấy quyền');
    }

    return response()->json($permission, Response::HTTP_OK);
  }

  /**
   * Update the specified permission.
   */
  public function update(Request $request, $id)
  {
    $permission = Permission::find($id);
    if (!$permission) {
      return $this->notFoundResponse('Không tìm thấy quyền');
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
    $permission = Permission::find($id);
    if (!$permission) {
      return $this->notFoundResponse('Không tìm thấy quyền');
    }

    $permission->delete();

    return response()->json(['message' => 'Xóa quyền thành công'], Response::HTTP_OK);
  }
}
