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
    $authUser = $request->authUser ?? null;

    if (!$authUser) {
      return response()->json([
        'message' => 'Unauthorized.'
      ], Response::HTTP_UNAUTHORIZED);
    }

    // Admin role has access to everything
    if ($authUser['role_id'] === Role::ADMIN) {
      return $next($request);
    }

    // Check permission list from decoded JWT payload
    $permissions = $authUser['permissions'] ?? [];
    if (!in_array($permission, $permissions)) {
      return response()->json([
        'message' => 'Forbidden'
      ], Response::HTTP_FORBIDDEN);
    }

    return $next($request);
  }
}
