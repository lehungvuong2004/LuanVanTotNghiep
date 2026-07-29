<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
  protected $table = 'districts';

  protected $fillable = [
    'city_id',
    'name',
  ];

  public $timestamps = false;

  public function city()
  {
    return $this->belongsTo(City::class, 'city_id');
  }
}
