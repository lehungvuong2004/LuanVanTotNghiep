<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class RoleAndPermPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'roles.view', 'module' => 'roles', 'description' => 'Xem danh sách vai trò'],
    ['name' => 'roles.create', 'module' => 'roles', 'description' => 'Thêm mới vai trò'],
    ['name' => 'roles.update', 'module' => 'roles', 'description' => 'Cập nhật vai trò & quyền hạn'],
    ['name' => 'roles.delete', 'module' => 'roles', 'description' => 'Xóa vai trò hệ thống'],
    ['name' => 'permissions.view', 'module' => 'permissions', 'description' => 'Xem danh sách quyền hạn'],
    ['name' => 'permissions.create', 'module' => 'permissions', 'description' => 'Tạo quyền hạn mới'],
    ['name' => 'permissions.update', 'module' => 'permissions', 'description' => 'Chỉnh sửa quyền hạn'],
    ['name' => 'permissions.delete', 'module' => 'permissions', 'description' => 'Xóa quyền hạn'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
