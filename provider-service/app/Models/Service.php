<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

  protected $appends = ['image_url'];

  public $timestamps = false;

  public function category()
  {
    return $this->belongsTo(ServiceCategory::class, 'category_id');
  }

  public function helperSkills()
  {
    return $this->hasMany(HelperSkill::class, 'service_id');
  }

  /**
   * Sinh URL công khai cho thuộc tính image từ Filesystem storage mà không làm mất path gốc trong DB.
   */
  public function getImageUrlAttribute(): ?string
  {
    $path = $this->getRawOriginal('image');
    if (!$path) {
      return null;
    }
    if (filter_var($path, FILTER_VALIDATE_URL)) {
      return $path;
    }
    return Storage::url($path);
  }
}
