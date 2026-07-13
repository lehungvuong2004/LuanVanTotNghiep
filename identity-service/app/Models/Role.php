<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
  protected $fillable = ['name', 'description'];

  protected $appends = ['display_name'];

  public function getDisplayNameAttribute()
  {
    $lower = strtolower($this->name);
    if ($lower === 'admin') return 'Quản trị viên';
    if ($lower === 'operator') return 'Nhân viên vận hành';
    if ($lower === 'helper') return 'Người giúp việc';
    if ($lower === 'customer') return 'Khách hàng';
    return $this->description ?: $this->name;
  }

  public function users()
  {
    return $this->hasMany(User::class);
  }

  public function permissions()
  {
    return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
  }
}
