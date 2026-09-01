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
use App\Models\City;
use App\Models\District;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    // 1. Seed Service Categories (5 records: Cleaning, Repair, Care, Gardening, Assembly)
    $cleaning = ServiceCategory::updateOrCreate(
      ['name' => 'Cleaning'],
      [
        'description' => 'Professional home cleaning services',
        'icon'        => 'material-symbols:cleaning-services-outline',
        'type'        => 'both',
        'status'      => 'active',
      ]
    );

    $repair = ServiceCategory::updateOrCreate(
      ['name' => 'Repair'],
      [
        'description' => 'Fixing home appliances and hardware',
        'icon'        => 'material-symbols:handyman-outline-rounded',
        'type'        => 'both',
        'status'      => 'active',
      ]
    );

    $care = ServiceCategory::updateOrCreate(
      ['name' => 'Care'],
      [
        'description' => 'Elderly and child care services',
        'icon'        => 'material-symbols:elderly-outline',
        'type'        => 'both',
        'status'      => 'active',
      ]
    );

    $assembly = ServiceCategory::updateOrCreate(
      ['name' => 'Assembly'],
      [
        'description' => 'Furniture assembly and household handyman tasks',
        'icon'        => 'material-symbols:build-circle-outline',
        'type'        => 'both',
        'status'      => 'active',
      ]
    );

    $gardening = ServiceCategory::updateOrCreate(
      ['name' => 'Gardening'],
      [
        'description' => 'Lawn care, plant pruning and landscaping services',
        'icon'        => 'material-symbols:park-outline',
        'type'        => 'both',
        'status'      => 'active',
      ]
    );

    // 2. Seed Services (4 records)
    $deepCleaning = Service::updateOrCreate(
      ['name' => 'Deep Home Cleaning'],
      [
        'category_id' => $cleaning->id,
        'description' => 'Detailed and thorough cleaning of your entire house.',
        'base_price'  => 500000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $sofaCleaning = Service::updateOrCreate(
      ['name' => 'Standard Sofa Cleaning'],
      [
        'category_id' => $cleaning->id,
        'description' => 'Remove stains and dirt from sofas and armchairs.',
        'base_price'  => 350000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $acRepair = Service::updateOrCreate(
      ['name' => 'Air Conditioner Repair'],
      [
        'category_id' => $repair->id,
        'description' => 'Maintenance and quick repair of AC units.',
        'base_price'  => 250000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $elderlyCare = Service::updateOrCreate(
      ['name' => 'Elderly Care (Basic)'],
      [
        'category_id' => $care->id,
        'description' => 'Basic care and companionship for elderly people.',
        'base_price'  => 150000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $petGrooming = Service::updateOrCreate(
      ['name' => 'Pet Grooming'],
      [
        'category_id' => $care->id,
        'description' => 'Professional pet grooming and hygiene maintenance at home.',
        'base_price'  => 200000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $childcare = Service::updateOrCreate(
      ['name' => 'Weekday Childcare'],
      [
        'category_id' => $care->id,
        'description' => 'Reliable child supervision and nursery support during weekdays.',
        'base_price'  => 120000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    // New Services
    $officeCleaning = Service::updateOrCreate(
      ['name' => 'Office & Store Cleaning'],
      [
        'category_id' => $cleaning->id,
        'description' => 'Deep cleaning of offices, retail stores, or small workspaces.',
        'base_price'  => 800000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $postConstCleaning = Service::updateOrCreate(
      ['name' => 'Post-Construction Cleaning'],
      [
        'category_id' => $cleaning->id,
        'description' => 'Clean up dust, paint stains, and debris after building construction or renovation.',
        'base_price'  => 1500000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $elecInst = Service::updateOrCreate(
      ['name' => 'Electrical Device Installation'],
      [
        'category_id' => $repair->id,
        'description' => 'Installing lights, ceiling fans, sockets, or smart home devices.',
        'base_price'  => 200000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $plumbRepair = Service::updateOrCreate(
      ['name' => 'Plumbing Repair & Leak Fixing'],
      [
        'category_id' => $repair->id,
        'description' => 'Fixing sink leaks, kitchen faucets, toilet installation, and minor pipe repairs.',
        'base_price'  => 180000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1542013936693-8848e5744a83?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $babyCare = Service::updateOrCreate(
      ['name' => 'Baby & Infant Care'],
      [
        'category_id' => $care->id,
        'description' => 'Caring for baby infants, feeding, diapering, bathing, and putting to sleep.',
        'base_price'  => 150000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $patientCare = Service::updateOrCreate(
      ['name' => 'Patient Care at Hospital & Home'],
      [
        'category_id' => $care->id,
        'description' => 'Support for patients recovering from surgery, illness, or medical treatment.',
        'base_price'  => 220000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $furAssembly = Service::updateOrCreate(
      ['name' => 'Furniture Assembly'],
      [
        'category_id' => $assembly->id,
        'description' => 'Assemble wardrobes, desks, drawers, or bookshelf units.',
        'base_price'  => 300000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $wallMount = Service::updateOrCreate(
      ['name' => 'Wall Mounting Services'],
      [
        'category_id' => $assembly->id,
        'description' => 'Hang televisions, picture frames, large paintings, shelves, or mirrors securely.',
        'base_price'  => 150000,
        'price_type'  => 'fixed',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $lawnMowing = Service::updateOrCreate(
      ['name' => 'Lawn Mowing & Weeding'],
      [
        'category_id' => $gardening->id,
        'description' => 'Trimming overgrown grass and clearing weed from gardens or backyards.',
        'base_price'  => 100000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    $treePruning = Service::updateOrCreate(
      ['name' => 'Tree Pruning & Shrub Trimming'],
      [
        'category_id' => $gardening->id,
        'description' => 'Pruning overgrown tree branches and trimming hedge bushes to stay neat.',
        'base_price'  => 120000,
        'price_type'  => 'hourly',
        'status'      => 'active',
        'image'       => 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200&auto=format&fit=crop',
      ]
    );

    // 3. Seed Helper Profiles (5 records)
    // helper1: user_id=3  (helper@gmail.com — Người giúp việc B)
    $helper1 = HelperProfile::updateOrCreate(
      ['user_id' => 3],
      [
        'bio'             => 'Chuyên gia dọn dẹp nhà cửa với 5 năm kinh nghiệm tại các căn hộ cao cấp. Tỉ mỉ, cẩn thận và đáng tin cậy.',
        'experience_year' => 5,
        'gender'          => 'female',
        'birthday'        => '1995-05-12',
        'address'         => '123 Nguyễn Huệ, Quận 1, TP.HCM',
        'status'          => 'active',
        'rating_avg'      => 4.80,
        'total_reviews'   => 15,
      ]
    );

    // helper2: user_id=10 (helper2@gmail.com — Nguyễn Thị Hoa)
    $helper2 = HelperProfile::updateOrCreate(
      ['user_id' => 10],
      [
        'bio'             => 'Kỹ thuật viên điều hòa và sửa chữa điện gia dụng 8 năm kinh nghiệm. Làm việc nhanh, uy tín, bảo hành công trình.',
        'experience_year' => 8,
        'gender'          => 'male',
        'birthday'        => '1990-08-22',
        'address'         => '456 Lê Lợi, Quận 3, TP.HCM',
        'status'          => 'active',
        'rating_avg'      => 4.90,
        'total_reviews'   => 22,
      ]
    );

    // helper3: user_id=11 (helper3@gmail.com — Trần Văn Hùng)
    $helper3 = HelperProfile::updateOrCreate(
      ['user_id' => 11],
      [
        'bio'             => 'Nhân viên chăm sóc người cao tuổi, chuyên phục hồi sức khỏe tại nhà. Tốt nghiệp ngành điều dưỡng, kinh nghiệm 6 năm.',
        'experience_year' => 6,
        'gender'          => 'male',
        'birthday'        => '1992-03-15',
        'address'         => '789 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        'status'          => 'active',
        'rating_avg'      => 4.70,
        'total_reviews'   => 18,
      ]
    );

    // helper4: user_id=12 (helper4@gmail.com — Phạm Thanh Sơn)
    $helper4 = HelperProfile::updateOrCreate(
      ['user_id' => 12],
      [
        'bio'             => 'Chuyên dọn dẹp vệ sinh công nghiệp, nhà mới, văn phòng. Làm việc theo nhóm, trang bị đầy đủ máy móc hiện đại.',
        'experience_year' => 4,
        'gender'          => 'male',
        'birthday'        => '1997-11-08',
        'address'         => '55 Phan Xích Long, Phú Nhuận, TP.HCM',
        'status'          => 'active',
        'rating_avg'      => 4.60,
        'total_reviews'   => 10,
      ]
    );

    // helper5: user_id=13 (helper5@gmail.com — Lê Thị Mai)
    $helper5 = HelperProfile::updateOrCreate(
      ['user_id' => 13],
      [
        'bio'             => 'Giúp việc nhà toàn thời gian: nấu ăn, giặt ủi, chăm trẻ. Tận tụy, yêu trẻ, có chứng chỉ sơ cấp cứu.',
        'experience_year' => 3,
        'gender'          => 'female',
        'birthday'        => '1999-06-20',
        'address'         => '12 Nguyễn Đình Chiểu, Bình Thạnh, TP.HCM',
        'status'          => 'active',
        'rating_avg'      => 4.50,
        'total_reviews'   => 8,
      ]
    );

    // Seed cities and districts
    $cityHcm = City::updateOrCreate(['name' => 'TP.HCM']);
    $districtsData = [
      'Quận 1',
      'Quận 3',
      'Quận 4',
      'Quận 5',
      'Quận 6',
      'Quận 7',
      'Quận 8',
      'Quận 10',
      'Quận 11',
      'Quận 12',
      'Bình Thạnh',
      'Phú Nhuận',
      'Gò Vấp',
      'Tân Bình',
      'Tân Phú',
      'Bình Tân',
      'Thủ Đức',
      'Bình Chánh',
      'Hóc Môn',
      'Nhà Bè',
      'Củ Chi',
      'Cần Giờ',
    ];
    $districtsMap = [];
    foreach ($districtsData as $dName) {
      $d = District::updateOrCreate([
        'city_id' => $cityHcm->id,
        'name' => $dName
      ]);
      $districtsMap[$dName] = $d->id;
    }

    // 4. Seed Helper Working Areas (TP.HCM districts)
    // helper1 — Quận 1, Quận 3
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper1->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Quận 1']], []);
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper1->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Quận 3']], []);

    // helper2 — Quận 3, Bình Thạnh
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper2->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Quận 3']], []);
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper2->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Bình Thạnh']], []);

    // helper3 — Quận 10, Phú Nhuận
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper3->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Quận 10']], []);
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper3->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Phú Nhuận']], []);

    // helper4 — Phú Nhuận, Quận 1
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper4->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Phú Nhuận']], []);
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper4->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Quận 1']], []);

    // helper5 — Bình Thạnh, Quận 10
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper5->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Bình Thạnh']], []);
    HelperWorkingArea::updateOrCreate(['helper_id' => $helper5->id, 'city_id' => $cityHcm->id, 'district_id' => $districtsMap['Quận 10']], []);

    // 5. Seed Helper Verifications (all approved)
    HelperVerification::updateOrCreate(
      ['helper_id' => $helper1->id],
      ['admin_id' => 1, 'status' => 'approved', 'note' => 'Đã xác minh đầy đủ giấy tờ và kinh nghiệm.']
    );
    HelperVerification::updateOrCreate(
      ['helper_id' => $helper2->id],
      ['admin_id' => 1, 'status' => 'approved', 'note' => 'Kinh nghiệm và chứng chỉ kỹ thuật đã được xác nhận.']
    );
    HelperVerification::updateOrCreate(
      ['helper_id' => $helper3->id],
      ['admin_id' => 1, 'status' => 'approved', 'note' => 'Bằng điều dưỡng và giấy tờ cá nhân hợp lệ.']
    );
    HelperVerification::updateOrCreate(
      ['helper_id' => $helper4->id],
      ['admin_id' => 1, 'status' => 'approved', 'note' => 'Hồ sơ và kinh nghiệm thực tế đã được kiểm tra.']
    );
    HelperVerification::updateOrCreate(
      ['helper_id' => $helper5->id],
      ['admin_id' => 1, 'status' => 'approved', 'note' => 'Chứng chỉ sơ cấp cứu và hồ sơ đã xác minh.']
    );

    // 6. Seed Helper Skills
    // helper1: Dọn nhà sâu, Sofa, Pet Grooming
    HelperSkill::updateOrCreate(['helper_id' => $helper1->id, 'service_id' => $deepCleaning->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper1->id, 'service_id' => $sofaCleaning->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper1->id, 'service_id' => $petGrooming->id],    []);
 
    // helper2: Điều hòa, Chăm sóc người già, Childcare
    HelperSkill::updateOrCreate(['helper_id' => $helper2->id, 'service_id' => $acRepair->id],    []);
    HelperSkill::updateOrCreate(['helper_id' => $helper2->id, 'service_id' => $elderlyCare->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper2->id, 'service_id' => $childcare->id],   []);

    // helper3: Chăm sóc người già, Dọn nhà sâu
    HelperSkill::updateOrCreate(['helper_id' => $helper3->id, 'service_id' => $elderlyCare->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper3->id, 'service_id' => $deepCleaning->id], []);

    // helper4: Dọn nhà sâu, Sofa, Điều hòa
    HelperSkill::updateOrCreate(['helper_id' => $helper4->id, 'service_id' => $deepCleaning->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper4->id, 'service_id' => $sofaCleaning->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper4->id, 'service_id' => $acRepair->id],    []);

    // helper5: Chăm sóc người già, Dọn nhà sâu
    HelperSkill::updateOrCreate(['helper_id' => $helper5->id, 'service_id' => $elderlyCare->id], []);
    HelperSkill::updateOrCreate(['helper_id' => $helper5->id, 'service_id' => $deepCleaning->id], []);

    // 7. Seed Helper Availabilities (ngày trong tương lai)
    $day1 = date('Y-m-d', strtotime('+1 day'));
    $day2 = date('Y-m-d', strtotime('+2 days'));
    $day3 = date('Y-m-d', strtotime('+3 days'));
    $day4 = date('Y-m-d', strtotime('+4 days'));
    $day5 = date('Y-m-d', strtotime('+5 days'));

    // helper1
    HelperAvailability::updateOrCreate(['helper_id' => $helper1->id, 'available_date' => $day1, 'start_time' => '08:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper1->id, 'available_date' => $day1, 'start_time' => '13:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper1->id, 'available_date' => $day3, 'start_time' => '08:00:00'], ['status' => 'available']);

    // helper2
    HelperAvailability::updateOrCreate(['helper_id' => $helper2->id, 'available_date' => $day2, 'start_time' => '09:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper2->id, 'available_date' => $day2, 'start_time' => '14:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper2->id, 'available_date' => $day4, 'start_time' => '09:00:00'], ['status' => 'available']);

    // helper3
    HelperAvailability::updateOrCreate(['helper_id' => $helper3->id, 'available_date' => $day1, 'start_time' => '07:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper3->id, 'available_date' => $day3, 'start_time' => '13:00:00'], ['status' => 'available']);

    // helper4
    HelperAvailability::updateOrCreate(['helper_id' => $helper4->id, 'available_date' => $day2, 'start_time' => '08:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper4->id, 'available_date' => $day5, 'start_time' => '10:00:00'], ['status' => 'available']);

    // helper5
    HelperAvailability::updateOrCreate(['helper_id' => $helper5->id, 'available_date' => $day3, 'start_time' => '08:00:00'], ['status' => 'available']);
    HelperAvailability::updateOrCreate(['helper_id' => $helper5->id, 'available_date' => $day5, 'start_time' => '13:00:00'], ['status' => 'available']);

    // 8. Seed Favorites (customer_id=4 yêu thích helper1 và helper2)
    Favorite::updateOrCreate(['customer_id' => 4, 'helper_id' => $helper1->id], []);
    Favorite::updateOrCreate(['customer_id' => 4, 'helper_id' => $helper2->id], []);
  }
}
