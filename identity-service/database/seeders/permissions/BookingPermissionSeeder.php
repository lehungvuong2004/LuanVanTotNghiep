<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class BookingPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'bookings.view', 'module' => 'bookings', 'description' => 'Xem thông tin đặt lịch'],
    ['name' => 'bookings.create', 'module' => 'bookings', 'description' => 'Tạo mới đơn đặt lịch'],
    ['name' => 'bookings.update_status', 'module' => 'bookings', 'description' => 'Cập nhật trạng thái đơn đặt lịch'],
    ['name' => 'bookings.cancel', 'module' => 'bookings', 'description' => 'Hủy bỏ đơn đặt lịch'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
