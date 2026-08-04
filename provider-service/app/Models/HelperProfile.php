<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class HelperProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'experience_year',
        'gender',
        'birthday',
        'address',
        'status',
        'rating_avg',
        'total_reviews',
    ];

    public $timestamps = false;
    // nút button cấm đặt lịch trùng
    public static function enrichAvailabilities($helpers)
    {
        if (is_null($helpers)) {
            return;
        }

        $helpersCollection = ($helpers instanceof \Illuminate\Support\Collection || $helpers instanceof \Illuminate\Database\Eloquent\Collection)
            ? $helpers
            : collect([$helpers]);

        $helperIds = $helpersCollection->pluck('id')->filter()->unique()->toArray();
        if (empty($helperIds)) {
            return;
        }

        try {
            $response = Http::timeout(3)
                ->post(env('ORDER_SERVICE_URL', 'http://order-service:8000') . '/api/orders/internal/helpers-busy-bookings', [
                    'helper_ids' => $helperIds
                ]);

            if ($response->successful()) {
                $busyBookingsMap = $response->json('data') ?? [];

                foreach ($helpersCollection as $h) {
                    $busyBookings = $busyBookingsMap[$h->id] ?? [];
                    if (empty($busyBookings)) {
                        continue;
                    }

                    $busyIntervals = [];
                    foreach ($busyBookings as $b) {
                        try {
                            $start = Carbon::parse($b['booking_date'] . ' ' . $b['start_time']);
                            $end = $start->copy()->addMinutes(round($b['duration'] * 60));
                            $busyIntervals[] = [
                                'start' => $start,
                                'end'   => $end
                            ];
                        } catch (\Exception $e) {
                            continue;
                        }
                    }

                    foreach ($h->availabilities as $av) {
                        if ($av->status === 'booked') {
                            continue;
                        }

                        try {
                            $slotStart = Carbon::parse($av->available_date . ' ' . $av->start_time);
                            foreach ($busyIntervals as $int) {
                                if ($slotStart->greaterThanOrEqualTo($int['start']) && $slotStart->lessThan($int['end'])) {
                                    $av->status = 'booked';
                                    break;
                                }
                            }
                        } catch (\Exception $e) {
                            continue;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('enrichAvailabilities error: ' . $e->getMessage());
        }
    }

    public function workingAreas()
    {
        return $this->hasMany(HelperWorkingArea::class, 'helper_id');
    }

    public function verifications()
    {
        return $this->hasMany(HelperVerification::class, 'helper_id');
    }

    public function skills()
    {
        return $this->hasMany(HelperSkill::class, 'helper_id');
    }

    public function availabilities()
    {
        return $this->hasMany(HelperAvailability::class, 'helper_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'helper_id');
    }
}
