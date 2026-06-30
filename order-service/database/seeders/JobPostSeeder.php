<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobPost;
use App\Models\JobPostService;
use Carbon\Carbon;

class JobPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate tables
        JobPost::query()->delete();
        JobPostService::query()->delete();

        $posts = [
            [
                'customer_id' => 4,
                'category_id' => 3, // Care
                'title' => 'Tìm bảo mẫu trông bé 2 tuổi giờ hành chính',
                'description' => 'Gia đình cần tìm một cô bảo mẫu có kinh nghiệm, yêu trẻ, cẩn thận trông bé gái 2 tuổi từ thứ 2 đến thứ 6. Không yêu cầu làm việc nhà.',
                'salary' => 9000000,
                'address' => '101 Đường Tôn Dật Tiên',
                'district' => 'Quận 7',
                'city' => 'TP. Hồ Chí Minh',
                'working_time' => 'Thứ 2 - Thứ 6, 8:00 - 17:00',
                'status' => 'open',
                'expired_at' => Carbon::now()->addDays(15),
                'created_at' => Carbon::now()->subHours(2)
            ],
            [
                'customer_id' => 4,
                'category_id' => 1, // Cleaning
                'title' => 'Tuyển cô giúp việc bao ăn ở lại, nhà chung cư',
                'description' => 'Nhà chung cư 3 phòng ngủ cần cô giúp việc dọn dẹp, nấu ăn cơ bản. Yêu cầu sạch sẽ, thật thà, có giấy tờ tùy thân rõ ràng.',
                'salary' => 9500000,
                'address' => 'Chung cư Sunrise City, Nguyễn Hữu Thọ',
                'district' => 'Quận 7',
                'city' => 'TP. Hồ Chí Minh',
                'working_time' => 'Ở lại nhà khách hàng',
                'status' => 'open',
                'expired_at' => Carbon::now()->addDays(20),
                'created_at' => Carbon::now()->subDays(1)
            ],
            [
                'customer_id' => 4,
                'category_id' => 3, // Care
                'title' => 'Cần người chăm sóc bà cụ 80 tuổi yếu, ít đi lại',
                'description' => 'Tìm người có sức khỏe, kiên nhẫn chăm sóc bà cụ. Công việc bao gồm vệ sinh cá nhân, đút ăn, xoa bóp cơ bản. Có người nhà hỗ trợ buổi tối.',
                'salary' => 12000000,
                'address' => '456 Phan Văn Trị',
                'district' => 'Gò Vấp',
                'city' => 'TP. Hồ Chí Minh',
                'working_time' => 'Thứ 2 - Thứ 7, 7:00 - 18:00',
                'status' => 'open',
                'expired_at' => Carbon::now()->addDays(4), // urgent
                'created_at' => Carbon::now()->subDays(3)
            ],
            [
                'customer_id' => 4,
                'category_id' => 1, // Cleaning
                'title' => 'Tuyển người dọn dẹp văn phòng theo giờ hành chính',
                'description' => 'Văn phòng công ty cần một nhân viên dọn dẹp vệ sinh vào các ngày thứ 2, 4, 6 trong tuần. Môi trường làm việc thoải mái, thân thiện.',
                'salary' => 4500000,
                'address' => 'Tòa nhà Bitexco, Hải Triều',
                'district' => 'Quận 1',
                'city' => 'TP. Hồ Chí Minh',
                'working_time' => 'Thứ 2, 4, 6 (8:00 - 12:00)',
                'status' => 'open',
                'expired_at' => Carbon::now()->addDays(2), // urgent
                'created_at' => Carbon::now()->subHours(4)
            ]
        ];

        foreach ($posts as $postData) {
            $services = [];
            if ($postData['category_id'] == 1) {
                $services = [1, 2]; // Deep cleaning, Sofa cleaning
            } else if ($postData['category_id'] == 3) {
                $services = [4]; // Elderly care
            }

            $jobPost = JobPost::create($postData);

            foreach ($services as $serviceId) {
                JobPostService::create([
                    'job_post_id' => $jobPost->id,
                    'service_id' => $serviceId,
                ]);
            }
        }
    }
}
