<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
  protected $table = 'customer_addresses';

  protected $fillable = [
    'customer_id',
    'address',
    'district',
    'city',
    'is_default',
  ];

  public $timestamps = false;

  public function customerProfile()
  {
    return $this->belongsTo(CustomerProfile::class, 'customer_id');
  }
}
