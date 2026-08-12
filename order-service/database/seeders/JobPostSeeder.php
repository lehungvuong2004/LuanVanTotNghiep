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
 
        // 20 Urgent jobs (expired_at <= 2 days, triggers "Cần gấp" label)
        $urgentJobs = [
            [
                'title' => 'CẦN GẤP: Dọn dẹp căn hộ 2 phòng ngủ chung cư Park Hill',
                'description' => 'Cần dọn lau dọn toàn bộ căn hộ 2 phòng ngủ, 2 WC. Yêu cầu làm sạch bếp, lau kính và hút bụi sàn nhà. Đã chuẩn bị sẵn dụng cụ.',
                'salary' => 450000,
                'address' => 'Chung cư Park Hill, Mai Động',
                'district' => 'Bình Thạnh',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'TUYỂN GẤP: Người lau dọn nhà khách chuẩn bị tiệc',
                'description' => 'Cần dọn dẹp gấp nhà phố 3 tầng để chuẩn bị đón khách quan trọng. Trọng tâm dọn phòng khách, phòng ăn và nhà bếp.',
                'salary' => 600000,
                'address' => '245 Đường Nguyễn Trãi',
                'district' => 'Quận 1',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'CẦN KHẨN CẤP: Dọn dẹp phòng trọ trả phòng bàn giao',
                'description' => 'Phòng trọ diện tích 25m2 cần dọn dẹp sạch sẽ, cọ nhà vệ sinh và chùi các vết bẩn trên tường để bàn giao lại phòng.',
                'salary' => 350000,
                'address' => 'Hẻm 45 Đường số 8',
                'district' => 'Quận 7',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'TUYỂN GẤP: Vệ sinh cửa hàng trước giờ khai trương',
                'description' => 'Cần lau sàn, hút bụi thảm và lau toàn bộ cửa kính mặt tiền cho showroom quần áo trước giờ mở bán.',
                'salary' => 500000,
                'address' => '321 Đường Lê Văn Sỹ',
                'district' => 'Quận 3',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'CẦN GẤP: Phụ dọn dẹp nhà sau tiệc liên hoan',
                'description' => 'Nhà sau tiệc sinh nhật rất nhiều chén bát, rác thải và sàn nhà bị bẩn dính nước. Cần người phụ giúp dọn dẹp.',
                'salary' => 400000,
                'address' => '12 Đường Thảo Điền',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'TUYỂN GẤP: Quét lá làm vườn biệt thự Thảo Điền',
                'description' => 'Cần quét và dọn sạch lá rụng ngoài sân vườn biệt thự rộng. Công việc nhẹ nhàng nhưng cần làm kỹ.',
                'salary' => 550000,
                'address' => 'Biệt thự khu B, Thảo Điền',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'CẦN GẤP: Lau kính ngoài trời căn hộ Masteri',
                'description' => 'Lau kính ban công, chùi vết bụi bẩn tích tụ ngoài trời. Đã chuẩn bị sẵn nước lau chuyên dụng.',
                'salary' => 380000,
                'address' => 'Masteri Thảo Điền, Block T2',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'CẦN GẤP: Dọn dẹp phòng trọ gấp trong chiều nay',
                'description' => 'Diện tích nhỏ nhưng bừa bộn cần lau chùi sạch bụi bẩn sàn nhà, tủ lạnh và cọ toilet sạch để bàn giao.',
                'salary' => 320000,
                'address' => '78 Đường Mạc Đĩnh Chi',
                'district' => 'Quận 1',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'KHẨN CẤP: Dọn dẹp gian bếp nhà hàng sau giờ nghỉ',
                'description' => 'Cọ rửa sàn bếp ga ngập mỡ, lau chùi mặt bàn sơ chế và rửa dọn xoong nồi lớn sau giờ đóng cửa nhà hàng.',
                'salary' => 700000,
                'address' => 'Nhà hàng góc Tú Xương',
                'district' => 'Quận 3',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'CẦN GẤP: Vệ sinh giặt thảm văn phòng tại Bình Thạnh',
                'description' => 'Hút sạch bụi bẩn và giặt thảm tẩy vết café tại văn phòng làm việc quy mô nhỏ. Đã có máy hút nước.',
                'salary' => 650000,
                'address' => 'Tòa nhà văn phòng Hoàng Anh',
                'district' => 'Bình Thạnh',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'CẦN GẤP: Trông giữ em bé 2 tuổi tại Sunrise City',
                'description' => 'Mẹ bận việc đột xuất cần người trông bé. Cho ăn sữa đã pha sẵn và chơi cùng bé tại nhà.',
                'salary' => 500000,
                'address' => 'Chung cư Sunrise City',
                'district' => 'Quận 7',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'TUYỂN GẤP: Người túc trực chăm cụ bà tại Phú Nhuận',
                'description' => 'Bà chân yếu cần người đỡ đi lại, lo bữa ăn nhẹ và nhắc uống thuốc đúng giờ giấc.',
                'salary' => 900000,
                'address' => '89 Đường Phan Xích Long',
                'district' => 'Phú Nhuận',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'CẦN GẤP: Cô đưa đón học sinh tiểu học tan trường',
                'description' => 'Đón bé học lớp 2 lúc 16:30 và trông bé đến khi mẹ đi làm về lúc 19:00 tối.',
                'salary' => 300000,
                'address' => 'Chung cư Horizon, Quận 1',
                'district' => 'Quận 1',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'TUYỂN GẤP: Cô phụ mẹ bỉm chăm bé 12 tháng tuổi',
                'description' => 'Phụ bồng bế bé, pha sữa và giặt tã lót quần áo em bé lúc mẹ bận làm việc nhà.',
                'salary' => 600000,
                'address' => 'Biệt Thự Him Lam Riverside',
                'district' => 'Quận 7',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'CẦN GẤP: Chăm người ốm nằm viện Chợ Rẫy đêm nay',
                'description' => 'Hỗ trợ thay tã, lau người và bón cháo cho bệnh nhân tai biến. Có phòng bệnh dịch vụ yên tĩnh.',
                'salary' => 850000,
                'address' => 'Bệnh viện Chợ Rẫy',
                'district' => 'Quận 5',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'CẦN GẤP: Trông bé gái 3 tuổi ngày nghỉ cuối tuần',
                'description' => 'Bố mẹ đi vắng cần cô trông bé tại nhà. Bé ngoan, chỉ cần pha sữa và chơi đồ hàng cùng bé.',
                'salary' => 450000,
                'address' => 'Chung cư Sala',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'CẦN GẤP: Tắm và vệ sinh rốn bé sơ sinh Quận 3',
                'description' => 'Cần cô điều mẫu tắm bé sơ sinh 15 ngày tuổi cẩn thận, chuẩn y khoa tại phòng lạnh.',
                'salary' => 250000,
                'address' => '33 Nguyễn Đình Chiểu',
                'district' => 'Quận 3',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'TUYỂN GẤP: Trông cụ ông đi dạo công viên Landmark 81',
                'description' => 'Cụ bị đau chân nhẹ cần người dìu đi dạo tập thể dục công viên chiều mát, nhắc cụ uống thuốc đúng cữ.',
                'salary' => 350000,
                'address' => 'Landmark 81, Vinhomes',
                'district' => 'Bình Thạnh',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'CẦN GẤP: Chuẩn bị cháo ăn dặm cho trẻ tại nhà',
                'description' => 'Chế biến rau củ quả nghiền bằng máy xay sinh tố, dọn rửa khay ăn dặm sau khi bé ăn xong.',
                'salary' => 300000,
                'address' => 'Estella Heights, Quận 2',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'TUYỂN GẤP: Trông giữ bé 15 tháng tại căn hộ Vista',
                'description' => 'Chơi cùng bé khi mẹ làm việc online. Yêu cầu cô bảo mẫu dịu dàng, cẩn trọng.',
                'salary' => 500000,
                'address' => 'The Vista An Phú',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
        ];
 
        // 10 Normal jobs (expired_at >= 5 days, triggers "Bình thường" label)
        $normalJobs = [
            [
                'title' => 'Tuyển người dọn nhà chung cư Vista định kỳ hàng tuần',
                'description' => 'Cần lau chùi, vệ sinh nhà cửa định kỳ mỗi tuần một lần vào sáng thứ Bảy. Diện tích 90m2.',
                'salary' => 450000,
                'address' => 'The Vista An Phú',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'Tìm người lau dọn phòng thí nghiệm trường Đại Học',
                'description' => 'Dọn rác khô phòng thí nghiệm, lau bụi kệ tủ trưng bày khô ráo sạch sẽ. Việc đơn giản ít độc hại.',
                'salary' => 500000,
                'address' => '227 Nguyễn Văn Cừ',
                'district' => 'Quận 5',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'Cần thuê lau dọn thay chăn ga homestay Quận 1',
                'description' => 'Vệ sinh phòng homestay sau khi khách check-out bao gồm thay ga giường mới, dọn WC và lau nhà.',
                'salary' => 400000,
                'address' => '23 Đề Thám',
                'district' => 'Quận 1',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'Tìm thợ hỗ trợ là ủi quần áo sơ mi nam nữ',
                'description' => 'Sắp xếp tủ đồ và là lượt phẳng phiu áo polo, sơ mi công sở của hai vợ chồng.',
                'salary' => 350000,
                'address' => '102 Phan Huy Ích',
                'district' => 'Gò Vấp',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'Quét dọn vệ sinh văn phòng công ty start-up',
                'description' => 'Gom rác bàn làm việc văn phòng nhỏ, quét dọn bồn rửa ly tách nước uống chung sạch sẽ.',
                'salary' => 420000,
                'address' => 'Tòa nhà Viettel',
                'district' => 'Quận 10',
                'city' => 'TP.HCM',
                'category_id' => 1,
            ],
            [
                'title' => 'Tìm bảo mẫu chăm bé 18 tháng tuổi theo ca tuần',
                'description' => 'Chăm bé hành chính trong gia đình. Chuẩn bị bữa phụ xế, dỗ bé ngủ trưa và tắm rửa cho bé chiều muộn.',
                'salary' => 7000000,
                'address' => 'Chateau Phú Mỹ Hưng',
                'district' => 'Quận 7',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'Tuyển cô chăm cụ bà lớn tuổi nằm giường mát-xa',
                'description' => 'Chăm sóc bà cụ đau khớp khó đi lại. Hỗ trợ cho bà ăn, dìu bà nằm cáng, thay đệm nằm định kỳ.',
                'salary' => 10000000,
                'address' => '134 Lý Thường Kiệt',
                'district' => 'Quận 10',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'Tìm cô tâm sự đọc báo cho cụ bà neo đơn',
                'description' => 'Nói chuyện cùng bà cụ cho khuây khỏa, phụ đun nước chè, đưa bà ra ghế đá tập thể dục dưỡng sinh.',
                'salary' => 400000,
                'address' => 'Khu Trung Sơn',
                'district' => 'Bình Chánh',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'Tìm cô giúp việc trông nom đồ chơi mẫu giáo',
                'description' => 'Phụ vệ sinh khử trùng đồ chơi nhựa và phân chia khay đồ ăn xế chiều cho các em bé.',
                'salary' => 5500000,
                'address' => 'Mầm non Bambi',
                'district' => 'Quận 7',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
            [
                'title' => 'Tìm người hướng dẫn bé 5 tuổi rèn kỹ năng vẽ',
                'description' => 'Vừa chơi vừa dạy bé tô màu tranh canvas, gấp thú giấy origami kích thích tư duy phát triển trí tuệ.',
                'salary' => 600000,
                'address' => 'Khu biệt thự Thảo Điền',
                'district' => 'Quận 2',
                'city' => 'TP.HCM',
                'category_id' => 3,
            ],
        ];
 
        // Real customer ID '4' in users table is 'customer@gmail.com'
        $customerId = 4;
 
        // Seed Urgent jobs (expiration <= 2 days)
        foreach ($urgentJobs as $index => $data) {
            $duration = [2, 4, 6, 8][array_rand([2, 4, 6, 8])];
            $data['customer_id'] = $customerId;
            $data['status'] = 'open';
            $data['description'] = "[Thời lượng: {$duration} giờ]\n" . $data['description'];
            $data['working_time'] = Carbon::now()->addDays(rand(3, 5))->setTime(rand(8, 17), rand(0, 59))->format('Y-m-d\TH:i');
            $data['expired_at'] = Carbon::now()->addDays(rand(1, 2))->setTime(rand(8, 17), rand(0, 59));
            $data['created_at'] = Carbon::now()->subHours(rand(1, 10));
 
            $jobPost = JobPost::create($data);
 
            $services = $data['category_id'] == 1 ? [1, 2] : [4, 6];
            foreach ($services as $serviceId) {
                JobPostService::create([
                    'job_post_id' => $jobPost->id,
                    'service_id' => $serviceId,
                ]);
            }
        }
 
        // Seed Normal jobs (expiration 5 to 7 days)
        foreach ($normalJobs as $index => $data) {
            $duration = [2, 4, 6, 8][array_rand([2, 4, 6, 8])];
            $data['customer_id'] = $customerId;
            $data['status'] = 'open';
            $data['description'] = "[Thời lượng: {$duration} giờ]\n" . $data['description'];
            $data['working_time'] = Carbon::now()->addDays(rand(8, 10))->setTime(rand(8, 17), rand(0, 59))->format('Y-m-d\TH:i');
            $data['expired_at'] = Carbon::now()->addDays(rand(5, 7))->setTime(rand(8, 17), rand(0, 59));
            $data['created_at'] = Carbon::now()->subDays(rand(1, 2));
 
            $jobPost = JobPost::create($data);
 
            $services = $data['category_id'] == 1 ? [1, 2] : [4, 6];
            foreach ($services as $serviceId) {
                JobPostService::create([
                    'job_post_id' => $jobPost->id,
                    'service_id' => $serviceId,
                ]);
            }
        }
    }
}
