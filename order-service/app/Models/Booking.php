<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    ];

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
