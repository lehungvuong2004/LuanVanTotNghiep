<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Constants\Role;

class CheckPermission
{

  public function handle(Request $request, Closure $next, string $permission): Response
  {
    $user = $request->user();

    if (!$user) {
      return response()->json([
        'message' => 'Unauthorized.'
      ], Response::HTTP_UNAUTHORIZED);
    }

    // Admin role has access to everything
    if ($user->role_id === Role::ADMIN || strtolower($user->role->name ?? '') === 'admin') {
      return $next($request);
    }

    // Check permission list dynamically from DB
    $userPermissions = $user->role ? $user->role->permissions()->pluck('name')->toArray() : ($user->permissions ?? []);
    if (!in_array($permission, $userPermissions)) {
      return response()->json([
        'message' => 'Forbidden'
      ], Response::HTTP_FORBIDDEN);
    }

    return $next($request);
  }
}
