<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingService;
use App\Models\BookingStatusHistory;
use App\Models\BookingWorkLog;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
  /**
   * Seed bookings, booking_services, booking_status_histories & booking_work_logs.
   *
   * IDs cross-service (khớp với identity & provider seeders):
   *   Customers: 4, 14, 15, 16, 17
   *   Helpers:   user_id 3 (helper_id=1), 10 (2), 11 (3), 12 (4), 13 (5)
   *   Addresses: customer_profile 1→addr 1,2 | 2→addr 3 | 3→addr 4 | 4→addr 5 | 5→addr 6
   *   Services:  1=Deep Home Cleaning, 2=Standard Sofa Cleaning, 3=AC Repair, 4=Elderly Care
   */
  public function run(): void
  {
    // Seed Bookings
    $bookings = [
      // 1. Completed — Deep Cleaning
      [
        'booking_code' => 'BK-20260701-001',
        'customer_id'  => 4,
        'helper_id'    => 3,
        'address_id'   => 1,
        'booking_date' => Carbon::now()->subDays(10)->toDateString(),
        'start_time'   => '08:00:00',
        'total_price'  => 500000,
        'status'       => 'completed',
        'note'         => 'Dọn dẹp sâu toàn bộ căn hộ 3 phòng ngủ.',
        'created_at'   => Carbon::now()->subDays(12),
      ],
      // 2. Completed — AC Repair
      [
        'booking_code' => 'BK-20260702-002',
        'customer_id'  => 14,
        'helper_id'    => 10,   // user_id=10
        'address_id'   => 3,
        'booking_date' => Carbon::now()->subDays(8)->toDateString(),
        'start_time'   => '09:00:00',
        'total_price'  => 500000,
        'status'       => 'completed',
        'note'         => 'Sửa điều hòa phòng khách và phòng ngủ.',
        'created_at'   => Carbon::now()->subDays(9),
      ],
      // 3. Completed — Elderly Care
      [
        'booking_code' => 'BK-20260703-003',
        'customer_id'  => 15,
        'helper_id'    => 11,   // user_id=11
        'address_id'   => 4,
        'booking_date' => Carbon::now()->subDays(6)->toDateString(),
        'start_time'   => '07:00:00',
        'total_price'  => 600000,
        'status'       => 'completed',
        'note'         => 'Chăm sóc bà cụ 75 tuổi cả ngày.',
        'created_at'   => Carbon::now()->subDays(7),
      ],
      // 4. Confirmed — Sofa Cleaning (upcoming)
      [
        'booking_code' => 'BK-20260704-004',
        'customer_id'  => 16,
        'helper_id'    => 12,   // user_id=12
        'address_id'   => 5,
        'booking_date' => Carbon::now()->addDays(2)->toDateString(),
        'start_time'   => '08:00:00',
        'total_price'  => 350000,
        'status'       => 'confirmed',
        'note'         => 'Giặt ghế sofa bộ 5 miếng.',
        'created_at'   => Carbon::now()->subDay(),
      ],
      // 5. Pending — Deep Cleaning (upcoming)
      [
        'booking_code' => 'BK-20260705-005',
        'customer_id'  => 17,
        'helper_id'    => 13,   // user_id=13
        'address_id'   => 6,
        'booking_date' => Carbon::now()->addDays(3)->toDateString(),
        'start_time'   => '13:00:00',
        'total_price'  => 500000,
        'status'       => 'pending',
        'note'         => 'Dọn dẹp nhà sau sửa chữa.',
        'created_at'   => Carbon::now(),
      ],
      // 6. Cancelled — Sofa Cleaning
      [
        'booking_code' => 'BK-20260706-006',
        'customer_id'  => 4,
        'helper_id'    => 12,
        'address_id'   => 2,
        'booking_date' => Carbon::now()->subDays(3)->toDateString(),
        'start_time'   => '14:00:00',
        'total_price'  => 350000,
        'status'       => 'cancelled',
        'note'         => 'Hủy vì trùng lịch.',
        'cancel_by'    => 4,
        'cancel_reason' => 'Trùng lịch với cuộc họp công ty.',
        'created_at'   => Carbon::now()->subDays(5),
      ],
      // 7. Completed — Pet Grooming
      [
        'booking_code' => 'BK-20260707-007',
        'customer_id'  => 15,
        'helper_id'    => 3,
        'address_id'   => 4,
        'booking_date' => Carbon::now()->subDays(4)->toDateString(),
        'start_time'   => '10:00:00',
        'total_price'  => 200000,
        'status'       => 'completed',
        'note'         => 'Chăm sóc và dọn vệ sinh cho thú cưng.',
        'created_at'   => Carbon::now()->subDays(5),
      ],
      // 8. Completed — Weekday Childcare
      [
        'booking_code' => 'BK-20260708-008',
        'customer_id'  => 16,
        'helper_id'    => 10,
        'address_id'   => 5,
        'booking_date' => Carbon::now()->subDays(3)->toDateString(),
        'start_time'   => '08:00:00',
        'total_price'  => 240000,
        'status'       => 'completed',
        'note'         => 'Trông trẻ ngày thường.',
        'created_at'   => Carbon::now()->subDays(4),
      ],
    ];

    foreach ($bookings as $bData) {
      Booking::updateOrCreate(
        ['booking_code' => $bData['booking_code']],
        $bData
      );
    }

    // Seed Booking Services
    $bookingServices = [
      // Booking 1 — Deep Home Cleaning, 4 hours
      ['booking_code' => 'BK-20260701-001', 'service_id' => 1, 'price' => 500000, 'duration_hours' => 4, 'quantity' => 1, 'service_order' => 1, 'note' => null],
      // Booking 2 — AC Repair x2 units
      ['booking_code' => 'BK-20260702-002', 'service_id' => 3, 'price' => 250000, 'duration_hours' => 2, 'quantity' => 2, 'service_order' => 1, 'note' => 'Sửa 2 máy điều hòa'],
      // Booking 3 — Elderly Care, 4 hours
      ['booking_code' => 'BK-20260703-003', 'service_id' => 4, 'price' => 150000, 'duration_hours' => 4, 'quantity' => 1, 'service_order' => 1, 'note' => null],
      // Booking 4 — Sofa Cleaning
      ['booking_code' => 'BK-20260704-004', 'service_id' => 2, 'price' => 350000, 'duration_hours' => 2, 'quantity' => 1, 'service_order' => 1, 'note' => null],
      // Booking 5 — Deep Home Cleaning
      ['booking_code' => 'BK-20260705-005', 'service_id' => 1, 'price' => 500000, 'duration_hours' => 4, 'quantity' => 1, 'service_order' => 1, 'note' => null],
      // Booking 6 — Sofa Cleaning (cancelled)
      ['booking_code' => 'BK-20260706-006', 'service_id' => 2, 'price' => 350000, 'duration_hours' => 2, 'quantity' => 1, 'service_order' => 1, 'note' => null],
      // Booking 7 — Pet Grooming
      ['booking_code' => 'BK-20260707-007', 'service_id' => 5, 'price' => 200000, 'duration_hours' => 2, 'quantity' => 1, 'service_order' => 1, 'note' => null],
      // Booking 8 — Weekday Childcare
      ['booking_code' => 'BK-20260708-008', 'service_id' => 6, 'price' => 120000, 'duration_hours' => 2, 'quantity' => 2, 'service_order' => 1, 'note' => null],
    ];

    foreach ($bookingServices as $bs) {
      $booking = Booking::where('booking_code', $bs['booking_code'])->first();
      if (!$booking) continue;

      BookingService::updateOrCreate(
        ['booking_id' => $booking->id, 'service_id' => $bs['service_id'], 'service_order' => $bs['service_order']],
        [
          'price'          => $bs['price'],
          'duration_hours' => $bs['duration_hours'],
          'quantity'       => $bs['quantity'],
          'note'           => $bs['note'],
        ]
      );
    }

    // Seed Booking Status Histories
    $statusChanges = [
      // Booking 1 — pending → confirmed → in_progress → completed
      ['booking_code' => 'BK-20260701-001', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 4,  'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260701-001', 'old_status' => 'pending',      'new_status' => 'confirmed',   'changed_by' => 3,  'note' => 'Helper chấp nhận.'],
      ['booking_code' => 'BK-20260701-001', 'old_status' => 'confirmed',    'new_status' => 'in_progress', 'changed_by' => 3,  'note' => 'Bắt đầu làm việc.'],
      ['booking_code' => 'BK-20260701-001', 'old_status' => 'in_progress',  'new_status' => 'completed',   'changed_by' => 3,  'note' => 'Hoàn thành công việc.'],
      // Booking 2
      ['booking_code' => 'BK-20260702-002', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 14, 'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260702-002', 'old_status' => 'pending',      'new_status' => 'confirmed',   'changed_by' => 10, 'note' => 'Helper chấp nhận.'],
      ['booking_code' => 'BK-20260702-002', 'old_status' => 'confirmed',    'new_status' => 'completed',   'changed_by' => 10, 'note' => 'Hoàn thành.'],
      // Booking 3
      ['booking_code' => 'BK-20260703-003', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 15, 'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260703-003', 'old_status' => 'pending',      'new_status' => 'confirmed',   'changed_by' => 11, 'note' => 'Helper chấp nhận.'],
      ['booking_code' => 'BK-20260703-003', 'old_status' => 'confirmed',    'new_status' => 'completed',   'changed_by' => 11, 'note' => 'Hoàn thành.'],
      // Booking 4 — confirmed
      ['booking_code' => 'BK-20260704-004', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 16, 'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260704-004', 'old_status' => 'pending',      'new_status' => 'confirmed',   'changed_by' => 12, 'note' => 'Helper chấp nhận.'],
      // Booking 5 — pending
      ['booking_code' => 'BK-20260705-005', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 17, 'note' => 'Khách hàng tạo đơn.'],
      // Booking 6 — cancelled
      ['booking_code' => 'BK-20260706-006', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 4,  'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260706-006', 'old_status' => 'pending',      'new_status' => 'cancelled',   'changed_by' => 4,  'note' => 'Khách hàng hủy đơn.'],
      // Booking 7 — Pet Grooming
      ['booking_code' => 'BK-20260707-007', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 15, 'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260707-007', 'old_status' => 'pending',      'new_status' => 'confirmed',   'changed_by' => 3,  'note' => 'Helper chấp nhận.'],
      ['booking_code' => 'BK-20260707-007', 'old_status' => 'confirmed',    'new_status' => 'completed',   'changed_by' => 3,  'note' => 'Hoàn thành.'],
      // Booking 8 — Weekday Childcare
      ['booking_code' => 'BK-20260708-008', 'old_status' => null,           'new_status' => 'pending',     'changed_by' => 16, 'note' => 'Khách hàng tạo đơn.'],
      ['booking_code' => 'BK-20260708-008', 'old_status' => 'pending',      'new_status' => 'confirmed',   'changed_by' => 10, 'note' => 'Helper chấp nhận.'],
      ['booking_code' => 'BK-20260708-008', 'old_status' => 'confirmed',    'new_status' => 'completed',   'changed_by' => 10, 'note' => 'Hoàn thành.'],
    ];

    $dayOffset = 0;
    foreach ($statusChanges as $sc) {
      $booking = Booking::where('booking_code', $sc['booking_code'])->first();
      if (!$booking) continue;

      BookingStatusHistory::updateOrCreate(
        ['booking_id' => $booking->id, 'new_status' => $sc['new_status']],
        [
          'old_status'  => $sc['old_status'],
          'changed_by'  => $sc['changed_by'],
          'note'        => $sc['note'],
          'created_at'  => Carbon::now()->subDays(15)->addHours($dayOffset++),
        ]
      );
    }

    // Seed Booking Work Logs (for completed bookings)
    $workLogs = [
      ['booking_code' => 'BK-20260701-001', 'helper_id' => 3, 'status' => 'completed'],
      ['booking_code' => 'BK-20260702-002', 'helper_id' => 10, 'status' => 'completed'],
      ['booking_code' => 'BK-20260703-003', 'helper_id' => 11, 'status' => 'completed'],
      ['booking_code' => 'BK-20260707-007', 'helper_id' => 3, 'status' => 'completed'],
      ['booking_code' => 'BK-20260708-008', 'helper_id' => 10, 'status' => 'completed'],
    ];

    foreach ($workLogs as $idx => $wl) {
      $booking = Booking::where('booking_code', $wl['booking_code'])->first();
      if (!$booking) continue;

      $baseDate = Carbon::parse($booking->booking_date . ' ' . $booking->start_time);

      BookingWorkLog::updateOrCreate(
        ['booking_id' => $booking->id, 'helper_id' => $wl['helper_id']],
        [
          'checkin_time'  => $baseDate,
          'checkout_time' => $baseDate->copy()->addHours(4),
          'status'        => $wl['status'],
          'note'          => 'Hoàn thành công việc đúng giờ.',
        ]
      );
    }
  }
}
