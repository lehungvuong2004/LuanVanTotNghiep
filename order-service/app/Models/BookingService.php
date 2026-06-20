<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingService extends Model
{
    protected $table = 'booking_services';

    protected $fillable = [
        'booking_id',
        'service_id',
        'price',
        'duration_hours',
        'quantity',
        'service_order',
        'note',
    ];

    public $timestamps = false;

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
