<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class ReviewAndReportPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'reviews.view', 'module' => 'reviews', 'description' => 'Xem danh sách đánh giá'],
    ['name' => 'reviews.create', 'module' => 'reviews', 'description' => 'Viết đánh giá mới'],
    ['name' => 'reviews.update', 'module' => 'reviews', 'description' => 'Sửa bài đánh giá dịch vụ'],
    ['name' => 'reports.view', 'module' => 'reports', 'description' => 'Xem báo cáo vi phạm'],
    ['name' => 'reports.create', 'module' => 'reports', 'description' => 'Gửi báo cáo vi phạm'],
    ['name' => 'reports.process', 'module' => 'reports', 'description' => 'Xử lý báo cáo & khiếu nại'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
