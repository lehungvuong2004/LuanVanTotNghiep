<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use App\Models\JobPost;

class Booking extends Model
{
  protected $fillable = [
    'booking_code',
    'customer_id',
    'helper_id',
    'address_id',
    'booking_date',
    'start_time',
    'total_price',
    'status',
    'note',
    'cancel_by',
    'cancel_reason',
    'refund_status',
    'created_at',
  ];

  protected $appends = ['job_post_id'];

  public function getJobPostIdAttribute()
  {
    if (preg_match('/\[Bài tuyển dụng:\s*([^\]]+)\]/', $this->note ?? '', $matches)) {
      $jobTitle = trim($matches[1]);
      $jobPost = JobPost::where('title', $jobTitle)
        ->where('customer_id', $this->customer_id)
        ->first();
      return $jobPost ? $jobPost->id : null;
    }
    return null;
  }


  public static function hasConflict(int $helperId, string $date, string $startTime, int|float $durationHours, ?int $excludeBookingId = null): bool
  {
    if (!$helperId) {
      return false;
    }

    try {
      $start = Carbon::parse($date . ' ' . $startTime);
    } catch (\Exception $e) {
      return false;
    }
    $end = $start->copy()->addMinutes(round($durationHours * 60));

    $query = self::with('services')
      ->where('helper_id', $helperId)
      ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
      ->whereBetween('booking_date', [
        Carbon::parse($date)->subDay()->toDateString(),
        Carbon::parse($date)->addDay()->toDateString()
      ]);

    if ($excludeBookingId) {
      $query->where('id', '!=', $excludeBookingId);
    }

    $existingBookings = $query->get();

    foreach ($existingBookings as $exist) {
      try {
        $existStart = Carbon::parse($exist->booking_date . ' ' . $exist->start_time);
      } catch (\Exception $e) {
        continue;
      }
      $existDuration = $exist->services->sum(function ($s) {
        return $s->duration_hours * ($s->quantity ?? 1);
      }) ?: 2;
      $existEnd = $existStart->copy()->addMinutes(round($existDuration * 60));

      $maxStart = $start->greaterThan($existStart) ? $start : $existStart;
      $minEnd = $end->lessThan($existEnd) ? $end : $existEnd;

      if ($maxStart->lessThan($minEnd)) {
        return true;
      }
    }

    return false;
  }

  public $timestamps = false;

  public function services()
  {
    return $this->hasMany(BookingService::class, 'booking_id');
  }

  public function statusHistories()
  {
    return $this->hasMany(BookingStatusHistory::class, 'booking_id');
  }

  public function workLogs()
  {
    return $this->hasMany(BookingWorkLog::class, 'booking_id');
  }

  public function reviews()
  {
    return $this->hasMany(Review::class, 'booking_id');
  }

  public function reports()
  {
    return $this->hasMany(Report::class, 'booking_id');
  }
}
