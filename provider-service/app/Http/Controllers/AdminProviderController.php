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
     * Kiểm tra quyền Admin (role_id=1) hoặc Operator (role_id=2).
     */
    private function requireAdminOrOperator(Request $request): ?array
    {
        $roleId = $request->authUser['role_id'] ?? null;
        if (!in_array($roleId, [Role::ADMIN, Role::OPERATOR])) {
            return null;
        }
        return $request->authUser;
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
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
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
                    ->get('http://identity-service:8000/api/admin/users/search-ids', ['query' => $search]);

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

        $limit   = (int) $request->query('limit', 20);
        $helpers = $query->orderByDesc('id')->paginate($limit);

        // Lấy thông tin user tương ứng
        $userIds = $helpers->pluck('user_id')->unique()->toArray();
        $userMap = [];

        if (!empty($userIds)) {
            $authHeader = $request->header('Authorization');
            try {
                $usersResponse = Http::withHeaders(['Authorization' => $authHeader])
                    ->timeout(3)
                    ->post('http://identity-service:8000/api/admin/users/by-ids', ['ids' => $userIds]);

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

        return response()->json(['data' => $helpers], Response::HTTP_OK);
    }

    /**
     * Chi tiết 1 helper (Admin + Operator).
     */
    public function showHelper(Request $request, $id)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $helper = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities', 'verifications'])
                               ->find($id);

        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], Response::HTTP_NOT_FOUND);
        }

        // Lấy thông tin chi tiết user
        $authHeader = $request->header('Authorization');
        try {
            $userResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(3)
                ->post('http://identity-service:8000/api/admin/users/by-ids', ['ids' => [$helper->user_id]]);

            if ($userResponse->successful()) {
                $users = $userResponse->json('data') ?? [];
                if (!empty($users)) {
                    $helper->user = $users[0];
                }
            }
        } catch (\Exception $e) {
            // ignore
        }

        return response()->json(['data' => $helper], Response::HTTP_OK);
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
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], Response::HTTP_NOT_FOUND);
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

        return response()->json([
            'message' => $fields['status'] === 'approved'
                ? 'Đã phê duyệt hồ sơ helper thành công.'
                : 'Đã từ chối hồ sơ helper.',
            'data'    => $verification,
        ], Response::HTTP_OK);
    }

    /**
     * Khoá / Mở khoá helper (Admin + Operator).
     * Body: { "status": "active" | "suspended", "reason": "..." }
     */
    public function toggleHelperStatus(Request $request, $id)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], Response::HTTP_NOT_FOUND);
        }

        $fields = $request->validate([
            'status' => 'required|string|in:active,suspended',
            'reason' => 'nullable|string|max:255',
        ]);

        $helper->update(['status' => $fields['status']]);

        $msg = $fields['status'] === 'suspended'
            ? 'Đã khoá tài khoản helper.'
            : 'Đã mở khoá tài khoản helper.';

        return response()->json([
            'message' => $msg,
            'data'    => $helper->fresh(),
        ], Response::HTTP_OK);
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
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $stats = [
            'total'     => HelperProfile::count(),
            'active'    => HelperProfile::where('status', 'active')->count(),
            'pending'   => HelperProfile::where('status', 'pending')->count(),
            'suspended' => HelperProfile::where('status', 'suspended')->count(),
            'rejected'  => HelperProfile::where('status', 'rejected')->count(),
            'pending_verifications' => HelperVerification::where('status', 'pending')->count(),
        ];

        return response()->json(['data' => $stats], Response::HTTP_OK);
    }

    /**
     * Admin xóa vĩnh viễn 1 helper (chỉ Admin).
     */
    public function deleteHelper(Request $request, $id)
    {
        // Phải là Admin (role_id = 1)
        if ($request->authUser['role_id'] !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], Response::HTTP_NOT_FOUND);
        }

        // Gọi identity-service để xóa account user tương ứng
        $authHeader = $request->header('Authorization');
        try {
            $userResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(5)
                ->delete("http://identity-service:8000/api/admin/users/{$helper->user_id}");

            // Nếu xóa user thành công hoặc user không tồn tại thì ta tiếp tục xóa helper profile
            if ($userResponse->successful() || $userResponse->status() === 404) {
                $helper->delete(); // Sẽ cascade delete working areas, verifications, skills, availability...
                return response()->json(['message' => 'Xóa người giúp việc và tài khoản liên kết thành công.'], Response::HTTP_OK);
            }

            return response()->json([
                'message' => 'Không thể xóa tài khoản liên kết ở Identity Service.',
                'error' => $userResponse->json()
            ], $userResponse->status());

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi kết nối liên dịch vụ khi xóa tài khoản helper.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Admin xóa hàng loạt helper (chỉ Admin).
     */
    public function bulkDeleteHelpers(Request $request)
    {
        // Phải là Admin (role_id = 1)
        if ($request->authUser['role_id'] !== Role::ADMIN) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], Response::HTTP_FORBIDDEN);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        $ids = $request->input('ids');
        $helpers = HelperProfile::whereIn('id', $ids)->get();

        if ($helpers->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy người giúp việc nào để xóa.'], Response::HTTP_NOT_FOUND);
        }

        $userIds = $helpers->pluck('user_id')->toArray();
        $authHeader = $request->header('Authorization');

        try {
            // Gọi identity-service để bulk delete account
            $userResponse = Http::withHeaders(['Authorization' => $authHeader])
                ->timeout(5)
                ->post("http://identity-service:8000/api/admin/users/bulk-delete", ['ids' => $userIds]);

            if ($userResponse->successful()) {
                // Xóa các helper profile tương ứng
                HelperProfile::whereIn('id', $ids)->delete();
                return response()->json(['message' => 'Xóa hàng loạt người giúp việc và tài khoản liên kết thành công.'], Response::HTTP_OK);
            }

            return response()->json([
                'message' => 'Không thể xóa hàng loạt tài khoản liên kết ở Identity Service.',
                'error' => $userResponse->json()
            ], $userResponse->status());

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi kết nối liên dịch vụ khi xóa hàng loạt helper.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

