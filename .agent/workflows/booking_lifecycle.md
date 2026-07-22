---
description: Quy trình kiểm thử và vận hành vòng đời đặt lịch (bao gồm Tự động hủy và Thanh toán tiền mặt)
---

### 1. Quy trình Kiểm thử Tự động Hủy Đặt lịch Hết hạn (30 phút)
Hệ thống sử dụng Laravel Scheduler để chạy lệnh quét tự động mỗi phút.

**Các bước thực hiện kiểm thử thủ công:**
1. Tạo một lịch hẹn mới (hoặc tuyển dụng người giúp việc) và giữ nguyên trạng thái `pending` (Chờ thanh toán).
2. Thay đổi thời gian tạo lịch hẹn trong cơ sở dữ liệu lùi lại hơn 30 phút bằng Tinker:
   ```bash
   docker compose exec order-service php artisan tinker
   ```
   Sau đó nhập lệnh:
   ```php
   $booking = App\Models\Booking::latest()->first();
   $booking->created_at = now()->subMinutes(35);
   $booking->save();
   ```
3. Chạy lệnh Artisan để kích hoạt quét quét hủy bỏ công việc:
   ```bash
   docker compose exec order-service php artisan bookings:cancel-expired
   ```
4. Kiểm tra kết quả:
   - Trạng thái của lịch chuyển sang `cancelled` (Đã hủy).
   - Bản ghi lịch sử trạng thái mới được tạo ghi nhận hủy tự động bởi hệ thống.
   - Nếu là lịch hẹn từ bài tuyển dụng, bài tuyển dụng tự động được mở lại (`open`), tuyển dụng bị loại của helper trước đó chuyển thành `rejected`.

---

### 2. Quy trình Thực hiện Đặt lịch bằng Tiền mặt (Cash Payment Workflow)
Đối với hình thức thanh toán bằng tiền mặt, quy trình bao gồm các bước phối hợp giữa Khách hàng và Người giúp việc:

**Các bước thực hiện:**
1. **Khách hàng đặt lịch / Tuyển dụng:**
   - Lịch hẹn được tạo ở trạng thái Chờ thanh toán (`pending`).
2. **Khách hàng chọn phương thức thanh toán:**
   - Khách hàng bấm **Thanh toán**, chọn **Tiền mặt (Cash)** và bấm xác nhận.
   - Hệ thống tự động chuyển đổi trạng thái của Lịch hẹn sang **Đã xác nhận (confirmed)** ngay lập tức để chuẩn bị làm việc.
3. **Người giúp việc chuẩn bị và di chuyển:**
   - Tại trang danh sách lịch hẹn của Người giúp việc, bấm nút **Bắt đầu đi**. Trạng thái chuyển sang `on_the_way`.
4. **Người giúp việc đến điểm hẹn và điểm danh:**
   - Khi đến nơi, bấm **Đã đến nơi** (Check-in). Trạng thái chuyển sang `in_progress`.
   - Hệ thống ghi nhận mốc thời gian điểm danh vào nhật ký công việc (`booking_work_logs`).
5. **Người giúp việc hoàn thành công việc:**
   - Sau khi làm xong, bấm **Hoàn thành** (Check-out). Trạng thái chuyển sang `completed`.
   - Hệ thống cập nhật thời gian hoàn thành vào nhật ký công việc.
6. **Thu tiền mặt và kết thúc thanh toán:**
   - Người giúp việc thu tiền mặt trực tiếp từ Khách hàng.
   - Bấm nút **Xác nhận nhận tiền** (Confirm Cash Payment) hiển thị cạnh trạng thái thanh toán.
   - Trạng thái thanh toán của đơn chuyển sang **Đã thanh toán (completed)**. Giao dịch chính thức hoàn thành.
