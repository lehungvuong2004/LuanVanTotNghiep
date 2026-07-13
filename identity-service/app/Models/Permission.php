<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
  protected $fillable = ['name', 'module', 'description'];

  public $timestamps = false;

  public function roles()
  {
    return $this->belongsToMany(Role::class, 'role_has_permissions', 'permission_id', 'role_id');
  }
}
