<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelperVerification extends Model
{
    protected $table = 'helper_verifications';

    protected $fillable = [
        'helper_id',
        'admin_id',
        'status',
        'note',
    ];

    public $timestamps = false;

    public function helperProfile()
    {
        return $this->belongsTo(HelperProfile::class, 'helper_id');
    }
}
