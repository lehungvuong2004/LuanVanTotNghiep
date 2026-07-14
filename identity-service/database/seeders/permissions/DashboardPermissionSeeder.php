<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class DashboardPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'dashboard.view', 'module' => 'dashboard', 'description' => 'Xem thống kê & báo cáo tổng quan'],
    ['name' => 'activity_logs.view', 'module' => 'system', 'description' => 'Xem lịch sử hoạt động toàn bộ hệ thống'],
    ['name' => 'statistics.view', 'module' => 'system', 'description' => 'Xem báo cáo doanh số & thống kê cao cấp'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
