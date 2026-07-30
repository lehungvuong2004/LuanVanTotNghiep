<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Constants\Role;
use Symfony\Component\HttpFoundation\Response;
use App\Models\City;
use App\Models\District;

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

    $profile = CustomerProfile::with('addresses.city', 'addresses.district')
      ->where('user_id', $user->id)
      ->first();

    if (!$profile) {
      // Tự động tạo profile trống khi customer chưa có
      $profile = CustomerProfile::create(['user_id' => $user->id]);
    }

    $profile->load('addresses.city', 'addresses.district');

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

    $addresses = CustomerAddress::with(['city', 'district'])
      ->where('customer_id', $profile->id)
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

    if ($request->has('city') && !is_numeric($request->city)) {
      $cityModel = $this->findCity($request->city);
      if ($cityModel) {
        $request->merge(['city_id' => $cityModel->id]);
        $districtModel = $this->findDistrict($cityModel->id, $request->district);
        if ($districtModel) {
          $request->merge(['district_id' => $districtModel->id]);
        }
      }
    }

    $fields = $request->validate([
      'address'     => 'required|string|max:255',
      'city_id'     => 'required|integer|exists:cities,id',
      'district_id' => 'required|integer|exists:districts,id',
      'is_default'  => 'sometimes|boolean',
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
      'city_id'     => $fields['city_id'],
      'district_id' => $fields['district_id'],
      'is_default'  => (!empty($fields['is_default']) || $count === 0) ? 1 : 0,
    ]);

    return response()->json([
      'message' => 'Thêm địa chỉ thành công.',
      'data'    => $address->load(['city', 'district'])
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

    if ($request->has('city') && !is_numeric($request->city)) {
      $cityModel = $this->findCity($request->city);
      if ($cityModel) {
        $request->merge(['city_id' => $cityModel->id]);
        $districtModel = $this->findDistrict($cityModel->id, $request->district);
        if ($districtModel) {
          $request->merge(['district_id' => $districtModel->id]);
        }
      }
    }

    $fields = $request->validate([
      'address'     => 'sometimes|required|string|max:255',
      'city_id'     => 'sometimes|required|integer|exists:cities,id',
      'district_id' => 'sometimes|required|integer|exists:districts,id',
    ]);

    $address->update($fields);

    return response()->json([
      'message' => 'Cập nhật địa chỉ thành công.',
      'data'    => $address->load(['city', 'district'])
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

  private function findCity($cityName)
  {
    if (empty($cityName)) return null;

    $cityInput = trim($cityName);
    // 1. Exact match first
    $cityModel = City::where('name', $cityInput)->first();
    if ($cityModel) return $cityModel;

    // 2. Fetch and match using normalization
    $normalizedInput = str_replace(['.', ' ', '-', 'thànhphố', 'tp', 'tỉnh'], '', strtolower($cityInput));
    $cities = City::all();
    foreach ($cities as $city) {
      $normalizedDb = str_replace(['.', ' ', '-', 'thànhphố', 'tp', 'tỉnh'], '', strtolower($city->name));
      if ($normalizedDb === $normalizedInput || 
          ($normalizedDb !== '' && strpos($normalizedInput, $normalizedDb) !== false) || 
          ($normalizedInput !== '' && strpos($normalizedDb, $normalizedInput) !== false) ||
          ($normalizedDb === 'hcm' && $normalizedInput === 'hồchíminh') ||
          ($normalizedDb === 'hồchíminh' && $normalizedInput === 'hcm')
      ) {
        return $city;
      }
    }

    return City::create(['name' => $cityInput]);
  }

  private function findDistrict($cityId, $districtName)
  {
    if (empty($districtName) || !$cityId) return null;

    $districtInput = trim($districtName);
    // 1. Exact match first
    $districtModel = District::where('city_id', $cityId)->where('name', $districtInput)->first();
    if ($districtModel) return $districtModel;

    // 2. Fetch and match using normalization
    $normalizedInput = str_replace(['.', ' ', '-', 'quận', 'huyện', 'thịxã', 'thànhphố', 'xã', 'phường', 'thịtrấn'], '', strtolower($districtInput));
    
    // Common commune/ward fallback mappings for HCMC to their respective districts
    $communeMap = [
        'bìnhhưng' => 'bìnhchánh',
        'phongphú' => 'bìnhchánh',
        'vĩnhlộc' => 'bìnhchánh',
        'hiệpphước' => 'nhàbè',
        'phúxuân' => 'nhàbè',
        'nhơnđức' => 'nhàbè',
        'phướckiển' => 'nhàbè',
        'phướclộc' => 'nhàbè',
        'đakao' => 'quận1',
        'bếnnghé' => 'quận1',
        'bếnthành' => 'quận1',
        'phạmngũlão' => 'quận1',
        'nguyễncưtrinh' => 'quận1',
        'nguyễntháibình' => 'quận1',
        'cầukho' => 'quận1',
        'cầuônglãnh' => 'quận1',
        'côgiang' => 'quận1',
        'tânđịnh' => 'quận1',
        'thảođiền' => 'thủđức',
        'cátlái' => 'thủđức',
        'hiệpbìnhchánh' => 'thủđức',
        'hiệpbìnhphước' => 'thủđức',
        'linhđông' => 'thủđức',
        'linhtây' => 'thủđức',
        'linhchiểu' => 'thủđức',
        'linhtrung' => 'thủđức',
        'linhxuân' => 'thủđức',
        'tambình' => 'thủđức',
        'tamphú' => 'thủđức',
        'trườngthọ' => 'thủđức',
        'hiệpbình' => 'thủđức',
        'anphú' => 'thủđức',
        'longthạnhmỹ' => 'thủđức',
        'longtrường' => 'thủđức',
        'phướclong' => 'thủđức',
        'hiệpphú' => 'thủđức',
    ];

    if (array_key_exists($normalizedInput, $communeMap)) {
      $normalizedInput = $communeMap[$normalizedInput];
    }

    $districts = District::where('city_id', $cityId)->get();
    foreach ($districts as $district) {
      $normalizedDb = str_replace(['.', ' ', '-', 'quận', 'huyện', 'thịxã', 'thànhphố', 'xã', 'phường', 'thịtrấn'], '', strtolower($district->name));
      if ($normalizedDb === $normalizedInput || 
          ($normalizedDb !== '' && strpos($normalizedInput, $normalizedDb) !== false) || 
          ($normalizedInput !== '' && strpos($normalizedDb, $normalizedInput) !== false)
      ) {
        return $district;
      }
    }

    return District::create([
        'city_id' => $cityId,
        'name' => $districtInput
    ]);
  }
}
