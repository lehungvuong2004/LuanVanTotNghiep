<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelperWorkingArea extends Model
{
    protected $table = 'helper_working_areas';

    protected $fillable = [
        'helper_id',
        'city_id',
        'district_id',
    ];

    public $timestamps = false;

    public function helperProfile()
    {
        return $this->belongsTo(HelperProfile::class, 'helper_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }
}
