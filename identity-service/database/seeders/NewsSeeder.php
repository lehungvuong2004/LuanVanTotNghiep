<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = DB::table('users')->where('email', 'admin@gmail.com')->value('id');

        $articles = [
            [
                'title'     => '5 mẹo giữ nhà luôn thơm mát trong mùa mưa',
                'summary'   => 'Mùa mưa đến, ngôi nhà dễ bị ẩm mốc và có mùi khó chịu. Hãy áp dụng ngay 5 mẹo đơn giản sau để giữ không gian sống luôn tươi mát và dễ chịu.',
                'content'   => '<h2>1. Sử dụng túi hút ẩm</h2><p>Đặt túi hút ẩm silica gel ở các góc tủ, ngăn kéo để hút độ ẩm trong không khí, ngăn chặn mùi mốc hình thành.</p><h2>2. Trồng cây có mùi thơm tự nhiên</h2><p>Các loại cây như bạc hà, oải hương, sả chanh không chỉ làm đẹp không gian mà còn tỏa hương thơm dịu nhẹ và đuổi muỗi hiệu quả.</p><h2>3. Vệ sinh máy điều hòa định kỳ</h2><p>Máy điều hòa lâu không vệ sinh tích tụ bụi bẩn, nấm mốc gây ra mùi hôi. Nên vệ sinh bộ lọc ít nhất 1 tháng/lần vào mùa mưa.</p><h2>4. Dùng tinh dầu khuếch tán</h2><p>Máy khuếch tán tinh dầu sả, chanh hoặc bạch đàn giúp khử khuẩn không khí và tạo hương thơm dễ chịu suốt cả ngày.</p><h2>5. Mở cửa sổ đúng lúc</h2><p>Tranh thủ những buổi trưa nắng ráo để mở cửa thông gió, giúp không khí lưu thông và giảm độ ẩm trong phòng hiệu quả.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Cách chọn người giúp việc phù hợp cho gia đình có trẻ nhỏ',
                'summary'   => 'Tìm được người giúp việc đáng tin cậy, yêu trẻ và có kỹ năng chăm sóc phù hợp là điều không hề dễ. Bài viết này sẽ hướng dẫn bạn các tiêu chí cần lưu ý.',
                'content'   => '<h2>Ưu tiên kinh nghiệm chăm sóc trẻ</h2><p>Người giúp việc có kinh nghiệm trông trẻ, biết cách xử lý khi bé ốm, biết cách chơi cùng bé sẽ giúp cha mẹ an tâm hơn rất nhiều khi đi làm.</p><h2>Kiểm tra lý lịch và tham khảo từ gia đình trước</h2><p>Luôn yêu cầu xác minh nhân thân (CMND/CCCD), hỏi thăm gia đình đã từng sử dụng dịch vụ của họ để có cái nhìn khách quan.</p><h2>Thử việc ít nhất 1 tuần</h2><p>Giai đoạn thử việc giúp bạn quan sát trực tiếp cách người giúp việc tương tác với bé, thói quen làm việc và sự cẩn thận trong từng việc nhỏ.</p><h2>Thỏa thuận rõ ràng ngay từ đầu</h2><p>Ghi rõ lịch làm việc, mức lương, các khoản phụ cấp, ngày nghỉ phép để tránh mâu thuẫn phát sinh về sau.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Bảng giá dịch vụ vệ sinh nhà cửa mới nhất 2025',
                'summary'   => 'Tham khảo bảng giá dịch vụ vệ sinh nhà cửa theo giờ, theo buổi và trọn gói tại TP.HCM và Hà Nội để lên kế hoạch ngân sách hợp lý cho gia đình.',
                'content'   => '<h2>Giá dịch vụ theo giờ</h2><p>Giúp việc theo giờ thường dao động từ <strong>100.000đ – 150.000đ/giờ</strong> tùy khu vực và mức độ công việc yêu cầu.</p><h2>Giá dịch vụ theo buổi</h2><p>Một buổi làm việc (4 tiếng) thường có giá từ <strong>350.000đ – 500.000đ</strong>, bao gồm lau nhà, dọn dẹp phòng ngủ, phòng bếp và nhà vệ sinh.</p><h2>Giá dịch vụ tổng vệ sinh</h2><p>Dịch vụ tổng vệ sinh toàn bộ căn nhà (8 tiếng, 2 người) có giá từ <strong>1.200.000đ – 2.000.000đ</strong> tùy diện tích và mức độ yêu cầu.</p><h2>Lưu ý khi so sánh giá</h2><p>Hãy hỏi kỹ xem dịch vụ có bao gồm dụng cụ vệ sinh, hóa chất hay không để tránh bị tính phí phát sinh.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Tại sao nên thuê người giúp việc theo giờ thay vì ở lại?',
                'summary'   => 'Giúp việc theo giờ ngày càng được ưa chuộng vì tính linh hoạt và tiết kiệm. Hãy cùng tìm hiểu ưu và nhược điểm của hình thức này.',
                'content'   => '<h2>Ưu điểm của giúp việc theo giờ</h2><p><strong>Linh hoạt thời gian:</strong> Bạn chủ động đặt lịch theo nhu cầu, không bị ràng buộc hợp đồng dài hạn.</p><p><strong>Tiết kiệm chi phí:</strong> Chỉ trả tiền cho số giờ thực tế sử dụng, không phải lo chi phí ăn ở như giúp việc ở lại.</p><p><strong>Riêng tư hơn:</strong> Không có người lạ sống cùng, gia đình cảm thấy thoải mái hơn.</p><h2>Nhược điểm cần lưu ý</h2><p><strong>Thiếu sự gắn bó:</strong> Người giúp việc theo giờ thường ít hiểu thói quen của gia đình hơn người ở lại.</p><p><strong>Khó kiểm soát chất lượng:</strong> Cần đặt lịch đúng hẹn và có cơ chế đánh giá để đảm bảo chất lượng mỗi lần.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1527515637462-cff94edd56f9?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Hướng dẫn chăm sóc người già tại nhà đúng cách',
                'summary'   => 'Chăm sóc người cao tuổi tại nhà đòi hỏi sự kiên nhẫn, kiến thức y tế cơ bản và tình yêu thương. Bài viết tổng hợp những điều cần biết để chăm sóc ông bà cha mẹ một cách chu đáo nhất.',
                'content'   => '<h2>Dinh dưỡng cho người cao tuổi</h2><p>Người già cần chế độ ăn ít muối, ít dầu mỡ, giàu đạm từ cá và đậu hũ, bổ sung canxi từ sữa ít đường và rau xanh.</p><h2>Hỗ trợ vận động nhẹ nhàng</h2><p>Khuyến khích ông bà đi bộ nhẹ 15–20 phút/ngày, tập các bài tập giữ thăng bằng để phòng ngã — nguyên nhân hàng đầu gây thương tích ở người cao tuổi.</p><h2>Theo dõi sức khỏe định kỳ</h2><p>Ghi nhớ lịch uống thuốc, đo huyết áp hàng ngày và đưa đi khám định kỳ 3 tháng/lần để phát hiện sớm các vấn đề sức khỏe.</p><h2>Quan tâm sức khỏe tinh thần</h2><p>Người già dễ bị trầm cảm và cô đơn. Hãy dành thời gian trò chuyện, tham gia hoạt động cộng đồng hoặc câu lạc bộ dưỡng sinh cùng các cụ.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Kinh nghiệm vệ sinh nhà bếp sạch bóng chỉ trong 30 phút',
                'summary'   => 'Nhà bếp là nơi tích tụ dầu mỡ và vi khuẩn nhiều nhất trong nhà. Áp dụng quy trình vệ sinh khoa học này để có bếp sạch nhanh chóng mà không tốn nhiều công sức.',
                'content'   => '<h2>Bắt đầu từ bề mặt cao xuống thấp</h2><p>Lau bụi trần bếp, hút mùi trước, sau đó đến mặt bếp, tủ lạnh và cuối cùng là sàn nhà. Nguyên tắc này giúp bụi rơi xuống chỉ cần dọn một lần.</p><h2>Dùng hỗn hợp giấm + baking soda</h2><p>Phun hỗn hợp giấm trắng pha loãng lên bề mặt có dầu mỡ, rắc baking soda lên, để 5 phút rồi lau sạch. Hiệu quả tương đương tẩy rửa hóa học mà không độc hại.</p><h2>Vệ sinh lò vi sóng bằng chanh</h2><p>Đun sôi bát nước có vắt nước cốt chanh trong lò vi sóng 3 phút. Hơi nước nóng làm mềm vết bẩn, lau bằng khăn ẩm là sạch ngay.</p><h2>Làm sạch mặt bếp nhanh</h2><p>Đun nóng nhẹ mặt bếp để dầu mỡ mềm ra, sau đó dùng dung dịch rửa bát pha loãng và miếng cọ mềm. Đừng dùng vật cứng cạo vì dễ trầy xước.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Lợi ích bất ngờ của việc dọn dẹp nhà cửa mỗi tuần',
                'summary'   => 'Không chỉ giúp không gian ngăn nắp, việc dọn dẹp nhà cửa thường xuyên còn mang lại nhiều lợi ích về sức khỏe tinh thần mà ít người biết đến.',
                'content'   => '<h2>Giảm căng thẳng và lo âu</h2><p>Nghiên cứu của Đại học California chỉ ra rằng phụ nữ sống trong nhà bừa bộn có nồng độ cortisol (hormone stress) cao hơn 36% so với người sống trong nhà gọn gàng.</p><h2>Ngủ ngon hơn</h2><p>Phòng ngủ sạch sẽ, không có đống quần áo hay bụi bẩn giúp não bộ thư giãn dễ dàng hơn, cải thiện chất lượng giấc ngủ rõ rệt.</p><h2>Tăng năng suất làm việc</h2><p>Môi trường làm việc gọn gàng giúp bạn tập trung hơn, giảm thời gian tìm kiếm đồ vật và tạo tâm lý tích cực để bắt đầu ngày mới.</p><h2>Cải thiện sức khỏe hô hấp</h2><p>Dọn bụi và vệ sinh định kỳ giảm thiểu bụi mịn, phấn hoa và nấm mốc — những tác nhân hàng đầu gây dị ứng và hen suyễn.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Nấu ăn gia đình: Bí quyết để mỗi bữa đều ngon và đủ dinh dưỡng',
                'summary'   => 'Bữa cơm gia đình không chỉ cần ngon mà còn phải đủ chất. Người giúp việc và cả chính bạn có thể áp dụng những bí quyết này để nâng tầm chất lượng bữa ăn hàng ngày.',
                'content'   => '<h2>Lên thực đơn theo tuần</h2><p>Lên kế hoạch thực đơn 7 ngày giúp bạn mua nguyên liệu đúng lượng, tránh lãng phí và đảm bảo bữa ăn đa dạng dinh dưỡng.</p><h2>Nguyên tắc "nửa đĩa rau"</h2><p>Mỗi bữa ăn nên có ít nhất 50% là rau củ, 25% tinh bột và 25% đạm (thịt, cá, trứng, đậu). Đây là cách đơn giản để ăn đủ chất mà không cần đếm calo.</p><h2>Chuẩn bị nguyên liệu trước</h2><p>Dành 30 phút cuối tuần để rửa, cắt và phân loại rau củ. Khi nấu chỉ cần lấy ra dùng, tiết kiệm tối thiểu 15 phút mỗi bữa.</p><h2>Hạn chế dầu mỡ và muối</h2><p>Thay thế chiên rán bằng hấp và luộc, dùng các loại gia vị thảo mộc tự nhiên thay muối để giữ hương vị mà vẫn tốt cho sức khỏe tim mạch.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
            [
                'title'     => 'Giặt ủi đúng cách — bí quyết để quần áo bền đẹp lâu dài',
                'summary'   => 'Giặt sai cách là nguyên nhân hàng đầu khiến quần áo mau hỏng, bạc màu và co rút. Nắm vững những nguyên tắc cơ bản này để bảo quản tủ đồ của bạn.',
                'content'   => '<h2>Đọc nhãn trước khi giặt</h2><p>Mỗi loại vải đều có hướng dẫn giặt riêng trên nhãn mác. Đừng bỏ qua các ký hiệu giặt ủi — chúng giúp bạn tránh làm hỏng đồ đắt tiền.</p><h2>Phân loại quần áo theo màu và chất liệu</h2><p>Tách riêng đồ trắng, đồ sáng màu và đồ tối màu. Giặt lụa, len và vải mỏng riêng với chu trình giặt nhẹ để tránh xù lông và giãn vải.</p><h2>Không giặt quá nóng</h2><p>Nước nóng trên 40°C chỉ phù hợp với đồ trắng cotton. Hầu hết quần áo nên được giặt ở 30°C để giữ màu và form dáng.</p><h2>Phơi đúng cách</h2><p>Lộn mặt trái quần áo khi phơi để tránh phai màu do tia UV. Đồ có cổ áo nên phơi trên móc thay vì kẹp bằng kẹp để tránh biến dạng cổ áo.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?q=80&w=800&auto=format&fit=crop',
                'status'    => 'published',
            ],
        ];

        foreach ($articles as $article) {
            $slug = Str::slug($article['title']);
            // Nếu slug đã tồn tại thì bỏ qua
            $exists = DB::table('news')->where('slug', $slug)->exists();
            if (!$exists) {
                DB::table('news')->insert([
                    'title'      => $article['title'],
                    'slug'       => $slug,
                    'thumbnail'  => $article['thumbnail'],
                    'summary'    => $article['summary'],
                    'content'    => $article['content'],
                    'status'     => $article['status'],
                    'created_by' => $adminId,
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
