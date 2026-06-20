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
        'status',
        'paid_at',
    ];

    public $timestamps = false;

    public function refunds()
    {
        return $this->hasMany(Refund::class, 'payment_id');
    }
}
