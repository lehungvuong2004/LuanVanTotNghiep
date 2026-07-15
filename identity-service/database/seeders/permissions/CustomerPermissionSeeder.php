<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class CustomerPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'customer_profile.view', 'module' => 'customer_profile', 'description' => 'Xem hồ sơ khách hàng'],
    ['name' => 'customer_profile.create', 'module' => 'customer_profile', 'description' => 'Tạo hồ sơ khách hàng'],
    ['name' => 'customer_profile.update', 'module' => 'customer_profile', 'description' => 'Cập nhật hồ sơ khách hàng'],
    ['name' => 'customer_profile.delete', 'module' => 'customer_profile', 'description' => 'Xóa hồ sơ khách hàng'],
    ['name' => 'customer_addresses.view', 'module' => 'customer_addresses', 'description' => 'Xem sổ địa chỉ khách hàng'],
    ['name' => 'customer_addresses.create', 'module' => 'customer_addresses', 'description' => 'Thêm địa chỉ mới'],
    ['name' => 'customer_addresses.update', 'module' => 'customer_addresses', 'description' => 'Sửa địa chỉ khách hàng'],
    ['name' => 'customer_addresses.delete', 'module' => 'customer_addresses', 'description' => 'Xóa địa chỉ khách hàng'],
    ['name' => 'favorites.view', 'module' => 'favorites', 'description' => 'Xem danh sách yêu thích'],
    ['name' => 'favorites.update', 'module' => 'favorites', 'description' => 'Cập nhật danh sách yêu thích'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
