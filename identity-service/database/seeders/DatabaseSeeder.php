<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Models\Banner;
use App\Models\ActivityLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
  use WithoutModelEvents;

  /**
   * Seed the application's database.
   */
  public function run(): void
  {

    $adminPass = env('SEED_ADMIN_PASSWORD');
    $customerPass = env('SEED_CUSTOMER_PASSWORD');
    $helperPass = env('SEED_HELPER_PASSWORD');
    $operatorPass = env('SEED_OPERATOR_PASSWORD');

    $adminPhone = env('SEED_ADMIN_PHONE', '0901234567');
    $operatorPhone = env('SEED_OPERATOR_PHONE', '0904567890');
    $helperPhone = env('SEED_HELPER_PHONE', '0903456789');
    $customerPhone = env('SEED_CUSTOMER_PHONE', '0902345678');

    if (!$adminPass || !$customerPass || !$helperPass || !$operatorPass) {
      throw new \Exception("Vui lòng cấu hình đầy đủ SEED_ADMIN_PASSWORD, SEED_CUSTOMER_PASSWORD, SEED_HELPER_PASSWORD, SEED_OPERATOR_PASSWORD trong file .env trước khi chạy Seed.");
    }

    // Seed Admin Account (role_id = 1)
    User::updateOrCreate(
      ['email' => 'admin@gmail.com'],
      [
        'role_id' => 1,
        'full_name' => 'Quản trị viên',
        'phone' => $adminPhone,
        'password' => Hash::make($adminPass),
        'status' => 'active',
      ]
    );

    // Seed Operator Account (role_id = 2)
    User::updateOrCreate(
      ['email' => 'operator@gmail.com'],
      [
        'role_id' => 2,
        'full_name' => 'Nhân viên vận hành C',
        'phone' => $operatorPhone,
        'password' => Hash::make($operatorPass),
        'status' => 'active',
      ]
    );

    // Seed Helper Account (role_id = 3)
    User::updateOrCreate(
      ['email' => 'helper@gmail.com'],
      [
        'id' => 3,
        'role_id' => 3,
        'full_name' => 'Người giúp việc B',
        'phone' => $helperPhone,
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper2@gmail.com'],
      [
        'id' => 10,
        'role_id' => 3,
        'full_name' => 'Nguyễn Thị Hoa',
        'phone' => '0903333222',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper3@gmail.com'],
      [
        'id' => 11,
        'role_id' => 3,
        'full_name' => 'Trần Văn Hùng',
        'phone' => '0903333444',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper4@gmail.com'],
      [
        'id' => 12,
        'role_id' => 3,
        'full_name' => 'Phạm Thanh Sơn',
        'phone' => '0903333555',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper5@gmail.com'],
      [
        'id' => 13,
        'role_id' => 3,
        'full_name' => 'Lê Thị Mai',
        'phone' => '0903333666',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    // Seed Customer Account (role_id = 4)
    User::updateOrCreate(
      ['email' => 'customer@gmail.com'],
      [
        'id' => 4,
        'role_id' => 4,
        'full_name' => 'Khách hàng A',
        'phone' => $customerPhone,
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer2@gmail.com'],
      [
        'id' => 14,
        'role_id' => 4,
        'full_name' => 'Nguyễn Văn Nam',
        'phone' => '0902222111',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer3@gmail.com'],
      [
        'id' => 15,
        'role_id' => 4,
        'full_name' => 'Trần Thị Tuyết',
        'phone' => '0902222333',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer4@gmail.com'],
      [
        'id' => 16,
        'role_id' => 4,
        'full_name' => 'Phạm Minh Tuấn',
        'phone' => '0902222444',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer5@gmail.com'],
      [
        'id' => 17,
        'role_id' => 4,
        'full_name' => 'Đỗ Thu Trang',
        'phone' => '0902222555',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    // ================================================================
    //  SEED CUSTOMER PROFILES & ADDRESSES
    // ================================================================

    $cp1 = CustomerProfile::updateOrCreate(
      ['user_id' => 4],
      ['gender' => 'male', 'birthday' => '1990-03-15', 'note' => 'Khách hàng thường xuyên sử dụng dịch vụ dọn nhà.']
    );

    $cp2 = CustomerProfile::updateOrCreate(
      ['user_id' => 14],
      ['gender' => 'male', 'birthday' => '1988-07-22', 'note' => 'Cần chăm sóc người già tại nhà.']
    );

    $cp3 = CustomerProfile::updateOrCreate(
      ['user_id' => 15],
      ['gender' => 'female', 'birthday' => '1995-11-08', 'note' => 'Tìm bảo mẫu cho em bé.']
    );

    $cp4 = CustomerProfile::updateOrCreate(
      ['user_id' => 16],
      ['gender' => 'male', 'birthday' => '1992-01-30', 'note' => null]
    );

    $cp5 = CustomerProfile::updateOrCreate(
      ['user_id' => 17],
      ['gender' => 'female', 'birthday' => '1998-05-12', 'note' => 'Thuê dọn dẹp định kỳ hàng tuần.']
    );

    // Customer Addresses
    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp1->id, 'address' => '123 Nguyễn Trãi, Phường Bến Thành'],
      ['district' => 'Quận 1', 'city' => 'TP.HCM', 'is_default' => 1]
    );
    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp1->id, 'address' => '456 Lê Văn Sỹ, Phường 14'],
      ['district' => 'Quận 3', 'city' => 'TP.HCM', 'is_default' => 0]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp2->id, 'address' => '789 Cách Mạng Tháng 8, Phường 5'],
      ['district' => 'Quận 10', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp3->id, 'address' => '55 Phan Đăng Lưu, Phường 6'],
      ['district' => 'Bình Thạnh', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp4->id, 'address' => '101 Hoàng Văn Thụ, Phường 8'],
      ['district' => 'Phú Nhuận', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp5->id, 'address' => '200 Lý Thường Kiệt, Phường 14'],
      ['district' => 'Quận 10', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    // ================================================================
    //  SEED BANNERS
    // ================================================================

    Banner::updateOrCreate(
      ['title' => 'Giảm 20% dịch vụ dọn nhà'],
      [
        'image' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
        'link' => '/#/dich-vu',
        'status' => 'active',
        'created_by' => 1,
      ]
    );

    Banner::updateOrCreate(
      ['title' => 'Chăm sóc người thân yêu'],
      [
        'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1200&auto=format&fit=crop',
        'link' => '/#/dich-vu',
        'status' => 'active',
        'created_by' => 1,
      ]
    );

    Banner::updateOrCreate(
      ['title' => 'Sửa chữa tại nhà nhanh chóng'],
      [
        'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
        'link' => '/#/dich-vu',
        'status' => 'active',
        'created_by' => 1,
      ]
    );

    // ================================================================
    //  SEED ACTIVITY LOGS
    // ================================================================

    ActivityLog::updateOrCreate(
      ['user_id' => 1, 'action' => 'seed_init'],
      ['description' => 'Hệ thống khởi tạo dữ liệu mẫu cho tất cả các microservice.']
    );

    ActivityLog::updateOrCreate(
      ['user_id' => 4, 'action' => 'booking_created'],
      ['description' => 'Khách hàng A đặt dịch vụ dọn nhà sâu tại Quận 1.']
    );

    ActivityLog::updateOrCreate(
      ['user_id' => 14, 'action' => 'job_post_created'],
      ['description' => 'Nguyễn Văn Nam đăng bài tuyển người chăm sóc bà cụ.']
    );

    // Seed News Articles
    $this->call(NewsSeeder::class);
  }
}
