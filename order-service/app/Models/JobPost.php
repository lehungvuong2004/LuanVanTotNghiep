<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPost extends Model
{
    protected $table = 'job_posts';

    protected $fillable = [
        'customer_id',
        'category_id',
        'selected_helper_id',
        'title',
        'description',
        'salary',
        'address',
        'district',
        'city',
        'working_time',
        'status',
        'expired_at',
    ];

    public $timestamps = false;

    public function services()
    {
        return $this->hasMany(JobPostService::class, 'job_post_id');
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'job_post_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'job_post_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'job_post_id');
    }
}
