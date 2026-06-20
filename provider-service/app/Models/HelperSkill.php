<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelperSkill extends Model
{
    protected $table = 'helper_skills';

    protected $fillable = [
        'helper_id',
        'service_id',
    ];

    public $timestamps = false;

    public function helperProfile()
    {
        return $this->belongsTo(HelperProfile::class, 'helper_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
