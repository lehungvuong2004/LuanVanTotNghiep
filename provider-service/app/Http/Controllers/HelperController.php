<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HelperProfile;
use App\Models\HelperSkill;
use App\Models\HelperWorkingArea;
use App\Models\HelperAvailability;
use App\Models\HelperVerification;

class HelperController extends Controller
{
    // =====================================================================
    //  PUBLIC — Không cần đăng nhập
    // =====================================================================

    /**
     * Tìm kiếm danh sách helper công khai.
     * Filter: city, district, service_id, gender, rating_min, status=active
     * Sắp xếp: rating_avg DESC, total_reviews DESC
     */
    public function publicList(Request $request)
    {
        $query = HelperProfile::with(['skills.service', 'workingAreas'])
                              ->where('status', 'active');

        if ($request->filled('city')) {
            $city = $request->query('city');
            $query->whereHas('workingAreas', fn($q) => $q->where('city', $city));
        }

        if ($request->filled('district')) {
            $district = $request->query('district');
            $query->whereHas('workingAreas', fn($q) => $q->where('district', $district));
        }

        if ($request->filled('service_id')) {
            $serviceId = $request->query('service_id');
            $query->whereHas('skills', fn($q) => $q->where('service_id', $serviceId));
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->query('gender'));
        }

        if ($request->filled('rating_min')) {
            $query->where('rating_avg', '>=', (float) $request->query('rating_min'));
        }

        $limit   = (int) $request->query('limit', 20);
        $helpers = $query->orderByDesc('rating_avg')
                         ->orderByDesc('total_reviews')
                         ->paginate($limit);

