<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class NewsAndBannerPermissionSeeder extends Seeder
{
  public static array $permissions = [
    ['name' => 'news.view', 'module' => 'news', 'description' => 'Xem tin tức sự kiện'],
    ['name' => 'news.create', 'module' => 'news', 'description' => 'Đăng tải bài viết tin tức mới'],
    ['name' => 'news.update', 'module' => 'news', 'description' => 'Chỉnh sửa bài viết tin tức'],
    ['name' => 'news.delete', 'module' => 'news', 'description' => 'Xóa bài viết tin tức'],
    ['name' => 'banners.view', 'module' => 'banners', 'description' => 'Xem danh sách banners quảng cáo'],
    ['name' => 'banners.create', 'module' => 'banners', 'description' => 'Thêm mới banner quảng cáo'],
    ['name' => 'banners.update', 'module' => 'banners', 'description' => 'Cập nhật banner quảng cáo'],
    ['name' => 'banners.delete', 'module' => 'banners', 'description' => 'Xóa banner quảng cáo'],
  ];

  public function run(): void
  {
    foreach (self::$permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }
  }
}
