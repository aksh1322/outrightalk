<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
	public $timestamps = false;
    protected $table='user_roles';
	protected $fillable = [
        'user_id', 
        'role_id', 
    ];
	
    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

    public function role()
    {
        return $this->hasOne('App\Role', 'id', 'role_id');
    }
}
