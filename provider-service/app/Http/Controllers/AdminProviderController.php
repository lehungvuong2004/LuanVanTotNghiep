<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HelperProfile;
use App\Models\HelperVerification;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Http;

class AdminProviderController extends Controller
{
    /**
     * Kiểm tra quyền Admin (role_id=1) hoặc Operator (role_id=2) dựa trên role hoặc permission.
     */
    private function requireAdminOrOperator(Request $request): ?array
    {
        $authUser = $request->authUser ?? null;
        if (!$authUser) {
            return null;
        }
        if ($authUser['role_id'] === Role::ADMIN) {
            return $authUser;
        }
        if (in_array('helper_profile.verify', $authUser['permissions'] ?? [])) {
            return $authUser;
        }
        return null;
    }

    // =====================================================================
    //  ADMIN / OPERATOR — Quản lý danh sách Helper
    // =====================================================================

    /**
     * Danh sách tất cả helper (Admin + Operator).
     * Filter: status (pending|active|suspended|rejected), city
     */
    public function listHelpers(Request $request)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return $this->forbiddenResponse();
        }

        $query = HelperProfile::with(['skills.service', 'workingAreas', 'verifications']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('city')) {
            $city = $request->query('city');
            $query->whereHas('workingAreas', fn($q) => $q->where('city', $city));
        }

        // Tìm kiếm theo tên hoặc email hoặc số điện thoại (từ identity-service)
        if ($request->filled('search')) {
            $search = $request->query('search');
            $authHeader = $request->header('Authorization');
            $userIds = [];

            try {
                $response = Http::withHeaders(['Authorization' => $authHeader])
                    ->timeout(3)
                    ->get(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/search-ids', ['query' => $search]);

                if ($response->successful()) {
                    $userIds = $response->json() ?? [];
                    $query->whereIn('user_id', $userIds);
                } else {
                    $query->whereIn('user_id', [-1]);
                }
            } catch (\Exception $e) {
                $query->whereIn('user_id', [-1]);
            }
        }

        $limit   = $request->integer('limit', 20);
        $helpers = $query->orderByDesc('id')->paginate($limit);

        // Lấy thông tin user tương ứng
        $userIds = $helpers->pluck('user_id')->unique()->toArray();
        $userMap = [];

        if (!empty($userIds)) {
            $authHeader = $request->header('Authorization');
            try {
                $usersResponse = Http::withHeaders(['Authorization' => $authHeader])
                    ->timeout(3)
                    ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => $userIds]);

                if ($usersResponse->successful()) {
                    $users = $usersResponse->json('data') ?? [];
                    foreach ($users as $u) {
                        $userMap[$u['id']] = $u;
                    }
                }
            } catch (\Exception $e) {
                // ignore
            }
        }

        foreach ($helpers->items() as $helper) {
            $helper->user = $userMap[$helper->user_id] ?? null;
        }

        return $this->successResponse($helpers);
    }

    /**
     * Chi tiết 1 helper (Admin + Operator).
     */
    public function showHelper(Request $request, $id)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return $this->forbiddenResponse();
        }

        $helper = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities', 'verifications'])
                               ->find($id);

        if (!$helper) {
            return $this->notFoundResponse('Không tìm thấy người giúp việc.');
        }

        // Lấy thông tin chi tiết user
        $authHeader = $request->header('Authorization');
        try {
            $userResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . '/api/internal/users/by-ids', ['ids' => [$helper->user_id]]);

            if ($userResponse->successful()) {
                $users = $userResponse->json('data') ?? [];
                if (!empty($users)) {
                    $helper->user = $users[0];
                }
            }
        } catch (\Exception $e) {
            // ignore
        }

        return $this->successResponse($helper);
    }

    /**
     * Duyệt / Từ chối hồ sơ helper (Admin + Operator).
     * Body: { "status": "approved" | "rejected", "note": "..." }
     *
     * Khi approved → cập nhật helper_profiles.status = 'active'
     * Khi rejected → cập nhật helper_profiles.status = 'rejected'
     */
    public function verifyHelper(Request $request, $id)
    {
        $reviewer = $this->requireAdminOrOperator($request);
        if (!$reviewer) {
            return $this->forbiddenResponse();
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return $this->notFoundResponse('Không tìm thấy người giúp việc.');
        }

        $fields = $request->validate([
            'status' => 'required|string|in:approved,rejected',
            'note'   => 'nullable|string|max:191',
        ]);

        // Tìm verification record đang pending
        $verification = HelperVerification::where('helper_id', $id)
                                           ->where('status', 'pending')
                                           ->orderByDesc('created_at')
                                           ->first();

        if (!$verification) {
            // Tạo mới nếu chưa có record pending (admin chủ động duyệt)
            $verification = new HelperVerification();
            $verification->helper_id = $id;
        }

        $verification->admin_id = $reviewer['id'];
        $verification->status   = $fields['status'];
        $verification->note     = $fields['note'] ?? null;
        $verification->save();

        // Cập nhật trạng thái helper profile tương ứng
        $newHelperStatus = $fields['status'] === 'approved' ? 'active' : 'rejected';
        $helper->update(['status' => $newHelperStatus]);

        $msg = $fields['status'] === 'approved'
            ? 'Đã phê duyệt hồ sơ người giúp việc thành công.'
            : 'Đã từ chối hồ sơ người giúp việc.';

        return $this->successResponse($verification, $msg);
    }

    /**
     * Khoá / Mở khoá helper (Admin + Operator).
     * Body: { "status": "active" | "suspended", "reason": "..." }
     */
    public function toggleHelperStatus(Request $request, $id)
    {
        $authUser = $request->authUser ?? null;
        if (!$authUser) {
            return $this->unauthorizedResponse();
        }

        $fields = $request->validate([
            'status' => 'required|string|in:active,suspended',
            'reason' => 'nullable|string|max:255',
        ]);

        $permissionToCheck = ($fields['status'] === 'suspended') ? 'helper_profile.lock' : 'helper_profile.unlock';

        if ($authUser['role_id'] !== Role::ADMIN && !in_array($permissionToCheck, $authUser['permissions'] ?? [])) {
            return $this->forbiddenResponse('Bạn không có quyền thực hiện hành động này.');
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return $this->notFoundResponse('Không tìm thấy người giúp việc.');
        }

        $helper->update(['status' => $fields['status']]);

        $msg = $fields['status'] === 'suspended'
            ? 'Đã khoá tài khoản người giúp việc.'
            : 'Đã mở khoá tài khoản người giúp việc.';

        return $this->successResponse($helper->fresh(), $msg);
    }

    // =====================================================================
    //  ADMIN ONLY — Thống kê (role_id = 1)
    // =====================================================================

    /**
     * Thống kê tổng quan helper (Admin only).
     */
    public function stats(Request $request)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return $this->forbiddenResponse();
        }

        $stats = [
            'total'     => HelperProfile::count(),
            'active'    => HelperProfile::where('status', 'active')->count(),
            'pending'   => HelperProfile::where('status', 'pending')->count(),
            'suspended' => HelperProfile::where('status', 'suspended')->count(),
            'rejected'  => HelperProfile::where('status', 'rejected')->count(),
            'pending_verifications' => HelperVerification::where('status', 'pending')->count(),
        ];

        return $this->successResponse($stats);
    }

    /**
     * Admin xóa vĩnh viễn 1 helper (chỉ Admin).
     */
    public function deleteHelper(Request $request, $id)
    {
        $authUser = $request->authUser ?? null;
        if (!$authUser) {
            return $this->unauthorizedResponse();
        }
        if ($authUser['role_id'] !== Role::ADMIN && !in_array('helper_profile.delete', $authUser['permissions'] ?? [])) {
            return $this->forbiddenResponse('Bạn không có quyền thực hiện hành động này.');
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return $this->notFoundResponse('Không tìm thấy người giúp việc.');
        }

        // Gọi identity-service để xóa account user tương ứng
        $authHeader = $request->header('Authorization');
        try {
            $userResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(5)
                ->delete(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . "/api/admin/users/{$helper->user_id}");

            // Nếu xóa user thành công hoặc user không tồn tại thì ta tiếp tục xóa helper profile
            if ($userResponse->successful() || $userResponse->status() === 404) {
                $helper->delete();
                return $this->successResponse(null, 'Xóa người giúp việc và tài khoản liên kết thành công.');
            }

            return $this->errorResponse('Không thể xóa tài khoản liên kết ở Identity Service.', $userResponse->status());

        } catch (\Exception $e) {
            return $this->errorResponse('Lỗi kết nối liên dịch vụ khi xóa tài khoản người giúp việc: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Admin xóa hàng loạt helper (chỉ Admin).
     */
    public function bulkDeleteHelpers(Request $request)
    {
        $authUser = $request->authUser ?? null;
        if (!$authUser) {
            return $this->unauthorizedResponse();
        }
        if ($authUser['role_id'] !== Role::ADMIN && !in_array('helper_profile.delete', $authUser['permissions'] ?? [])) {
            return $this->forbiddenResponse('Bạn không có quyền thực hiện hành động này.');
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        $ids = $request->input('ids');
        $helpers = HelperProfile::whereIn('id', $ids)->get();

        if ($helpers->isEmpty()) {
            return $this->notFoundResponse('Không tìm thấy người giúp việc nào để xóa.');
        }

        $userIds = $helpers->pluck('user_id')->toArray();
        $authHeader = $request->header('Authorization');

        try {
            // Gọi identity-service để bulk delete account
            $userResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(5)
                ->post(env('IDENTITY_SERVICE_URL', 'http://identity-service:8000') . "/api/admin/users/bulk-delete", ['ids' => $userIds]);

            if ($userResponse->successful()) {
                // Xóa các helper profile tương ứng
                HelperProfile::whereIn('id', $ids)->delete();
                return $this->successResponse(null, 'Xóa hàng loạt người giúp việc và tài khoản liên kết thành công.');
            }

            return $this->errorResponse('Không thể xóa hàng loạt tài khoản liên kết ở Identity Service.', $userResponse->status());

        } catch (\Exception $e) {
            return $this->errorResponse('Lỗi kết nối liên dịch vụ khi xóa hàng loạt người giúp việc: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
