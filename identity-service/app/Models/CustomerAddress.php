<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
  protected $table = 'customer_addresses';

  protected $fillable = [
    'customer_id',
    'address',
    'city_id',
    'district_id',
    'is_default',
  ];

  public $timestamps = false;

  public function customerProfile()
  {
    return $this->belongsTo(CustomerProfile::class, 'customer_id');
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
