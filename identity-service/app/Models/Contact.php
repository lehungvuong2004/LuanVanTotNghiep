<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
  protected $fillable = [
    'full_name',
    'phone',
    'email',
    'message',
    'status',
    'processed_by',
    'processed_at',
  ];

  public $timestamps = false;

  public function processedBy()
  {
    return $this->belongsTo(User::class, 'processed_by');
  }
}
