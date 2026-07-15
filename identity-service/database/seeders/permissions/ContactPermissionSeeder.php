<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class ContactPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'contacts.view', 'module' => 'contacts', 'description' => 'Xem danh sách liên hệ khách hàng'],
    ['name' => 'contacts.create', 'module' => 'contacts', 'description' => 'Gửi yêu cầu liên hệ mới'],
    ['name' => 'contacts.update', 'module' => 'contacts', 'description' => 'Cập nhật thông tin liên hệ'],
    ['name' => 'contacts.delete', 'module' => 'contacts', 'description' => 'Xóa liên hệ khách hàng'],
    ['name' => 'contacts.process', 'module' => 'contacts', 'description' => 'Xử lý phản hồi yêu cầu liên hệ'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
