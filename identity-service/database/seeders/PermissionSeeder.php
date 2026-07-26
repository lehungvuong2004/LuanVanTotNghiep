<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use Database\Seeders\Permissions\DashboardPermissionSeeder;
use Database\Seeders\Permissions\UserPermissionSeeder;
use Database\Seeders\Permissions\RoleAndPermPermissionSeeder;
use Database\Seeders\Permissions\CustomerPermissionSeeder;
use Database\Seeders\Permissions\HelperPermissionSeeder;
use Database\Seeders\Permissions\BookingPermissionSeeder;
use Database\Seeders\Permissions\JobPermissionSeeder;
use Database\Seeders\Permissions\ReviewAndReportPermissionSeeder;
use Database\Seeders\Permissions\ContactPermissionSeeder;
use Database\Seeders\Permissions\PaymentAndRefundPermissionSeeder;
use Database\Seeders\Permissions\MessageAndNotificationPermissionSeeder;
use Database\Seeders\Permissions\NewsAndBannerPermissionSeeder;
use Database\Seeders\Permissions\ServicePermissionSeeder;
use Database\Seeders\Permissions\ChatbotPermissionSeeder;

class PermissionSeeder extends Seeder
{
  /**
   * Sub-seeders containing modular permission definitions
   */
  protected array $seeders = [
    DashboardPermissionSeeder::class,
    UserPermissionSeeder::class,
    RoleAndPermPermissionSeeder::class,
    CustomerPermissionSeeder::class,
    HelperPermissionSeeder::class,
    BookingPermissionSeeder::class,
    JobPermissionSeeder::class,
    ReviewAndReportPermissionSeeder::class,
    ContactPermissionSeeder::class,
    PaymentAndRefundPermissionSeeder::class,
    MessageAndNotificationPermissionSeeder::class,
    NewsAndBannerPermissionSeeder::class,
    ServicePermissionSeeder::class,
    ChatbotPermissionSeeder::class,
  ];

  public function run(): void
  {
    $allNames = [];
    foreach ($this->seeders as $seeder) {
      $allNames = array_merge($allNames, array_column($seeder::$permissions, 'name'));
    }

    // 2. Clean up old permissions in the database not present in the code definitions
    Permission::whereNotIn('name', $allNames)->delete();

    // 3. Execute each sub-seeder to update or insert permission records
    $this->call($this->seeders);
  }
}
