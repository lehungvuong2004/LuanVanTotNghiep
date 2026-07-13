<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Models\Banner;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
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
        'id' => 1,
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
        'id' => 2,
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
        'id' => 3,
        'role_id' => 3,
        'full_name' => 'Người giúp việc B',
        'phone' => $helperPhone,
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper2@gmail.com'],
      [
        'id' => 10,
        'role_id' => 3,
        'full_name' => 'Nguyễn Thị Hoa',
        'phone' => '0903333222',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper3@gmail.com'],
      [
        'id' => 11,
        'role_id' => 3,
        'full_name' => 'Trần Văn Hùng',
        'phone' => '0903333444',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper4@gmail.com'],
      [
        'id' => 12,
        'role_id' => 3,
        'full_name' => 'Phạm Thanh Sơn',
        'phone' => '0903333555',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'helper5@gmail.com'],
      [
        'id' => 13,
        'role_id' => 3,
        'full_name' => 'Lê Thị Mai',
        'phone' => '0903333666',
        'password' => Hash::make($helperPass),
        'status' => 'active',
      ]
    );

    // Seed Customer Account (role_id = 4)
    User::updateOrCreate(
      ['email' => 'customer@gmail.com'],
      [
        'id' => 4,
        'role_id' => 4,
        'full_name' => 'Khách hàng A',
        'phone' => $customerPhone,
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer2@gmail.com'],
      [
        'id' => 14,
        'role_id' => 4,
        'full_name' => 'Nguyễn Văn Nam',
        'phone' => '0902222111',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer3@gmail.com'],
      [
        'id' => 15,
        'role_id' => 4,
        'full_name' => 'Trần Thị Tuyết',
        'phone' => '0902222333',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer4@gmail.com'],
      [
        'id' => 16,
        'role_id' => 4,
        'full_name' => 'Phạm Minh Tuấn',
        'phone' => '0902222444',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    User::updateOrCreate(
      ['email' => 'customer5@gmail.com'],
      [
        'id' => 17,
        'role_id' => 4,
        'full_name' => 'Đỗ Thu Trang',
        'phone' => '0902222555',
        'password' => Hash::make($customerPass),
        'status' => 'active',
      ]
    );

    // ================================================================
    //  SEED CUSTOMER PROFILES & ADDRESSES
    // ================================================================

    $cp1 = CustomerProfile::updateOrCreate(
      ['user_id' => 4],
      ['gender' => 'male', 'birthday' => '1990-03-15', 'note' => 'Khách hàng thường xuyên sử dụng dịch vụ dọn nhà.']
    );

    $cp2 = CustomerProfile::updateOrCreate(
      ['user_id' => 14],
      ['gender' => 'male', 'birthday' => '1988-07-22', 'note' => 'Cần chăm sóc người già tại nhà.']
    );

    $cp3 = CustomerProfile::updateOrCreate(
      ['user_id' => 15],
      ['gender' => 'female', 'birthday' => '1995-11-08', 'note' => 'Tìm bảo mẫu cho em bé.']
    );

    $cp4 = CustomerProfile::updateOrCreate(
      ['user_id' => 16],
      ['gender' => 'male', 'birthday' => '1992-01-30', 'note' => null]
    );

    $cp5 = CustomerProfile::updateOrCreate(
      ['user_id' => 17],
      ['gender' => 'female', 'birthday' => '1998-05-12', 'note' => 'Thuê dọn dẹp định kỳ hàng tuần.']
    );

    // Customer Addresses
    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp1->id, 'address' => '123 Nguyễn Trãi, Phường Bến Thành'],
      ['district' => 'Quận 1', 'city' => 'TP.HCM', 'is_default' => 1]
    );
    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp1->id, 'address' => '456 Lê Văn Sỹ, Phường 14'],
      ['district' => 'Quận 3', 'city' => 'TP.HCM', 'is_default' => 0]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp2->id, 'address' => '789 Cách Mạng Tháng 8, Phường 5'],
      ['district' => 'Quận 10', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp3->id, 'address' => '55 Phan Đăng Lưu, Phường 6'],
      ['district' => 'Bình Thạnh', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp4->id, 'address' => '101 Hoàng Văn Thụ, Phường 8'],
      ['district' => 'Phú Nhuận', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    CustomerAddress::updateOrCreate(
      ['customer_id' => $cp5->id, 'address' => '200 Lý Thường Kiệt, Phường 14'],
      ['district' => 'Quận 10', 'city' => 'TP.HCM', 'is_default' => 1]
    );

    // ================================================================
    //  SEED BANNERS
    // ================================================================

    Banner::updateOrCreate(
      ['title' => 'Giảm 20% dịch vụ dọn nhà'],
      [
        'image' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
        'link' => '/#/dich-vu',
        'status' => 'active',
        'created_by' => 1,
      ]
    );

    Banner::updateOrCreate(
      ['title' => 'Chăm sóc người thân yêu'],
      [
        'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1200&auto=format&fit=crop',
        'link' => '/#/dich-vu',
        'status' => 'active',
        'created_by' => 1,
      ]
    );

    Banner::updateOrCreate(
      ['title' => 'Sửa chữa tại nhà nhanh chóng'],
      [
        'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
        'link' => '/#/dich-vu',
        'status' => 'active',
        'created_by' => 1,
      ]
    );

    // ================================================================
    //  SEED ACTIVITY LOGS
    // ================================================================

    ActivityLog::updateOrCreate(
      ['user_id' => 1, 'action' => 'seed_init'],
      ['description' => 'Hệ thống khởi tạo dữ liệu mẫu cho tất cả các microservice.']
    );

    ActivityLog::updateOrCreate(
      ['user_id' => 4, 'action' => 'booking_created'],
      ['description' => 'Khách hàng A đặt dịch vụ dọn nhà sâu tại Quận 1.']
    );

    ActivityLog::updateOrCreate(
      ['user_id' => 14, 'action' => 'job_post_created'],
      ['description' => 'Nguyễn Văn Nam đăng bài tuyển người chăm sóc bà cụ.']
    );

    // Seed Permissions
    $permissions = [
      // 1. Dashboard
      ['name' => 'dashboard.view', 'module' => 'dashboard', 'description' => 'Xem thống kê & báo cáo tổng quan'],

      // 2. Users Management
      ['name' => 'users.view', 'module' => 'users', 'description' => 'Xem danh sách & thông tin người dùng'],
      ['name' => 'users.create', 'module' => 'users', 'description' => 'Thêm mới người dùng'],
      ['name' => 'users.update', 'module' => 'users', 'description' => 'Chỉnh sửa thông tin người dùng'],
      ['name' => 'users.delete', 'module' => 'users', 'description' => 'Xóa tài khoản người dùng'],
      ['name' => 'users.lock', 'module' => 'users', 'description' => 'Khóa tài khoản người dùng'],
      ['name' => 'users.unlock', 'module' => 'users', 'description' => 'Mở khóa tài khoản người dùng'],

      // 3. Roles & Permissions Management
      ['name' => 'roles.view', 'module' => 'roles', 'description' => 'Xem danh sách vai trò'],
      ['name' => 'roles.create', 'module' => 'roles', 'description' => 'Thêm mới vai trò'],
      ['name' => 'roles.update', 'module' => 'roles', 'description' => 'Cập nhật vai trò & quyền hạn'],
      ['name' => 'roles.delete', 'module' => 'roles', 'description' => 'Xóa vai trò hệ thống'],
      ['name' => 'permissions.view', 'module' => 'permissions', 'description' => 'Xem danh sách quyền hạn'],
      ['name' => 'permissions.create', 'module' => 'permissions', 'description' => 'Tạo quyền hạn mới'],
      ['name' => 'permissions.update', 'module' => 'permissions', 'description' => 'Chỉnh sửa quyền hạn'],
      ['name' => 'permissions.delete', 'module' => 'permissions', 'description' => 'Xóa quyền hạn'],

      // 4. Customer Profile & Addresses
      ['name' => 'customer_profile.view', 'module' => 'customer_profile', 'description' => 'Xem hồ sơ khách hàng'],
      ['name' => 'customer_profile.create', 'module' => 'customer_profile', 'description' => 'Tạo hồ sơ khách hàng'],
      ['name' => 'customer_profile.update', 'module' => 'customer_profile', 'description' => 'Cập nhật hồ sơ khách hàng'],
      ['name' => 'customer_profile.delete', 'module' => 'customer_profile', 'description' => 'Xóa hồ sơ khách hàng'],
      ['name' => 'customer_addresses.view', 'module' => 'customer_addresses', 'description' => 'Xem sổ địa chỉ khách hàng'],
      ['name' => 'customer_addresses.create', 'module' => 'customer_addresses', 'description' => 'Thêm địa chỉ mới'],
      ['name' => 'customer_addresses.update', 'module' => 'customer_addresses', 'description' => 'Sửa địa chỉ khách hàng'],
      ['name' => 'customer_addresses.delete', 'module' => 'customer_addresses', 'description' => 'Xóa địa chỉ khách hàng'],

      // 5. Helper Profile & Settings
      ['name' => 'helper_profile.view', 'module' => 'helper_profile', 'description' => 'Xem hồ sơ người giúp việc'],
      ['name' => 'helper_profile.create', 'module' => 'helper_profile', 'description' => 'Tạo hồ sơ người giúp việc'],
      ['name' => 'helper_profile.update', 'module' => 'helper_profile', 'description' => 'Sửa hồ sơ người giúp việc'],
      ['name' => 'helper_profile.delete', 'module' => 'helper_profile', 'description' => 'Xóa hồ sơ người giúp việc'],
      ['name' => 'helper_profile.lock', 'module' => 'helper_profile', 'description' => 'Khóa hồ sơ người giúp việc'],
      ['name' => 'helper_profile.unlock', 'module' => 'helper_profile', 'description' => 'Mở khóa hồ sơ người giúp việc'],
      ['name' => 'helper_profile.verify', 'module' => 'helper_profile', 'description' => 'Duyệt hồ sơ người giúp việc'],

      // 6. Working Areas, Skills, Availabilities
      ['name' => 'working_areas.view', 'module' => 'working_areas', 'description' => 'Xem khu vực hoạt động của helper'],
      ['name' => 'working_areas.create', 'module' => 'working_areas', 'description' => 'Thêm khu vực hoạt động'],
      ['name' => 'working_areas.update', 'module' => 'working_areas', 'description' => 'Cập nhật khu vực hoạt động'],
      ['name' => 'working_areas.delete', 'module' => 'working_areas', 'description' => 'Xóa khu vực hoạt động'],
      ['name' => 'skills.view', 'module' => 'skills', 'description' => 'Xem danh sách kỹ năng'],
      ['name' => 'skills.create', 'module' => 'skills', 'description' => 'Thêm kỹ năng chuyên môn'],
      ['name' => 'skills.update', 'module' => 'skills', 'description' => 'Cập nhật kỹ năng chuyên môn'],
      ['name' => 'skills.delete', 'module' => 'skills', 'description' => 'Xóa kỹ năng chuyên môn'],
      ['name' => 'availabilities.view', 'module' => 'availabilities', 'description' => 'Xem lịch làm việc rảnh'],
      ['name' => 'availabilities.create', 'module' => 'availabilities', 'description' => 'Đăng ký lịch làm việc rảnh'],
      ['name' => 'availabilities.update', 'module' => 'availabilities', 'description' => 'Sửa lịch làm việc rảnh'],
      ['name' => 'availabilities.delete', 'module' => 'availabilities', 'description' => 'Xóa lịch làm việc rảnh'],

      // 7. Bookings Management
      ['name' => 'bookings.view', 'module' => 'bookings', 'description' => 'Xem thông tin đặt lịch'],
      ['name' => 'bookings.create', 'module' => 'bookings', 'description' => 'Tạo mới đơn đặt lịch'],
      ['name' => 'bookings.update_status', 'module' => 'bookings', 'description' => 'Cập nhật trạng thái đơn đặt lịch'],
      ['name' => 'bookings.cancel', 'module' => 'bookings', 'description' => 'Hủy bỏ đơn đặt lịch'],

      // 8. Work Logs (Checkin/Checkout)
      ['name' => 'work_logs.checkin', 'module' => 'work_logs', 'description' => 'Check-in bắt đầu làm việc'],
      ['name' => 'work_logs.checkout', 'module' => 'work_logs', 'description' => 'Check-out hoàn thành công việc'],

      // 9. Job Recruitment Posts & Applications
      ['name' => 'job_posts.view', 'module' => 'job_posts', 'description' => 'Xem tin tuyển dụng'],
      ['name' => 'job_posts.create', 'module' => 'job_posts', 'description' => 'Đăng tin tuyển dụng mới'],
      ['name' => 'job_posts.update', 'module' => 'job_posts', 'description' => 'Chỉnh sửa tin tuyển dụng'],
      ['name' => 'job_posts.delete', 'module' => 'job_posts', 'description' => 'Xóa tin tuyển dụng'],
      ['name' => 'job_posts.approve', 'module' => 'job_posts', 'description' => 'Duyệt bài đăng tuyển dụng'],
      ['name' => 'job_posts.reject', 'module' => 'job_posts', 'description' => 'Từ chối duyệt bài đăng tuyển dụng'],
      ['name' => 'job_posts.hide', 'module' => 'job_posts', 'description' => 'Ẩn bài đăng tuyển dụng'],
      ['name' => 'job_applications.view', 'module' => 'job_applications', 'description' => 'Xem đơn ứng tuyển công việc'],
      ['name' => 'job_applications.create', 'module' => 'job_applications', 'description' => 'Nộp đơn ứng tuyển công việc'],
      ['name' => 'job_applications.update', 'module' => 'job_applications', 'description' => 'Cập nhật trạng thái đơn ứng tuyển'],
      ['name' => 'job_applications.cancel', 'module' => 'job_applications', 'description' => 'Hủy bỏ đơn ứng tuyển'],

      // 10. Favorites & Reviews
      ['name' => 'favorites.view', 'module' => 'favorites', 'description' => 'Xem danh sách yêu thích'],
      ['name' => 'favorites.update', 'module' => 'favorites', 'description' => 'Cập nhật danh sách yêu thích'],
      ['name' => 'reviews.view', 'module' => 'reviews', 'description' => 'Xem danh sách đánh giá'],
      ['name' => 'reviews.create', 'module' => 'reviews', 'description' => 'Viết đánh giá mới'],
      ['name' => 'reviews.update', 'module' => 'reviews', 'description' => 'Sửa bài đánh giá dịch vụ'],

      // 11. Reports & Contacts
      ['name' => 'reports.view', 'module' => 'reports', 'description' => 'Xem báo cáo vi phạm'],
      ['name' => 'reports.create', 'module' => 'reports', 'description' => 'Gửi báo cáo vi phạm'],
      ['name' => 'reports.process', 'module' => 'reports', 'description' => 'Xử lý báo cáo & khiếu nại'],
      ['name' => 'contacts.view', 'module' => 'contacts', 'description' => 'Xem danh sách liên hệ khách hàng'],
      ['name' => 'contacts.create', 'module' => 'contacts', 'description' => 'Gửi yêu cầu liên hệ mới'],
      ['name' => 'contacts.update', 'module' => 'contacts', 'description' => 'Cập nhật thông tin liên hệ'],
      ['name' => 'contacts.delete', 'module' => 'contacts', 'description' => 'Xóa liên hệ khách hàng'],
      ['name' => 'contacts.process', 'module' => 'contacts', 'description' => 'Xử lý phản hồi yêu cầu liên hệ'],

      // 12. Payments & Refunds
      ['name' => 'payments.view', 'module' => 'payments', 'description' => 'Xem thông tin giao dịch & doanh thu'],
      ['name' => 'payments.pay', 'module' => 'payments', 'description' => 'Thực hiện thanh toán online'],
      ['name' => 'payments.history', 'module' => 'payments', 'description' => 'Xem lịch sử giao dịch thanh toán'],
      ['name' => 'refunds.view', 'module' => 'refunds', 'description' => 'Xem yêu cầu hoàn tiền'],
      ['name' => 'refunds.process', 'module' => 'refunds', 'description' => 'Xem xét lý do hoàn tiền'],
      ['name' => 'refunds.approve', 'module' => 'refunds', 'description' => 'Duyệt hoàn tiền cho khách hàng'],
      ['name' => 'refunds.reject', 'module' => 'refunds', 'description' => 'Từ chối yêu cầu hoàn tiền'],

      // 13. Messages & Notifications
      ['name' => 'messages.view', 'module' => 'messages', 'description' => 'Xem danh sách tin nhắn'],
      ['name' => 'messages.send', 'module' => 'messages', 'description' => 'Gửi tin nhắn trong hệ thống'],
      ['name' => 'messages.delete', 'module' => 'messages', 'description' => 'Xóa tin nhắn hội thoại'],
      ['name' => 'notifications.view', 'module' => 'notifications', 'description' => 'Xem thông báo hệ thống'],
      ['name' => 'notifications.send', 'module' => 'notifications', 'description' => 'Gửi thông báo broadcast hệ thống'],

      // 14. News, Banners, Categories & Services
      ['name' => 'news.view', 'module' => 'news', 'description' => 'Xem tin tức sự kiện'],
      ['name' => 'news.create', 'module' => 'news', 'description' => 'Đăng tải bài viết tin tức mới'],
      ['name' => 'news.update', 'module' => 'news', 'description' => 'Chỉnh sửa bài viết tin tức'],
      ['name' => 'news.delete', 'module' => 'news', 'description' => 'Xóa bài viết tin tức'],
      ['name' => 'banners.view', 'module' => 'banners', 'description' => 'Xem danh sách banners quảng cáo'],
      ['name' => 'banners.create', 'module' => 'banners', 'description' => 'Thêm mới banner quảng cáo'],
      ['name' => 'banners.update', 'module' => 'banners', 'description' => 'Cập nhật banner quảng cáo'],
      ['name' => 'banners.delete', 'module' => 'banners', 'description' => 'Xóa banner quảng cáo'],
      ['name' => 'categories.view', 'module' => 'categories', 'description' => 'Xem danh mục phân loại dịch vụ'],
      ['name' => 'categories.create', 'module' => 'categories', 'description' => 'Thêm danh mục phân loại dịch vụ'],
      ['name' => 'categories.update', 'module' => 'categories', 'description' => 'Sửa danh mục phân loại dịch vụ'],
      ['name' => 'categories.delete', 'module' => 'categories', 'description' => 'Xóa danh mục phân loại dịch vụ'],
      ['name' => 'services.view', 'module' => 'services', 'description' => 'Xem danh sách dịch vụ'],
      ['name' => 'services.create', 'module' => 'services', 'description' => 'Thêm mới dịch vụ của hệ thống'],
      ['name' => 'services.update', 'module' => 'services', 'description' => 'Chỉnh sửa dịch vụ hệ thống'],
      ['name' => 'services.delete', 'module' => 'services', 'description' => 'Xóa dịch vụ hệ thống'],
      ['name' => 'services.update_status', 'module' => 'services', 'description' => 'Cập nhật trạng thái hoạt động dịch vụ'],

      // 15. System Logs
      ['name' => 'activity_logs.view', 'module' => 'system', 'description' => 'Xem lịch sử hoạt động toàn bộ hệ thống'],
      ['name' => 'statistics.view', 'module' => 'system', 'description' => 'Xem báo cáo doanh số & thống kê cao cấp'],
    ];

    // Clean up old permissions no longer present in the seeder array
    $permNames = array_column($permissions, 'name');
    Permission::whereNotIn('name', $permNames)->delete();

    foreach ($permissions as $perm) {
      Permission::updateOrCreate(['name' => $perm['name']], $perm);
    }

    // Assign all permissions to Admin (role_id = 1)
    $allPermIds = Permission::pluck('id')->toArray();
    $adminRole = Role::find(1);
    if ($adminRole) {
      $adminRole->permissions()->sync($allPermIds);
    }

    // Assign specific permissions to Operator (role_id = 2)
    $operatorPerms = [
      'helper_profile.verify',
      'job_posts.approve',
      'job_posts.reject',
      'job_posts.hide',
      'services.view',
      'services.update_status',
      'bookings.view',
      'bookings.update_status',
      'contacts.process',
      'reports.process',
      'refunds.process',
      'reviews.view',
      'payments.history',
      'messages.view',
      'messages.send',
      'messages.delete',
      'notifications.view'
    ];
    $operatorRole = Role::find(2);
    if ($operatorRole) {
      $operatorPermIds = Permission::whereIn('name', $operatorPerms)->pluck('id')->toArray();
      $operatorRole->permissions()->sync($operatorPermIds);
    }

    // Assign specific permissions to Helper (role_id = 3)
    $helperPerms = [
      'helper_profile.view',
      'helper_profile.create',
      'helper_profile.update',
      'helper_profile.delete',
      'working_areas.view',
      'working_areas.create',
      'working_areas.update',
      'working_areas.delete',
      'skills.view',
      'skills.create',
      'skills.update',
      'skills.delete',
      'availabilities.view',
      'availabilities.create',
      'availabilities.update',
      'availabilities.delete',
      'job_applications.view',
      'job_applications.create',
      'job_applications.update',
      'job_applications.cancel',
      'bookings.view',
      'bookings.update_status',
      'work_logs.checkin',
      'work_logs.checkout',
      'messages.view',
      'messages.send',
      'messages.delete',
      'reviews.view',
      'payments.history',
      'notifications.view'
    ];
    $helperRole = Role::find(3);
    if ($helperRole) {
      $helperPermIds = Permission::whereIn('name', $helperPerms)->pluck('id')->toArray();
      $helperRole->permissions()->sync($helperPermIds);
    }

    // Assign specific permissions to Customer (role_id = 4)
    $customerPerms = [
      'customer_profile.view',
      'customer_profile.create',
      'customer_profile.update',
      'customer_profile.delete',
      'customer_addresses.view',
      'customer_addresses.create',
      'customer_addresses.update',
      'customer_addresses.delete',
      'bookings.view',
      'bookings.create',
      'bookings.cancel',
      'job_posts.view',
      'job_posts.create',
      'job_posts.update',
      'job_posts.delete',
      'favorites.view',
      'favorites.update',
      'reviews.view',
      'reviews.create',
      'reviews.update',
      'reports.create',
      'payments.pay',
      'payments.history',
      'messages.view',
      'messages.send',
      'messages.delete',
      'notifications.view'
    ];
    $customerRole = Role::find(4);
    if ($customerRole) {
      $customerPermIds = Permission::whereIn('name', $customerPerms)->pluck('id')->toArray();
      $customerRole->permissions()->sync($customerPermIds);
    }

    // Seed News Articles
    $this->call(NewsSeeder::class);
  }
}
