<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\HelperProfile;
use App\Models\HelperWorkingArea;
use App\Models\HelperVerification;
use App\Models\HelperSkill;
use App\Models\HelperAvailability;
use App\Models\Favorite;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Service Categories (3 records: Cleaning, Repair, Care)
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

        // 2. Seed Services (4 records)
        $deepCleaning = Service::updateOrCreate(
            ['name' => 'Deep Home Cleaning'],
            [
                'category_id' => $cleaning->id,
                'description' => 'Detailed and thorough cleaning of your entire house.',
                'base_price' => 500000,
                'price_type' => 'fixed',
                'status' => 'active'
            ]
        );

        $sofaCleaning = Service::updateOrCreate(
            ['name' => 'Standard Sofa Cleaning'],
            [
                'category_id' => $cleaning->id,
                'description' => 'Remove stains and dirt from sofas and armchairs.',
                'base_price' => 350000,
                'price_type' => 'fixed',
                'status' => 'active'
            ]
        );

        $acRepair = Service::updateOrCreate(
            ['name' => 'Air Conditioner Repair'],
            [
                'category_id' => $repair->id,
                'description' => 'Maintenance and quick repair of AC units.',
                'base_price' => 250000,
                'price_type' => 'hourly',
                'status' => 'active'
            ]
        );

        $elderlyCare = Service::updateOrCreate(
            ['name' => 'Elderly Care (Basic)'],
            [
                'category_id' => $care->id,
                'description' => 'Basic care and companionship for elderly people.',
                'base_price' => 150000,
                'price_type' => 'hourly',
                'status' => 'active'
            ]
        );

        // 3. Seed Helper Profiles (2 records, user_id=2 and user_id=3)
        $helper1 = HelperProfile::updateOrCreate(
            ['user_id' => 2],
            [
                'bio' => 'Professional cleaner with 5 years of experience in high-end apartments.',
                'experience_year' => 5,
                'gender' => 'female',
                'birthday' => '1995-05-12',
                'address' => '123 Nguyen Hue, District 1, HCMC',
                'status' => 'approved',
                'rating_avg' => 4.8,
                'total_reviews' => 15
            ]
        );

        $helper2 = HelperProfile::updateOrCreate(
            ['user_id' => 3],
            [
                'bio' => 'Experienced technician specializing in electrical work and AC maintenance.',
                'experience_year' => 8,
                'gender' => 'male',
                'birthday' => '1990-08-22',
                'address' => '456 Le Loi, District 3, HCMC',
                'status' => 'approved',
                'rating_avg' => 4.9,
                'total_reviews' => 22
            ]
        );

        // 4. Seed Helper Working Areas (2 records for each helper)
        HelperWorkingArea::updateOrCreate(
            ['helper_id' => $helper1->id, 'district' => 'District 1', 'city' => 'HCMC'],
            []
        );
        HelperWorkingArea::updateOrCreate(
            ['helper_id' => $helper1->id, 'district' => 'District 3', 'city' => 'HCMC'],
            []
        );
        HelperWorkingArea::updateOrCreate(
            ['helper_id' => $helper2->id, 'district' => 'District 3', 'city' => 'HCMC'],
            []
        );
        HelperWorkingArea::updateOrCreate(
            ['helper_id' => $helper2->id, 'district' => 'Binh Thanh District', 'city' => 'HCMC'],
            []
        );

        // 5. Seed Helper Verifications (2 records: one for helper1, one for helper2)
        HelperVerification::updateOrCreate(
            ['helper_id' => $helper1->id],
            [
                'admin_id' => 1,
                'status' => 'approved',
                'note' => 'All documents verified successfully.'
            ]
        );

        HelperVerification::updateOrCreate(
            ['helper_id' => $helper2->id],
            [
                'admin_id' => 1,
                'status' => 'approved',
                'note' => 'Work experience and certificate verified.'
            ]
        );

        // 6. Seed Helper Skills (at least 2 skills for each helper)
        HelperSkill::updateOrCreate(
            ['helper_id' => $helper1->id, 'service_id' => $deepCleaning->id],
            []
        );
        HelperSkill::updateOrCreate(
            ['helper_id' => $helper1->id, 'service_id' => $sofaCleaning->id],
            []
        );
        HelperSkill::updateOrCreate(
            ['helper_id' => $helper2->id, 'service_id' => $acRepair->id],
            []
        );
        HelperSkill::updateOrCreate(
            ['helper_id' => $helper2->id, 'service_id' => $elderlyCare->id],
            []
        );

        // 7. Seed Helper Availabilities (2 dates/times for each helper)
        HelperAvailability::updateOrCreate(
            [
                'helper_id' => $helper1->id,
                'available_date' => date('Y-m-d', strtotime('+1 day')),
                'start_time' => '08:00:00'
            ],
            ['status' => 'available']
        );
        HelperAvailability::updateOrCreate(
            [
                'helper_id' => $helper1->id,
                'available_date' => date('Y-m-d', strtotime('+1 day')),
                'start_time' => '13:00:00'
            ],
            ['status' => 'available']
        );

        HelperAvailability::updateOrCreate(
            [
                'helper_id' => $helper2->id,
                'available_date' => date('Y-m-d', strtotime('+2 days')),
                'start_time' => '09:00:00'
            ],
            ['status' => 'available']
        );
        HelperAvailability::updateOrCreate(
            [
                'helper_id' => $helper2->id,
                'available_date' => date('Y-m-d', strtotime('+2 days')),
                'start_time' => '14:00:00'
            ],
            ['status' => 'available']
        );

        // 8. Seed Favorites (2 records, customer_id=4 favoriting helper1 and helper2)
        Favorite::updateOrCreate(
            ['customer_id' => 4, 'helper_id' => $helper1->id],
            []
        );
        Favorite::updateOrCreate(
            ['customer_id' => 4, 'helper_id' => $helper2->id],
            []
        );
    }
}
