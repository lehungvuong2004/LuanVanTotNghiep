<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingWorkLog extends Model
{
    protected $table = 'booking_work_logs';

    protected $fillable = [
        'booking_id',
        'helper_id',
        'checkin_time',
        'checkout_time',
        'status',
        'note',
    ];

    public $timestamps = false;

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
