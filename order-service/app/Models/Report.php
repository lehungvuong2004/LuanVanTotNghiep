<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'booking_id',
        'job_post_id',
        'report_by',
        'reported_user_id',
        'reason',
        'status',
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
