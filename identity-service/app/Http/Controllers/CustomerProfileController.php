<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;

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
    $user = $this->getAuthUser();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    // Customer lấy chính mình; Admin có thể dùng endpoint admin riêng
    if (!in_array($user->role_id, [Role::ADMIN, Role::CUSTOMER])) {
      return $this->forbiddenResponse('Chức năng này dành cho tài khoản Khách hàng.');
    }

    $profile = CustomerProfile::with('addresses')
      ->where('user_id', $user->id)
      ->first();

    if (!$profile) {
      // Tự động tạo profile trống khi customer chưa có
      $profile = CustomerProfile::create(['user_id' => $user->id]);
    }

    $profile->load('addresses');

    return $this->successResponse($profile);
  }

  /**
   * Cập nhật profile mở rộng của Customer (gender, birthday, note).
   * Role cho phép: customer (role_id=2).
   */
  public function updateProfile(Request $request)
  {
    if ($unauthorized = $this->authorizeCustomer()) {
      return $unauthorized;
    }

    $user = $this->getAuthUser();

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
    ], Response::HTTP_OK);
  }

    // =====================================================================
    //  CUSTOMER ADDRESSES
    // =====================================================================

  /**
   * Danh sách địa chỉ của Customer đang đăng nhập.
   */
  public function listAddresses()
  {
    if ($unauthorized = $this->authorizeCustomer()) {
      return $unauthorized;
    }

    $user = $this->getAuthUser();
    $profile = CustomerProfile::where('user_id', $user->id)->first();
    if (!$profile) {
      return $this->successResponse([]);
    }

    $addresses = CustomerAddress::where('customer_id', $profile->id)
      ->orderByDesc('is_default')
      ->get();

    return $this->successResponse($addresses);
  }

  /**
   * Thêm địa chỉ mới cho Customer.
   */
  public function addAddress(Request $request)
  {
    if ($unauthorized = $this->authorizeCustomer()) {
      return $unauthorized;
    }

    $user = $this->getAuthUser();

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
    ], Response::HTTP_CREATED);
  }

  /**
   * Cập nhật địa chỉ theo ID.
   */
  public function updateAddress(Request $request, $id)
  {
    if ($unauthorized = $this->authorizeCustomer()) {
      return $unauthorized;
    }

    $user = $this->getAuthUser();
    $profile = CustomerProfile::where('user_id', $user->id)->first();
    if (!$profile) {
      return $this->notFoundResponse('Không tìm thấy profile.');
    }

    $address = CustomerAddress::where('id', $id)
      ->where('customer_id', $profile->id)
      ->first();
    if (!$address) {
      return $this->notFoundResponse('Không tìm thấy địa chỉ.');
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
    ], Response::HTTP_OK);
  }

  /**
   * Xóa địa chỉ theo ID.
   */
  public function deleteAddress($id)
  {
    if ($unauthorized = $this->authorizeCustomer()) {
      return $unauthorized;
    }

    $user = $this->getAuthUser();
    $profile = CustomerProfile::where('user_id', $user->id)->first();
    if (!$profile) {
      return $this->notFoundResponse('Không tìm thấy profile.');
    }

    $address = CustomerAddress::where('id', $id)
      ->where('customer_id', $profile->id)
      ->first();
    if (!$address) {
      return $this->notFoundResponse('Không tìm thấy địa chỉ.');
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

    return response()->json(['message' => 'Xóa địa chỉ thành công.'], Response::HTTP_OK);
  }

  /**
   * Đặt địa chỉ mặc định.
   */
  public function setDefaultAddress($id)
  {
    if ($unauthorized = $this->authorizeCustomer()) {
      return $unauthorized;
    }

    $user = $this->getAuthUser();
    $profile = CustomerProfile::where('user_id', $user->id)->first();
    if (!$profile) {
      return $this->notFoundResponse('Không tìm thấy profile.');
    }

    $address = CustomerAddress::where('id', $id)
      ->where('customer_id', $profile->id)
      ->first();
    if (!$address) {
      return $this->notFoundResponse('Không tìm thấy địa chỉ.');
    }

    // Bỏ mặc định tất cả → đặt mặc định cho địa chỉ được chọn
    CustomerAddress::where('customer_id', $profile->id)->update(['is_default' => 0]);
    $address->update(['is_default' => 1]);

    return response()->json([
      'message' => 'Đã đặt làm địa chỉ mặc định.',
      'data'    => $address->fresh()
    ], Response::HTTP_OK);
  }

  /**
   * API nội bộ: Kiểm tra trạng thái hoàn thiện hồ sơ của Customer.
   */
  public function getCustomerProfileStatusInternal(Request $request)
  {
      $request->validate([
          'user_id' => 'required|integer'
      ]);
      
      $userId = $request->input('user_id');
      
      $user = \App\Models\User::find($userId);
      if (!$user) {
          return response()->json(['is_complete' => false, 'message' => 'Người dùng không tồn tại.'], Response::HTTP_NOT_FOUND);
      }
      
      if (empty($user->phone)) {
          return response()->json(['is_complete' => false, 'message' => 'Vui lòng cập nhật số điện thoại liên hệ.'], Response::HTTP_OK);
      }
      
      $profile = CustomerProfile::where('user_id', $userId)->first();
      if (!$profile || empty($profile->gender) || empty($profile->birthday)) {
          return response()->json(['is_complete' => false, 'message' => 'Vui lòng cập nhật giới tính và ngày sinh.'], Response::HTTP_OK);
      }
      
      $hasAddress = CustomerAddress::where('customer_id', $profile->id)->exists();
      if (!$hasAddress) {
          return response()->json(['is_complete' => false, 'message' => 'Vui lòng thêm ít nhất một địa chỉ liên hệ.'], Response::HTTP_OK);
      }
      
      return response()->json(['is_complete' => true], Response::HTTP_OK);
  }
}
