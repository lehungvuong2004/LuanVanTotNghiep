<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class JobPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'job_posts.view', 'module' => 'job_posts', 'description' => 'Xem tin tuyển dụng'],
    ['name' => 'job_posts.create', 'module' => 'job_posts', 'description' => 'Đăng tin tuyển dụng mới'],
    ['name' => 'job_posts.update', 'module' => 'job_posts', 'description' => 'Chỉnh sửa tin tuyển dụng'],
    ['name' => 'job_posts.delete', 'module' => 'job_posts', 'description' => 'Xóa tin tuyển dụng'],
    ['name' => 'job_posts.approve', 'module' => 'job_posts', 'description' => 'Duyệt bài đăng tuyển dụng'],
    ['name' => 'job_posts.reject', 'module' => 'job_posts', 'description' => 'Từ chối duyệt bài đăng tuyển dụng'],
    ['name' => 'job_posts.hide', 'module' => 'job_posts', 'description' => 'Ẩn bài đăng tuyển dụng'],
    ['name' => 'job_applications.view', 'module' => 'job_applications', 'description' => 'Xem đơn ứng tuyển công việc'],
    ['name' => 'job_applications.create', 'module' => 'job_applications', 'description' => 'Nộp đơn ứng tuyển công việc'],
    ['name' => 'job_applications.update', 'module' => 'job_applications', 'description' => 'Cập nhật trạng thái đơn ứng tuyển'],
    ['name' => 'job_applications.cancel', 'module' => 'job_applications', 'description' => 'Hủy bỏ đơn ứng tuyển'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