        return response()->json(['data' => $helpers], 200);
    }

    /**
     * Xem hồ sơ công khai của một helper.
     */
    public function publicShow($id)
    {
        $helper = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities'])
                               ->where('id', $id)
                               ->where('status', 'active')
                               ->first();

        if (!$helper) {
            return response()->json(['message' => 'Không tìm thấy helper.'], 404);
        }

        return response()->json(['data' => $helper], 200);
    }

    /**
     * Lấy danh sách user_id của tất cả helper (được gọi nội bộ/công khai).
     */
    public function getHelperUserIds()
    {
        $userIds = HelperProfile::pluck('user_id')->toArray();
        return response()->json($userIds, 200);
    }

    // =====================================================================
    //  HELPER — Quản lý hồ sơ của chính mình (role_id = 3)
    // =====================================================================

    /**
     * Lấy toàn bộ hồ sơ của helper đang đăng nhập (kể cả pending).
     */
    public function myProfile(Request $request)
    {
        $userId = $request->authUser['id'];
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Helper.'], 403);
        }

        $profile = HelperProfile::with(['skills.service', 'workingAreas', 'availabilities', 'verifications'])
                                ->where('user_id', $userId)
                                ->first();

        if (!$profile) {
            return response()->json(['message' => 'Bạn chưa có hồ sơ. Vui lòng tạo hồ sơ trước.', 'data' => null], 200);
        }

        return response()->json(['data' => $profile], 200);
    }

    /**
     * Tạo hồ sơ helper lần đầu.
     */
    public function createProfile(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Helper.'], 403);
        }

        $userId = $request->authUser['id'];

        $existing = HelperProfile::where('user_id', $userId)->first();
        if ($existing) {
            return response()->json(['message' => 'Bạn đã có hồ sơ. Vui lòng dùng API cập nhật.'], 409);
        }

        $fields = $request->validate([
            'bio'             => 'nullable|string|max:1000',
            'experience_year' => 'nullable|integer|min:0|max:50',
            'gender'          => 'nullable|string|in:male,female,other',
            'birthday'        => 'nullable|date|before:today',
            'address'         => 'nullable|string|max:255',
        ]);

        $profile = HelperProfile::create(array_merge($fields, [
            'user_id' => $userId,
            'status'  => 'pending', // Chờ Admin/Operator duyệt
        ]));

        return response()->json([
            'message' => 'Tạo hồ sơ thành công. Hồ sơ đang chờ xét duyệt.',
            'data'    => $profile,
        ], 201);
    }

    /**
     * Cập nhật hồ sơ helper.
     */
    public function updateProfile(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Helper.'], 403);
        }

        $userId  = $request->authUser['id'];
        $profile = HelperProfile::where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);
        }

        $fields = $request->validate([
            'bio'             => 'sometimes|nullable|string|max:1000',
            'experience_year' => 'sometimes|nullable|integer|min:0|max:50',
            'gender'          => 'sometimes|nullable|string|in:male,female,other',
            'birthday'        => 'sometimes|nullable|date|before:today',
            'address'         => 'sometimes|nullable|string|max:255',
        ]);

        $profile->update($fields);

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công.',
            'data'    => $profile->fresh(['skills.service', 'workingAreas']),
        ], 200);
    }

    // =====================================================================
    //  SKILLS (role: helper)
    // =====================================================================

    public function listSkills(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['data' => []], 200);

        $skills = HelperSkill::with('service')
                             ->where('helper_id', $profile->id)
                             ->get();

        return response()->json(['data' => $skills], 200);
    }

    public function addSkill(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $fields = $request->validate([
            'service_id' => 'required|integer|exists:services,id',
        ]);

        $existing = HelperSkill::where('helper_id', $profile->id)
                                ->where('service_id', $fields['service_id'])
                                ->first();

        if ($existing) {
            return response()->json(['message' => 'Kỹ năng này đã tồn tại trong hồ sơ của bạn.'], 409);
        }

        $skill = HelperSkill::create([
            'helper_id'  => $profile->id,
            'service_id' => $fields['service_id'],
        ]);

        return response()->json([
            'message' => 'Thêm kỹ năng thành công.',
            'data'    => $skill->load('service'),
        ], 201);
    }

    public function removeSkill(Request $request, $serviceId)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $skill = HelperSkill::where('helper_id', $profile->id)
                             ->where('service_id', $serviceId)
                             ->first();

        if (!$skill) return response()->json(['message' => 'Không tìm thấy kỹ năng.'], 404);

        $skill->delete();
        return response()->json(['message' => 'Đã xóa kỹ năng.'], 200);
    }

    // =====================================================================
    //  WORKING AREAS (role: helper)
    // =====================================================================

    public function listWorkingAreas(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['data' => []], 200);

        return response()->json(['data' => $profile->workingAreas], 200);
    }

    public function addWorkingArea(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $fields = $request->validate([
            'district' => 'required|string|max:100',
            'city'     => 'required|string|max:100',
        ]);

        $area = HelperWorkingArea::create(array_merge($fields, ['helper_id' => $profile->id]));

        return response()->json([
            'message' => 'Thêm khu vực làm việc thành công.',
            'data'    => $area,
        ], 201);
    }

    public function removeWorkingArea(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $area = HelperWorkingArea::where('id', $id)->where('helper_id', $profile->id)->first();
        if (!$area) return response()->json(['message' => 'Không tìm thấy khu vực.'], 404);

        $area->delete();
        return response()->json(['message' => 'Đã xóa khu vực làm việc.'], 200);
    }

    // =====================================================================
    //  AVAILABILITY (role: helper)
    // =====================================================================

    public function listAvailability(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['data' => []], 200);

        $slots = HelperAvailability::where('helper_id', $profile->id)
                                   ->where('available_date', '>=', now()->toDateString())
                                   ->orderBy('available_date')
                                   ->orderBy('start_time')
                                   ->get();

        return response()->json(['data' => $slots], 200);
    }

    public function addAvailability(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $fields = $request->validate([
            'available_date' => 'required|date|after_or_equal:today',
            'start_time'     => 'required|date_format:H:i',
            'status'         => 'sometimes|string|in:available,booked',
        ]);

        // Kiểm tra trùng lịch
        $exists = HelperAvailability::where('helper_id', $profile->id)
                                    ->where('available_date', $fields['available_date'])
                                    ->where('start_time', $fields['start_time'])
                                    ->exists();

        if ($exists) {
            return response()->json(['message' => 'Khung giờ này đã tồn tại trong lịch của bạn.'], 409);
        }

        $slot = HelperAvailability::create(array_merge($fields, [
            'helper_id' => $profile->id,
            'status'    => $fields['status'] ?? 'available',
        ]));

        return response()->json([
            'message' => 'Thêm lịch rảnh thành công.',
            'data'    => $slot,
        ], 201);
    }

    public function removeAvailability(Request $request, $id)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $slot = HelperAvailability::where('id', $id)->where('helper_id', $profile->id)->first();
        if (!$slot) return response()->json(['message' => 'Không tìm thấy lịch.'], 404);

        $slot->delete();
        return response()->json(['message' => 'Đã xóa lịch rảnh.'], 200);
    }

    // =====================================================================
    //  VERIFICATION — Helper nộp hồ sơ xét duyệt (role: helper)
    // =====================================================================

    public function submitVerification(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        // Kiểm tra nếu đang có verification pending
        $pending = HelperVerification::where('helper_id', $profile->id)
                                     ->where('status', 'pending')
                                     ->exists();

        if ($pending) {
            return response()->json(['message' => 'Hồ sơ của bạn đang chờ xét duyệt.'], 409);
        }

        $verification = HelperVerification::create([
            'helper_id' => $profile->id,
            'status'    => 'pending',
        ]);

        return response()->json([
            'message' => 'Đã nộp hồ sơ xét duyệt. Vui lòng chờ Admin/Operator xử lý.',
            'data'    => $verification,
        ], 201);
    }

    public function myVerificationStatus(Request $request)
    {
        if ($request->authUser['role_id'] !== 3) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = HelperProfile::where('user_id', $request->authUser['id'])->first();
        if (!$profile) return response()->json(['message' => 'Bạn chưa có hồ sơ.'], 404);

        $verifications = HelperVerification::where('helper_id', $profile->id)
                                           ->orderByDesc('created_at')
                                           ->get();

        return response()->json(['data' => $verifications], 200);
    }
}
