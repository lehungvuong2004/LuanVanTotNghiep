<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $table = 'cities';

    protected $fillable = [
        'name',
    ];

    public $timestamps = false;

    public function districts()
    {
        return $this->hasMany(District::class, 'city_id');
    }
}
