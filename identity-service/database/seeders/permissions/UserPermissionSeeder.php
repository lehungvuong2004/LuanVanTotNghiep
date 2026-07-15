<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class UserPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'users.view', 'module' => 'users', 'description' => 'Xem danh sách & thông tin người dùng'],
    ['name' => 'users.create', 'module' => 'users', 'description' => 'Thêm mới người dùng'],
    ['name' => 'users.update', 'module' => 'users', 'description' => 'Chỉnh sửa thông tin người dùng'],
    ['name' => 'users.delete', 'module' => 'users', 'description' => 'Xóa tài khoản người dùng'],
    ['name' => 'users.lock', 'module' => 'users', 'description' => 'Khóa tài khoản người dùng'],
    ['name' => 'users.unlock', 'module' => 'users', 'description' => 'Mở khóa tài khoản người dùng'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
