<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'gender',
        'birthday',
        'note',
    ];

    public $timestamps = false; // only updated_at managed by DB/custom

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class, 'customer_id');
    }
}
