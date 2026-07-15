<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PaymentAndRefundPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'payments.view', 'module' => 'payments', 'description' => 'Xem thông tin giao dịch & doanh thu'],
    ['name' => 'payments.pay', 'module' => 'payments', 'description' => 'Thực hiện thanh toán online'],
    ['name' => 'payments.history', 'module' => 'payments', 'description' => 'Xem lịch sử giao dịch thanh toán'],
    ['name' => 'refunds.view', 'module' => 'refunds', 'description' => 'Xem yêu cầu hoàn tiền'],
    ['name' => 'refunds.process', 'module' => 'refunds', 'description' => 'Xem xét lý do hoàn tiền'],
    ['name' => 'refunds.approve', 'module' => 'refunds', 'description' => 'Duyệt hoàn tiền cho khách hàng'],
    ['name' => 'refunds.reject', 'module' => 'refunds', 'description' => 'Từ chối yêu cầu hoàn tiền'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
