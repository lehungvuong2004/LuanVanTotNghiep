<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\JobPost;
use App\Models\JobApplication;
use App\Services\InternalNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CancelExpiredBookings extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'bookings:cancel-expired';

  /**
   * The description of the console command.
   *
   * @var string
   */
  protected $description = 'Automatically cancel pending bookings after 30 minutes of non-payment or inactivity';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Starting checking for expired bookings...');

    // Find bookings in pending status created more than 30 minutes ago
    $expiryTime = Carbon::now()->subMinutes(30);
    $expiredBookings = Booking::where('status', 'pending')
      ->where('created_at', '<', $expiryTime)
      ->get();

    if ($expiredBookings->isEmpty()) {
      $this->info('No expired pending bookings found.');
      return Command::SUCCESS;
    }

    $this->info('Found ' . $expiredBookings->count() . ' expired bookings.');

    foreach ($expiredBookings as $booking) {
      DB::beginTransaction();
      try {
        $oldStatus = $booking->status;
        $booking->status = 'cancelled';
        $booking->cancel_by = 0; // System cancelled
        $booking->cancel_reason = 'Hệ thống tự động hủy do quá thời gian thanh toán (30 phút).';
        $booking->save();

        // Record history
        BookingStatusHistory::create([
          'booking_id' => $booking->id,
          'old_status' => $oldStatus,
          'new_status' => 'cancelled',
          'changed_by' => 0,
          'note'       => 'Hệ thống tự động hủy do hết hạn thanh toán (30 phút).',
        ]);
        // Clear/Reopen job post if this was recruitment booking
        if (preg_match('/\[Bài tuyển dụng:\s*([^\]]+)\]/', $booking->note ?? '', $matches)) {
          $jobTitle = trim($matches[1]);
          $jobPost  = JobPost::where('title', $jobTitle)
            ->where('customer_id', $booking->customer_id)
            ->first();

          if ($jobPost) {
            $jobPost->update([
              'status'             => 'open',
              'selected_helper_id' => null,
            ]);

            // Revert the matching job application
            $jobApplication = JobApplication::where('job_post_id', $jobPost->id)
              ->where('helper_id', $booking->helper_id)
              ->first();

            if ($jobApplication) {
              $jobApplication->update(['status' => 'rejected']);
            }
          }
        }

        // Send notify to Customer
        InternalNotificationService::sendToUser(
          $booking->customer_id,
          'Đơn đặt lịch đã bị tự động hủy',
          "Đơn đặt lịch #{$booking->booking_code} đã bị hủy tự động do quá thời gian thanh toán 30 phút.",
          'booking'
        );

        // Send notify to Helper (if assigned)
        if ($booking->helper_id) {
          InternalNotificationService::sendToUser(
            $booking->helper_id,
            'Đơn đặt lịch đã bị hủy',
            "Đơn đặt lịch #{$booking->booking_code} đã bị hủy do khách hàng không thanh toán trong 30 phút.",
            'booking'
          );
        }

        DB::commit();
        $this->info("Cancelled booking #{$booking->booking_code} successfully.");
      } catch (\Exception $e) {
        DB::rollBack();
        Log::error("Failed to cancel expired booking #{$booking->id}: " . $e->getMessage());
        $this->error("Failed to cancel booking #{$booking->id}. Check logs.");
      }
    }

    $this->info('Finished checking for expired bookings.');
    return Command::SUCCESS;
  }
}
