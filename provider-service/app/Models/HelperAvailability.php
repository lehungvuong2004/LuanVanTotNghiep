<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelperAvailability extends Model
{
    protected $table = 'helper_availabilities';

    protected $fillable = [
        'helper_id',
        'available_date',
        'start_time',
        'status',
    ];

    public $timestamps = false;

    public function helperProfile()
    {
        return $this->belongsTo(HelperProfile::class, 'helper_id');
    }
}
