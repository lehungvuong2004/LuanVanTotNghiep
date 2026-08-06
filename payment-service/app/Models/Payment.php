<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'job_post_id',
        'payment_method',
        'transaction_code',
        'amount',
        'gross_amount',
        'commission_rate',
        'commission_amount',
        'earned_amount',
        'status',
        'paid_at',
        'released_at',
    ];

    public $timestamps = false;

    protected static function booted()
    {
        static::creating(function ($payment) {
            $gross = $payment->amount ?? $payment->gross_amount ?? 0;
            $payment->amount = $gross;
            $payment->gross_amount = $gross;

            // Determine commission fee percentage: Direct booking (BookingId) = 20%, Job Board (JobPostId) = 10%
            $rate = 0;
            if ($payment->booking_id) {
                $rate = 20;
            } elseif ($payment->job_post_id) {
                $rate = 10;
            }

            $payment->commission_rate = $rate;
            $payment->commission_amount = round($gross * ($rate / 100), 2);
            $payment->earned_amount = $gross - $payment->commission_amount;
        });

        static::updating(function ($payment) {
            if ($payment->isDirty('status') && $payment->status === 'completed') {
                $payment->released_at = now();
            }
        });
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class, 'payment_id');
    }
}
