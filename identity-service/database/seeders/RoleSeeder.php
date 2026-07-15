<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
  public function run(): void
  {
    $roles = [
      ['id' => 1, 'name' => 'admin', 'description' => 'Quản trị viên'],
      ['id' => 2, 'name' => 'operator', 'description' => 'Nhân viên vận hành'],
      ['id' => 3, 'name' => 'helper', 'description' => 'Người giúp việc'],
      ['id' => 4, 'name' => 'customer', 'description' => 'Khách hàng'],
    ];

    foreach ($roles as $role) {
      Role::updateOrCreate(
        ['name' => $role['name']],
        ['id' => $role['id'], 'description' => $role['description']]
      );
    }
  }
}
