<?php

namespace App\Traits;

use App\Constants\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

trait HasRoleAuthorization
{
    use HasApiResponse;

    protected function getAuthUser(): ?User
    {
        return auth('api')->user() ?? request()->user();
    }

    protected function authorizeRoles(array $allowedRoles, ?string $forbiddenMessage = null): ?JsonResponse
    {
        $currentUser = $this->getAuthUser();

        if (!$currentUser) {
            return $this->unauthorizedResponse();
        }

        if (!in_array($currentUser->role_id, $allowedRoles)) {
            $msg = $forbiddenMessage ?? 'Bạn không có quyền thực hiện hành động này.';
            return $this->forbiddenResponse($msg);
        }

        return null;
    }

    protected function authorizeAdmin(?string $forbiddenMessage = null): ?JsonResponse
    {
        return $this->authorizeRoles([Role::ADMIN], $forbiddenMessage);
    }

    protected function authorizeCustomer(?string $forbiddenMessage = 'Chức năng này dành cho tài khoản Khách hàng.'): ?JsonResponse
    {
        return $this->authorizeRoles([Role::CUSTOMER], $forbiddenMessage);
    }
}
