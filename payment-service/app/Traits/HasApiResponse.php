<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait HasApiResponse
{
    protected function successResponse($data = null, ?string $message = null, int $code = Response::HTTP_OK): JsonResponse
    {
        $payload = [];
        if ($message !== null) {
            $payload['message'] = $message;
        }
        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $code);
    }

    protected function errorResponse(string $message, int $code = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        return response()->json(['message' => $message], $code);
    }

    protected function forbiddenResponse(string $message = 'Bạn không có quyền thực hiện hành động này.'): JsonResponse
    {
        return response()->json(['message' => $message], Response::HTTP_FORBIDDEN);
    }

    protected function unauthorizedResponse(string $message = 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.'): JsonResponse
    {
        return response()->json(['message' => $message], Response::HTTP_UNAUTHORIZED);
    }

    protected function notFoundResponse(string $message = 'Không tìm thấy dữ liệu.'): JsonResponse
    {
        return response()->json(['message' => $message], Response::HTTP_NOT_FOUND);
    }
}
