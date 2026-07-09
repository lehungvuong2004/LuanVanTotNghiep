<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
  protected $fillable = [
    'booking_id',
    'job_post_id',
    'customer_id',
    'helper_id',
    'rating',
    'comment',
    'created_at',
  ];

  public $timestamps = false;

  public function booking()
  {
    return $this->belongsTo(Booking::class, 'booking_id');
  }

  public function jobPost()
  {
    return $this->belongsTo(JobPost::class, 'job_post_id');
  }
}
