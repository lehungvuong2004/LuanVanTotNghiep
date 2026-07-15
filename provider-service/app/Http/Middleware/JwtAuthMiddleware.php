<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * JwtAuthMiddleware — Xác thực JWT token được phát hành bởi identity-service.
 *
 * Middleware này decode JWT bằng shared JWT_SECRET (HS256) mà không cần
 * gọi sang identity-service, giúp giảm latency trong kiến trúc microservice.
 *
 * Sau khi xác thực thành công, thông tin user được gắn vào request:
 *   $request->authUser  = ['id' => ..., 'role_id' => ..., 'email' => ...]
 */
class JwtAuthMiddleware
{
  public function handle(Request $request, Closure $next)
  {
    $authHeader = $request->header('Authorization');

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
      return response()->json(['message' => 'Token không được cung cấp.'], 401);
    }

    $token = substr($authHeader, 7);

    $payload = $this->decodeJwt($token);

    if (!$payload) {
      return response()->json(['message' => 'Token không hợp lệ hoặc đã hết hạn.'], 401);
    }

    // Gắn thông tin user vào request để các controller sử dụng
    $request->authUser = [
      'id'          => $payload['sub']         ?? null,
      'role_id'     => $payload['role_id']     ?? null,
      'email'       => $payload['email']       ?? null,
      'permissions' => $payload['permissions'] ?? [],
    ];

    return $next($request);
  }

  /**
   * Decode và verify JWT HS256 token.
   * Trả về payload array nếu hợp lệ, null nếu không hợp lệ / hết hạn.
   */
  private function decodeJwt(string $token): ?array
  {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
      return null;
    }

    [$headerB64, $payloadB64, $signatureB64] = $parts;

    // 1. Verify chữ ký HMAC-SHA256
    $secret           = env('JWT_SECRET', '');
    $signingInput     = $headerB64 . '.' . $payloadB64;
    $expectedSig      = $this->base64UrlEncode(hash_hmac('sha256', $signingInput, $secret, true));

    if (!hash_equals($expectedSig, $signatureB64)) {
      return null;
    }

    // 2. Decode payload
    $payload = json_decode($this->base64UrlDecode($payloadB64), true);
    if (!$payload) {
      return null;
    }

    // 3. Kiểm tra thời hạn token (exp claim)
    if (isset($payload['exp']) && $payload['exp'] < time()) {
      return null;
    }

    return $payload;
  }

  private function base64UrlDecode(string $data): string
  {
    $remainder = strlen($data) % 4;
    if ($remainder) {
      $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
  }

  private function base64UrlEncode(string $data): string
  {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }
}
