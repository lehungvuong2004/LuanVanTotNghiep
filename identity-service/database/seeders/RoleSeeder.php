<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->upsert([
            ['id' => 1, 'name' => 'admin', 'description' => 'Quản trị viên'],
            ['id' => 2, 'name' => 'customer', 'description' => 'Khách hàng'],
            ['id' => 3, 'name' => 'helper', 'description' => 'Người giúp việc'],
            ['id' => 4, 'name' => 'operator', 'description' => 'Nhân viên vận hành'],
        ], ['id'], ['name', 'description']);
    }
}
