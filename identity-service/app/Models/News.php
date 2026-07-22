<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

  protected $appends = ['thumbnail_url'];

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  /**
   * Sinh URL công khai cho thumbnail từ Filesystem storage mà không làm mất path gốc trong DB.
   */
  public function getThumbnailUrlAttribute(): ?string
  {
    $path = $this->getRawOriginal('thumbnail');
    if (!$path) {
      return null;
    }
    if (filter_var($path, FILTER_VALIDATE_URL)) {
      return $path;
    }
    return Storage::url($path);
  }
}
