<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use Carbon\Carbon;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa sạch dữ liệu cũ trong bảng reviews để tránh trùng lặp
        Review::truncate();

        $reviews = [
            [
                'customer_id' => 4,
                'helper_id' => 3,
                'rating' => 5,
                'comment' => 'Dịch vụ dọn nhà rất chuyên nghiệp, chị giúp việc làm sạch sẽ ngóc ngách, thái độ rất thân thiện.',
                'created_at' => Carbon::now()->subDays(5)
            ],
            [
                'customer_id' => 14,
                'helper_id' => 10,
                'rating' => 5,
                'comment' => 'Anh thợ sửa điều hòa rất nhanh và chuyên nghiệp, thiết bị sau khi bảo dưỡng chạy êm ru.',
                'created_at' => Carbon::now()->subDays(4)
            ],
            [
                'customer_id' => 15,
                'helper_id' => 11,
                'rating' => 4,
                'comment' => 'Cô giúp việc dọn dẹp sạch sẽ, tuy nhiên đến hơi muộn 10 phút so với giờ hẹn.',
                'created_at' => Carbon::now()->subDays(3)
            ],
            [
                'customer_id' => 16,
                'helper_id' => 12,
                'rating' => 5,
                'comment' => 'Chăm sóc người già rất chu đáo và tận tình. Gia đình tôi rất yên tâm giao việc.',
                'created_at' => Carbon::now()->subDays(2)
            ],
            [
                'customer_id' => 17,
                'helper_id' => 13,
                'rating' => 3,
                'comment' => 'Lau chùi cửa kính chưa sạch lắm, nhưng thái độ sửa sai tốt nên vẫn cho 3 sao.',
                'created_at' => Carbon::now()->subDays(1)
            ],
            [
                'customer_id' => 4,
                'helper_id' => 10,
                'rating' => 2,
                'comment' => 'Người làm nói chuyện hơi cộc lốc và làm việc không được kỹ càng lắm.',
                'created_at' => Carbon::now()->subDays(6)
            ],
            [
                'customer_id' => 14,
                'helper_id' => 11,
                'rating' => 1,
                'comment' => 'Tự ý hủy lịch hẹn sát giờ làm việc làm tôi lỡ hết kế hoạch. Rất không hài lòng!',
                'created_at' => Carbon::now()->subDays(7)
            ],
            [
                'customer_id' => 15,
                'helper_id' => 12,
                'rating' => 5,
                'comment' => 'Dịch vụ tuyệt vời! Bạn nhân viên chăm sóc em bé rất khéo và chu đáo.',
                'created_at' => Carbon::now()->subDays(8)
            ],
            [
                'customer_id' => 16,
                'helper_id' => 13,
                'rating' => 4,
                'comment' => 'Dọn dẹp nhanh, sạch sẽ, xếp đồ đạc rất gọn gàng ngăn nắp.',
                'created_at' => Carbon::now()->subDays(9)
            ],
            [
                'customer_id' => 17,
                'helper_id' => 3,
                'rating' => 5,
                'comment' => 'Thái độ phục vụ tuyệt vời, lịch sự, chuyên nghiệp. Sẽ tiếp tục đặt dịch vụ của Gia Đình Việt.',
                'created_at' => Carbon::now()->subDays(10)
            ],
            [
                'customer_id' => 4,
                'helper_id' => 11,
                'rating' => 5,
                'comment' => 'Cực kỳ hài lòng với cách làm việc nhanh nhẹn và sạch sẽ của bạn này.',
                'created_at' => Carbon::now()->subDays(11)
            ],
            [
                'customer_id' => 14,
                'helper_id' => 12,
                'rating' => 2,
                'comment' => 'Làm việc qua loa, nhiều chỗ bám bụi vẫn chưa lau sạch.',
                'created_at' => Carbon::now()->subDays(12)
            ],
            [
                'customer_id' => 15,
                'helper_id' => 13,
                'rating' => 4,
                'comment' => 'Cô giúp việc nấu ăn rất hợp khẩu vị gia đình tôi. Rất thân thiện.',
                'created_at' => Carbon::now()->subDays(13)
            ],
            [
                'customer_id' => 16,
                'helper_id' => 3,
                'rating' => 5,
                'comment' => 'Nhà cửa sạch bong sau khi dọn dẹp. Giá cả phải chăng.',
                'created_at' => Carbon::now()->subDays(14)
            ],
            [
                'customer_id' => 17,
                'helper_id' => 10,
                'rating' => 5,
                'comment' => 'Sửa chữa điện nước rất nhanh chóng, tư vấn nhiệt tình cách tự bảo quản.',
                'created_at' => Carbon::now()->subDays(15)
            ]
        ];

        foreach ($reviews as $rev) {
            Review::create($rev);
        }
    }
}
