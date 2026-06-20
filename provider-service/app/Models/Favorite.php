<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = [
        'customer_id',
        'helper_id',
    ];

    public $timestamps = false;

    public function helperProfile()
    {
        return $this->belongsTo(HelperProfile::class, 'helper_id');
    }
}
