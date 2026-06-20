<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelperWorkingArea extends Model
{
    protected $table = 'helper_working_areas';

    protected $fillable = [
        'helper_id',
        'district',
        'city',
    ];

    public $timestamps = false;

    public function helperProfile()
    {
        return $this->belongsTo(HelperProfile::class, 'helper_id');
    }
}
