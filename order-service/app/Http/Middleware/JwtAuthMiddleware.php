<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * JwtAuthMiddleware — Verifies JWT tokens issued by identity-service.
 *
 * Decodes HS256 JWT using the shared JWT_SECRET without calling identity-service,
 * reducing latency in the microservice architecture.
 *
 * On success, injects into the request:
 *   $request->authUser = ['id' => ..., 'role_id' => ..., 'email' => ...]
 */
class JwtAuthMiddleware
{
  public function handle(Request $request, Closure $next)
  {
    $authHeader = $request->header('Authorization');

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
      return response()->json(['message' => 'Vui lòng đăng nhập lại'], 401);
    }

    $token   = substr($authHeader, 7);
    $payload = $this->decodeJwt($token);

    if (!$payload) {
      return response()->json(['message' => 'Invalid or expired token.'], 401);
    }

    $request->authUser = [
      'id'          => $payload['sub']         ?? null,
      'role_id'     => $payload['role_id']     ?? null,
      'email'       => $payload['email']       ?? null,
      'permissions' => $payload['permissions'] ?? [],
    ];

    return $next($request);
  }

  private function decodeJwt(string $token): ?array
  {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$headerB64, $payloadB64, $signatureB64] = $parts;

    $secret       = env('JWT_SECRET', '');
    $signingInput = $headerB64 . '.' . $payloadB64;
    $expectedSig  = $this->base64UrlEncode(hash_hmac('sha256', $signingInput, $secret, true));

    if (!hash_equals($expectedSig, $signatureB64)) return null;

    $payload = json_decode($this->base64UrlDecode($payloadB64), true);
    if (!$payload) return null;

    if (isset($payload['exp']) && $payload['exp'] < time()) return null;

    return $payload;
  }

  private function base64UrlDecode(string $data): string
  {
    $remainder = strlen($data) % 4;
    if ($remainder) $data .= str_repeat('=', 4 - $remainder);
    return base64_decode(strtr($data, '-_', '+/'));
  }

  private function base64UrlEncode(string $data): string
  {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }
}
