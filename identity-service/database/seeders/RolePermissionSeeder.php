<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
  public function run(): void
  {
    $this->syncAdmin();
    $this->syncOperator();
    $this->syncHelper();
    $this->syncCustomer();
  }

  /**
   * Assign all available permissions to the Admin role.
   */
  private function syncAdmin(): void
  {
    $adminRole = Role::where('name', 'ADMIN')->first();
    if ($adminRole) {
      $allPermIds = Permission::pluck('id')->toArray();
      $adminRole->permissions()->sync($allPermIds);
    }
  }

  /**
   * Assign operator-specific permissions.
   */
  private function syncOperator(): void
  {
    $operatorRole = Role::where('name', 'OPERATOR')->first();
    if (!$operatorRole) {
      return;
    }

    $operatorPerms = [
      'users.view',
      'helper_profile.verify',
      'job_posts.view',
      'job_posts.approve',
      'job_posts.reject',
      'job_posts.hide',
      'services.view',
      'services.update_status',
      'bookings.view',
      'bookings.update_status',
      'contacts.view',
      'contacts.process',
      'reports.process',
      'refunds.process',
      'reviews.view',
      'payments.history',
      'messages.view',
      'messages.send',
      'messages.delete',
      'notifications.view',
      'chatbot_knowledge.view',
      'chatbot_knowledge.create',
      'chatbot_knowledge.update',
      'chatbot_knowledge.delete'
    ];

    $operatorPermIds = Permission::whereIn('name', $operatorPerms)->pluck('id')->toArray();
    $operatorRole->permissions()->sync($operatorPermIds);
  }

  /**
   * Assign helper-specific permissions.
   */
  private function syncHelper(): void
  {
    $helperRole = Role::where('name', 'HELPER')->first();
    if (!$helperRole) {
      return;
    }

    $helperPerms = [
      'helper_profile.view',
      'helper_profile.create',
      'helper_profile.update',
      'helper_profile.delete',
      'working_areas.view',
      'working_areas.create',
      'working_areas.update',
      'working_areas.delete',
      'skills.view',
      'skills.create',
      'skills.update',
      'skills.delete',
      'availabilities.view',
      'availabilities.create',
      'availabilities.update',
      'availabilities.delete',
      'job_applications.view',
      'job_applications.create',
      'job_applications.update',
      'job_applications.cancel',
      'bookings.view',
      'bookings.update_status',
      'work_logs.checkin',
      'work_logs.checkout',
      'messages.view',
      'messages.send',
      'messages.delete',
      'reviews.view',
      'payments.history',
      'notifications.view'
    ];

    $helperPermIds = Permission::whereIn('name', $helperPerms)->pluck('id')->toArray();
    $helperRole->permissions()->sync($helperPermIds);
  }

  /**
   * Assign customer-specific permissions.
   */
  private function syncCustomer(): void
  {
    $customerRole = Role::where('name', 'CUSTOMER')->first();
    if (!$customerRole) {
      return;
    }

    $customerPerms = [
      'customer_profile.view',
      'customer_profile.create',
      'customer_profile.update',
      'customer_profile.delete',
      'customer_addresses.view',
      'customer_addresses.create',
      'customer_addresses.update',
      'customer_addresses.delete',
      'bookings.view',
      'bookings.create',
      'bookings.cancel',
      'job_posts.view',
      'job_posts.create',
      'job_posts.update',
      'job_posts.delete',
      'favorites.view',
      'favorites.update',
      'reviews.view',
      'reviews.create',
      'reviews.update',
      'reports.create',
      'payments.pay',
      'payments.history',
      'messages.view',
      'messages.send',
      'messages.delete',
      'notifications.view'
    ];

    $customerPermIds = Permission::whereIn('name', $customerPerms)->pluck('id')->toArray();
    $customerRole->permissions()->sync($customerPermIds);
  }
}
