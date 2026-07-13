<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
  protected $fillable = [
    'title',
    'slug',
    'thumbnail',
    'summary',
    'content',
    'status',
    'created_by',
  ];

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  /**
   * Tự động format path tương đối thành URL tuyệt đối khi lấy thông tin.
   */
  public function getThumbnailAttribute($value)
  {
    if (empty($value)) {
      return $value;
    }
    if (filter_var($value, FILTER_VALIDATE_URL)) {
      return $value;
    }
    return asset($value);
  }
}
