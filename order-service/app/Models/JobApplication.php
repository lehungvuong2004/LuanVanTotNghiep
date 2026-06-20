<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $table = 'job_applications';

    protected $fillable = [
        'job_post_id',
        'helper_id',
        'message',
        'proposed_price',
        'status',
    ];

    public $timestamps = false;

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class, 'job_post_id');
    }
}
