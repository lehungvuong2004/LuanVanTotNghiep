<?php

namespace App\Traits;

use App\Constants\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

trait HasRoleAuthorization
{
    use HasApiResponse;

    protected function getAuthUser(Request $request): ?array
    {
        return $request->authUser ?? null;
    }

    protected function authorizeRoles(Request $request, array $allowedRoles, ?string $forbiddenMessage = null): ?JsonResponse
    {
        $user = $this->getAuthUser($request);

        if (!$user) {
            return $this->unauthorizedResponse();
        }

        if (!in_array($user['role_id'] ?? null, $allowedRoles)) {
            $msg = $forbiddenMessage ?? 'Bạn không có quyền thực hiện hành động này.';
            return $this->forbiddenResponse($msg);
        }

        return null;
    }

    protected function authorizeAdminOrOperator(Request $request, ?string $message = 'Bạn không có quyền thực hiện hành động này.'): ?JsonResponse
    {
        return $this->authorizeRoles($request, [Role::ADMIN, Role::OPERATOR], $message);
    }

    protected function authorizeCustomer(Request $request, ?string $message = 'Chức năng này dành cho tài khoản Khách hàng.'): ?JsonResponse
    {
        return $this->authorizeRoles($request, [Role::CUSTOMER], $message);
    }

    protected function authorizeHelper(Request $request, ?string $message = 'Chức năng này dành cho Người giúp việc.'): ?JsonResponse
    {
        return $this->authorizeRoles($request, [Role::HELPER], $message);
    }

    protected function authorizeCustomerOrAdmin(Request $request, ?string $message = 'Bạn không có quyền thực hiện hành động này.'): ?JsonResponse
    {
        return $this->authorizeRoles($request, [Role::CUSTOMER, Role::ADMIN, Role::OPERATOR], $message);
    }
}
