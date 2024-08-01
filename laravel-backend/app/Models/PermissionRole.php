<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Passport\HasApiTokens;

class PermissionRole extends Authenticatable
{
    use HasApiTokens, Notifiable;

    public $timestamps = false;

	protected $fillable = [
        'pid', 
        'rid', 
    ];
}
