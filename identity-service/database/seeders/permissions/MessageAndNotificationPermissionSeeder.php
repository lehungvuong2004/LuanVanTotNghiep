<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class MessageAndNotificationPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'messages.view', 'module' => 'messages', 'description' => 'Xem danh sách tin nhắn'],
    ['name' => 'messages.send', 'module' => 'messages', 'description' => 'Gửi tin nhắn trong hệ thống'],
    ['name' => 'messages.delete', 'module' => 'messages', 'description' => 'Xóa tin nhắn hội thoại'],
    ['name' => 'notifications.view', 'module' => 'notifications', 'description' => 'Xem thông báo hệ thống'],
    ['name' => 'notifications.send', 'module' => 'notifications', 'description' => 'Gửi thông báo broadcast hệ thống'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
