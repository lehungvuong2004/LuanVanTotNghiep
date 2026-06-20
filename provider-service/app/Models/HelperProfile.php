<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelperProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'experience_year',
        'gender',
        'birthday',
        'address',
        'status',
        'rating_avg',
        'total_reviews',
    ];

    public $timestamps = false;

    public function workingAreas()
    {
        return $this->hasMany(HelperWorkingArea::class, 'helper_id');
    }

    public function verifications()
    {
        return $this->hasMany(HelperVerification::class, 'helper_id');
    }

    public function skills()
    {
        return $this->hasMany(HelperSkill::class, 'helper_id');
    }

    public function availabilities()
    {
        return $this->hasMany(HelperAvailability::class, 'helper_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'helper_id');
    }
}
