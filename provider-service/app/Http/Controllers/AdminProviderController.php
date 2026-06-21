<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HelperProfile;
use App\Models\HelperVerification;

class AdminProviderController extends Controller
{
    /**
     * Kiểm tra quyền Admin (role_id=1) hoặc Operator (role_id=2).
     */
    private function requireAdminOrOperator(Request $request): ?array
    {
        $roleId = $request->authUser['role_id'] ?? null;
        if (!in_array($roleId, [1, 2])) {
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
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $query = HelperProfile::with(['skills.service', 'workingAreas', 'verifications']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('city')) {
            $city = $request->query('city');
            $query->whereHas('workingAreas', fn($q) => $q->where('city', $city));
        }

        if ($request->filled('search')) {
            // Tìm theo user_id (vì helper_profiles không lưu tên — tên nằm ở identity-service)
            $query->where('user_id', $request->query('search'));
        }

        $limit   = (int) $request->query('limit', 20);
        $helpers = $query->orderByDesc('id')->paginate($limit);

        return response()->json(['data' => $helpers], 200);
    }

    /**
     * Chi tiết 1 helper (Admin + Operator).
     */
    public function showHelper(Request $request, $id)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $helper = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities', 'verifications'])
                               ->find($id);

        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], 404);
        }

        return response()->json(['data' => $helper], 200);
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
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], 404);
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
        ], 200);
    }

    /**
     * Khoá / Mở khoá helper (Admin + Operator).
     * Body: { "status": "active" | "suspended", "reason": "..." }
     */
    public function toggleHelperStatus(Request $request, $id)
    {
        if (!$this->requireAdminOrOperator($request)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $helper = HelperProfile::find($id);
        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], 404);
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
        ], 200);
    }

    // =====================================================================
    //  ADMIN ONLY — Thống kê (role_id = 1)
    // =====================================================================

    /**
     * Thống kê tổng quan helper (Admin only).
     */
    public function stats(Request $request)
    {
        if ($request->authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $stats = [
            'total'     => HelperProfile::count(),
            'active'    => HelperProfile::where('status', 'active')->count(),
            'pending'   => HelperProfile::where('status', 'pending')->count(),
            'suspended' => HelperProfile::where('status', 'suspended')->count(),
            'rejected'  => HelperProfile::where('status', 'rejected')->count(),
            'pending_verifications' => HelperVerification::where('status', 'pending')->count(),
        ];

        return response()->json(['data' => $stats], 200);
    }
}
