<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait HasApiResponse
{
    protected function successResponse($data = null, string $message = 'Thành công.', int $code = Response::HTTP_OK): JsonResponse
    {
        $res = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $res['data'] = $data;
        }
        return response()->json($res, $code);
    }

    protected function errorResponse(string $message, int $code = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message], $code);
    }

    protected function notFoundResponse(string $message = 'Không tìm thấy dữ liệu.'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_NOT_FOUND);
    }

    protected function forbiddenResponse(string $message = 'Bạn không có quyền thực hiện hành động này.'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_FORBIDDEN);
    }

    protected function unauthorizedResponse(string $message = 'Chưa xác thực danh tính.'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_UNAUTHORIZED);
    }
}
