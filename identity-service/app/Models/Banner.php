<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Banner extends Model
{
  protected $fillable = [
    'title',
    'image',
    'link',
    'status',
    'created_by',
  ];

  protected $appends = ['image_url'];

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
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
