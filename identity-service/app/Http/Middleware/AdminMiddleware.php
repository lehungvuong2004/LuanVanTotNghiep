<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Constants\Role;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user() ?? $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->role_id !== Role::ADMIN && $user->role_id !== Role::OPERATOR) {
            return response()->json([
                'message' => 'Bạn không có quyền thực hiện hành động này.'
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
