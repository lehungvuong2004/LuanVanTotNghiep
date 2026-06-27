<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
  protected $fillable = [
    'title',
    'image',
    'link',
    'status',
    'created_by',
  ];

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }
}
