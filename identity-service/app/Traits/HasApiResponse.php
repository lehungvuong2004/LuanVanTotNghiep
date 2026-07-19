<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait HasApiResponse
{
    /**
     * Standard success JSON response.
     */
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

    /**
     * Standard error JSON response.
     */
    protected function errorResponse(string $message, int $code = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        return response()->json(['message' => $message], $code);
    }

    /**
     * Forbidden response helper.
     */
    protected function forbiddenResponse(string $message = 'Bạn không có quyền thực hiện hành động này.'): JsonResponse
    {
        return response()->json(['message' => $message], Response::HTTP_FORBIDDEN);
    }

    /**
     * Unauthorized response helper.
     */
    protected function unauthorizedResponse(string $message = 'Unauthenticated.'): JsonResponse
    {
        return response()->json(['message' => $message], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Not found response helper.
     */
    protected function notFoundResponse(string $message = 'Không tìm thấy dữ liệu.'): JsonResponse
    {
        return response()->json(['message' => $message], Response::HTTP_NOT_FOUND);
    }
}
