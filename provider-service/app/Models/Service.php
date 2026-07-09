<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
  protected $fillable = [
    'category_id',
    'name',
    'description',
    'base_price',
    'price_type',
    'status',
    'image',
  ];

  public $timestamps = false;

  public function category()
  {
    return $this->belongsTo(ServiceCategory::class, 'category_id');
  }

  public function helperSkills()
  {
    return $this->hasMany(HelperSkill::class, 'service_id');
  }
}
