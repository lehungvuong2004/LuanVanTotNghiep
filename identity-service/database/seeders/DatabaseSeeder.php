<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $adminPass = env('SEED_ADMIN_PASSWORD');
        $customerPass = env('SEED_CUSTOMER_PASSWORD');
        $helperPass = env('SEED_HELPER_PASSWORD');
        $operatorPass = env('SEED_OPERATOR_PASSWORD');

        $adminPhone = env('SEED_ADMIN_PHONE', '0901234567');
        $operatorPhone = env('SEED_OPERATOR_PHONE', '0904567890');
        $helperPhone = env('SEED_HELPER_PHONE', '0903456789');
        $customerPhone = env('SEED_CUSTOMER_PHONE', '0902345678');

        if (!$adminPass || !$customerPass || !$helperPass || !$operatorPass) {
            throw new \Exception("Vui lòng cấu hình đầy đủ SEED_ADMIN_PASSWORD, SEED_CUSTOMER_PASSWORD, SEED_HELPER_PASSWORD, SEED_OPERATOR_PASSWORD trong file .env trước khi chạy Seed.");
        }

        // Seed Admin Account (role_id = 1)
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'role_id' => 1,
                'full_name' => 'Quản trị viên',
                'phone' => $adminPhone,
                'password' => Hash::make($adminPass),
                'status' => 'active',
            ]
        );

        // Seed Operator Account (role_id = 2)
        User::updateOrCreate(
            ['email' => 'operator@gmail.com'],
            [
                'role_id' => 2,
                'full_name' => 'Nhân viên vận hành C',
                'phone' => $operatorPhone,
                'password' => Hash::make($operatorPass),
                'status' => 'active',
            ]
        );

        // Seed Helper Account (role_id = 3)
        User::updateOrCreate(
            ['email' => 'helper@gmail.com'],
            [
                'role_id' => 3,
                'full_name' => 'Người giúp việc B',
                'phone' => $helperPhone,
                'password' => Hash::make($helperPass),
                'status' => 'active',
            ]
        );

        // Seed Customer Account (role_id = 4)
        User::updateOrCreate(
            ['email' => 'customer@gmail.com'],
            [
                'role_id' => 4,
                'full_name' => 'Khách hàng A',
                'phone' => $customerPhone,
                'password' => Hash::make($customerPass),
                'status' => 'active',
            ]
        );
    }
}
