<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingStatusHistory extends Model
{
  protected $table = 'booking_status_histories';

  protected $fillable = [
    'booking_id',
    'old_status',
    'new_status',
    'changed_by',
    'note',
    'created_at',
  ];

  public $timestamps = false;

  public function booking()
  {
    return $this->belongsTo(Booking::class, 'booking_id');
  }
}
