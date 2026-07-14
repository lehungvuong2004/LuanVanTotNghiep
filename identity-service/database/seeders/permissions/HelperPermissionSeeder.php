<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class HelperPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'helper_profile.view', 'module' => 'helper_profile', 'description' => 'Xem hồ sơ người giúp việc'],
    ['name' => 'helper_profile.create', 'module' => 'helper_profile', 'description' => 'Tạo hồ sơ người giúp việc'],
    ['name' => 'helper_profile.update', 'module' => 'helper_profile', 'description' => 'Sửa hồ sơ người giúp việc'],
    ['name' => 'helper_profile.delete', 'module' => 'helper_profile', 'description' => 'Xóa hồ sơ người giúp việc'],
    ['name' => 'helper_profile.lock', 'module' => 'helper_profile', 'description' => 'Khóa hồ sơ người giúp việc'],
    ['name' => 'helper_profile.unlock', 'module' => 'helper_profile', 'description' => 'Mở khóa hồ sơ người giúp việc'],
    ['name' => 'helper_profile.verify', 'module' => 'helper_profile', 'description' => 'Duyệt hồ sơ người giúp việc'],
    ['name' => 'working_areas.view', 'module' => 'working_areas', 'description' => 'Xem khu vực hoạt động của helper'],
    ['name' => 'working_areas.create', 'module' => 'working_areas', 'description' => 'Thêm khu vực hoạt động'],
    ['name' => 'working_areas.update', 'module' => 'working_areas', 'description' => 'Cập nhật khu vực hoạt động'],
    ['name' => 'working_areas.delete', 'module' => 'working_areas', 'description' => 'Xóa khu vực hoạt động'],
    ['name' => 'skills.view', 'module' => 'skills', 'description' => 'Xem danh sách kỹ năng'],
    ['name' => 'skills.create', 'module' => 'skills', 'description' => 'Thêm kỹ năng chuyên môn'],
    ['name' => 'skills.update', 'module' => 'skills', 'description' => 'Cập nhật kỹ năng chuyên môn'],
    ['name' => 'skills.delete', 'module' => 'skills', 'description' => 'Xóa kỹ năng chuyên môn'],
    ['name' => 'availabilities.view', 'module' => 'availabilities', 'description' => 'Xem lịch làm việc rảnh'],
    ['name' => 'availabilities.create', 'module' => 'availabilities', 'description' => 'Đăng ký lịch làm việc rảnh'],
    ['name' => 'availabilities.update', 'module' => 'availabilities', 'description' => 'Sửa lịch làm việc rảnh'],
    ['name' => 'availabilities.delete', 'module' => 'availabilities', 'description' => 'Xóa lịch làm việc rảnh'],
    ['name' => 'work_logs.checkin', 'module' => 'work_logs', 'description' => 'Check-in bắt đầu làm việc'],
    ['name' => 'work_logs.checkout', 'module' => 'work_logs', 'description' => 'Check-out hoàn thành công việc'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
