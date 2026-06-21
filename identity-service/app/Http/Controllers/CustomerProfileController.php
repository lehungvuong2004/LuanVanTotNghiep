<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use Illuminate\Support\Facades\DB;

class CustomerProfileController extends Controller
{
    // =====================================================================
    //  CUSTOMER PROFILE
    // =====================================================================

    /**
     * Lấy profile mở rộng của Customer (gender, birthday, note + danh sách địa chỉ).
     * Role cho phép: customer (role_id=2). Admin (1) có thể xem profile bất kỳ.
     */
    public function getProfile()
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Customer lấy chính mình; Admin có thể dùng endpoint admin riêng
        if (!in_array($user->role_id, [1, 4])) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $profile = CustomerProfile::with('addresses')
                                  ->where('user_id', $user->id)
                                  ->first();

        if (!$profile) {
            // Tự động tạo profile trống khi customer chưa có
            $profile = CustomerProfile::create(['user_id' => $user->id]);
        }

        $profile->load('addresses');

        return response()->json(['data' => $profile], 200);
    }

    /**
     * Cập nhật profile mở rộng của Customer (gender, birthday, note).
     * Role cho phép: customer (role_id=2).
     */
    public function updateProfile(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $fields = $request->validate([
            'gender'   => 'sometimes|nullable|string|in:male,female,other',
            'birthday' => 'sometimes|nullable|date|before:today',
            'note'     => 'sometimes|nullable|string|max:191',
        ], [
            'birthday.before' => 'Ngày sinh phải trước ngày hôm nay.',
        ]);

        $profile = CustomerProfile::firstOrCreate(['user_id' => $user->id]);
        $profile->update($fields);

        return response()->json([
            'message' => 'Cập nhật profile thành công.',
            'data'    => $profile
        ], 200);
    }

    // =====================================================================
    //  CUSTOMER ADDRESSES
    // =====================================================================

    /**
     * Danh sách địa chỉ của Customer đang đăng nhập.
     */
    public function listAddresses()
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $profile = CustomerProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return response()->json(['data' => []], 200);
        }

        $addresses = CustomerAddress::where('customer_id', $profile->id)
                                    ->orderByDesc('is_default')
                                    ->get();

        return response()->json(['data' => $addresses], 200);
    }

    /**
     * Thêm địa chỉ mới cho Customer.
     */
    public function addAddress(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $fields = $request->validate([
            'address'    => 'required|string|max:255',
            'district'   => 'nullable|string|max:100',
            'city'       => 'nullable|string|max:100',
            'is_default' => 'sometimes|boolean',
        ]);

        $profile = CustomerProfile::firstOrCreate(['user_id' => $user->id]);

        // Nếu đặt làm mặc định → bỏ mặc định của các địa chỉ cũ
        if (!empty($fields['is_default'])) {
            CustomerAddress::where('customer_id', $profile->id)
                           ->update(['is_default' => 0]);
        }

        // Nếu chưa có địa chỉ nào thì tự động đặt là mặc định
        $count = CustomerAddress::where('customer_id', $profile->id)->count();

        $address = CustomerAddress::create([
            'customer_id' => $profile->id,
            'address'     => $fields['address'],
            'district'    => $fields['district'] ?? null,
            'city'        => $fields['city'] ?? null,
            'is_default'  => (!empty($fields['is_default']) || $count === 0) ? 1 : 0,
        ]);

        return response()->json([
            'message' => 'Thêm địa chỉ thành công.',
            'data'    => $address
        ], 201);
    }

    /**
     * Cập nhật địa chỉ theo ID.
     */
    public function updateAddress(Request $request, $id)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $profile = CustomerProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Không tìm thấy profile.'], 404);
        }

        $address = CustomerAddress::where('id', $id)
                                  ->where('customer_id', $profile->id)
                                  ->first();
        if (!$address) {
            return response()->json(['message' => 'Không tìm thấy địa chỉ.'], 404);
        }

        $fields = $request->validate([
            'address'  => 'sometimes|required|string|max:255',
            'district' => 'sometimes|nullable|string|max:100',
            'city'     => 'sometimes|nullable|string|max:100',
        ]);

        $address->update($fields);

        return response()->json([
            'message' => 'Cập nhật địa chỉ thành công.',
            'data'    => $address
        ], 200);
    }

    /**
     * Xóa địa chỉ theo ID.
     */
    public function deleteAddress($id)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $profile = CustomerProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Không tìm thấy profile.'], 404);
        }

        $address = CustomerAddress::where('id', $id)
                                  ->where('customer_id', $profile->id)
                                  ->first();
        if (!$address) {
            return response()->json(['message' => 'Không tìm thấy địa chỉ.'], 404);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // Nếu địa chỉ vừa xoá là mặc định → tự động đặt lại địa chỉ đầu tiên còn lại
        if ($wasDefault) {
            $first = CustomerAddress::where('customer_id', $profile->id)->first();
            if ($first) {
                $first->update(['is_default' => 1]);
            }
        }

        return response()->json(['message' => 'Xóa địa chỉ thành công.'], 200);
    }

    /**
     * Đặt địa chỉ mặc định.
     */
    public function setDefaultAddress($id)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role_id !== 4) {
            return response()->json(['message' => 'Chức năng này dành cho tài khoản Khách hàng.'], 403);
        }

        $profile = CustomerProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Không tìm thấy profile.'], 404);
        }

        $address = CustomerAddress::where('id', $id)
                                  ->where('customer_id', $profile->id)
                                  ->first();
        if (!$address) {
            return response()->json(['message' => 'Không tìm thấy địa chỉ.'], 404);
        }

        // Bỏ mặc định tất cả → đặt mặc định cho địa chỉ được chọn
        CustomerAddress::where('customer_id', $profile->id)->update(['is_default' => 0]);
        $address->update(['is_default' => 1]);

        return response()->json([
            'message' => 'Đã đặt làm địa chỉ mặc định.',
            'data'    => $address->fresh()
        ], 200);
    }
}
