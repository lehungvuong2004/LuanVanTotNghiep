<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class ServicePermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'categories.view', 'module' => 'categories', 'description' => 'Xem danh mục phân loại dịch vụ'],
    ['name' => 'categories.create', 'module' => 'categories', 'description' => 'Thêm danh mục phân loại dịch vụ'],
    ['name' => 'categories.update', 'module' => 'categories', 'description' => 'Sửa danh mục phân loại dịch vụ'],
    ['name' => 'categories.delete', 'module' => 'categories', 'description' => 'Xóa danh mục phân loại dịch vụ'],
    ['name' => 'services.view', 'module' => 'services', 'description' => 'Xem danh sách dịch vụ'],
    ['name' => 'services.create', 'module' => 'services', 'description' => 'Thêm mới dịch vụ của hệ thống'],
    ['name' => 'services.update', 'module' => 'services', 'description' => 'Chỉnh sửa dịch vụ hệ thống'],
    ['name' => 'services.delete', 'module' => 'services', 'description' => 'Xóa dịch vụ hệ thống'],
    ['name' => 'services.update_status', 'module' => 'services', 'description' => 'Cập nhật trạng thái hoạt động dịch vụ'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
