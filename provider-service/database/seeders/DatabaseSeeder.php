<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;
use App\Models\Service;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Service Categories
        $cleaning = ServiceCategory::updateOrCreate(
            ['name' => 'Cleaning'],
            [
                'description' => 'Professional home cleaning services',
                'icon' => 'material-symbols:cleaning-services-outline',
                'type' => 'both',
                'status' => 'active'
            ]
        );

        $repair = ServiceCategory::updateOrCreate(
            ['name' => 'Repair'],
            [
                'description' => 'Fixing home appliances and hardware',
                'icon' => 'material-symbols:handyman-outline-rounded',
                'type' => 'both',
                'status' => 'active'
            ]
        );

        $care = ServiceCategory::updateOrCreate(
            ['name' => 'Care'],
            [
                'description' => 'Elderly and child care services',
                'icon' => 'material-symbols:elderly-outline',
                'type' => 'both',
                'status' => 'active'
            ]
        );

        // 2. Seed Services
        Service::updateOrCreate(
            ['name' => 'Deep Home Cleaning'],
            [
                'category_id' => $cleaning->id,
                'description' => 'Detailed and thorough cleaning of your entire house.',
                'base_price' => 500000,
                'price_type' => 'fixed',
                'status' => 'active'
            ]
        );

        Service::updateOrCreate(
            ['name' => 'Standard Sofa Cleaning'],
            [
                'category_id' => $cleaning->id,
                'description' => 'Remove stains and dirt from sofas and armchairs.',
                'base_price' => 350000,
                'price_type' => 'fixed',
                'status' => 'active'
            ]
        );

        Service::updateOrCreate(
            ['name' => 'Air Conditioner Repair'],
            [
                'category_id' => $repair->id,
                'description' => 'Maintenance and quick repair of AC units.',
                'base_price' => 250000,
                'price_type' => 'hourly',
                'status' => 'active'
            ]
        );

        Service::updateOrCreate(
            ['name' => 'Elderly Care (Basic)'],
            [
                'category_id' => $care->id,
                'description' => 'Basic care and companionship for elderly people.',
                'base_price' => 150000,
                'price_type' => 'hourly',
                'status' => 'active'
            ]
        );
    }
}
