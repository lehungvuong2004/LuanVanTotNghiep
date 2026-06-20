<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPostService extends Model
{
    protected $table = 'job_post_services';

    protected $fillable = [
        'job_post_id',
        'service_id',
    ];

    public $timestamps = false;

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class, 'job_post_id');
    }
}
